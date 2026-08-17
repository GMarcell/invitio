"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { canEditInvitation, optionalUser, requireEditAccess } from "@/lib/auth-helpers";
import { deleteObject, putObject } from "@/lib/storage";
import { checkRateLimit, clientIp, rateLimitMessage } from "@/lib/rate-limit";

const THUMB_MAX_WIDTH = 800;
const THUMB_QUALITY = 80;

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

type DetectedImage = { mimeType: string; ext: string };

/**
 * Identify the image format from its magic bytes, not the client-supplied
 * Content-Type (which is trivially spoofable). Returns null for anything that
 * isn't a real JPG/PNG/WEBP/GIF, so arbitrary bytes can't be stored as images.
 */
function detectImageType(buffer: Buffer): DetectedImage | null {
  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mimeType: "image/jpeg", ext: "jpg" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mimeType: "image/png", ext: "png" };
  }
  // WEBP: "RIFF" + 4 size bytes + "WEBP" at offset 8
  if (
    buffer.length >= 12 &&
    buffer.toString("latin1", 0, 4) === "RIFF" &&
    buffer.toString("latin1", 8, 12) === "WEBP"
  ) {
    return { mimeType: "image/webp", ext: "webp" };
  }
  // GIF: "GIF87a" or "GIF89a"
  const head = buffer.toString("latin1", 0, 6);
  if (head === "GIF87a" || head === "GIF89a") {
    return { mimeType: "image/gif", ext: "gif" };
  }
  return null;
}

/**
 * Uploads a photo to the gallery. Hosts (and co-hosts) can always upload;
 * guests can only upload when the invitation has guest uploads enabled and
 * they provide their name.
 */
export async function uploadPhoto(invitationId: string, formData: FormData) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { id: true, slug: true, showGallery: true, allowGuestPhotos: true },
  });
  if (!invitation) return { error: "Invitation not found." };
  if (!invitation.showGallery) return { error: "The gallery is not enabled on this invitation." };

  const user = await optionalUser();
  const isHost = !!user && (await canEditInvitation(invitationId, user));

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Please choose an image to upload." };
  if (file.size > MAX_SIZE) return { error: "Images must be under 10 MB." };

  // Validate by magic bytes — never trust the client-supplied file.type.
  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(buffer);
  if (!detected) {
    return { error: "File contents don't match a supported image (JPG, PNG, WEBP or GIF)." };
  }

  let guestName: string | null = null;
  if (!isHost) {
    if (!invitation.allowGuestPhotos) return { error: "Photo uploads by guests are not enabled." };
    // Throttle guest uploads per invitation + visitor; hosts are not limited
    // (they're authenticated and may legitimately bulk-upload after an event).
    const ip = await clientIp();
    const limit = await checkRateLimit("photoUpload", `${invitationId}:${ip}`);
    if (!limit.ok) return { error: rateLimitMessage(limit.retryAfterSeconds) };
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Please enter your name." };
    guestName = name.slice(0, 120);
  }

  const id = randomUUID();
  const key = `${invitationId}/${id}.${detected.ext}`;
  await putObject(key, buffer, detected.mimeType);

  // Generate a small WebP thumbnail so gallery grids load fast on mobile.
  // If resizing fails (e.g. an exotic but valid image), keep the upload working
  // with just the original — the UI falls back to it.
  let thumbObjectKey: string | null = null;
  try {
    const thumbBuffer = await sharp(buffer)
      .rotate() // honor EXIF orientation from phone photos
      .resize({ width: THUMB_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toBuffer();
    thumbObjectKey = `${invitationId}/thumbs/${id}.webp`;
    await putObject(thumbObjectKey, thumbBuffer, "image/webp");
  } catch (error) {
    console.error("[photos] thumbnail generation failed, storing original only:", error);
  }

  await prisma.photo.create({
    data: {
      invitationId,
      uploadedBy: isHost ? "host" : "guest",
      guestName,
      objectKey: key,
      thumbObjectKey,
      mimeType: detected.mimeType,
      size: file.size,
    },
  });

  revalidatePath(`/i/${invitation.slug}`);
  return { ok: true };
}

export async function deletePhoto(photoId: string) {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return;

  await requireEditAccess(photo.invitationId);

  const invitation = await prisma.invitation.findUnique({
    where: { id: photo.invitationId },
    select: { slug: true },
  });

  await prisma.photo.delete({ where: { id: photoId } });
  await deleteObject(photo.objectKey).catch(() => {
    /* orphaned object is harmless; don't block deletion */
  });
  if (photo.thumbObjectKey) {
    await deleteObject(photo.thumbObjectKey).catch(() => {
      /* orphaned thumbnail is harmless; don't block deletion */
    });
  }

  if (invitation) revalidatePath(`/i/${invitation.slug}`);
  revalidatePath(`/invitations/${photo.invitationId}/edit`);
}
