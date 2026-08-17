// Storage abstraction for user-uploaded photos.
//
// Two backends, selected automatically:
//   - Cloudflare R2 (S3-compatible) when R2_* env vars are set
//   - Local disk (.local/uploads) otherwise — handy for development
//
// Serving:
//   - R2 + R2_PUBLIC_URL set        → served directly from Cloudflare (public bucket/CDN)
//   - R2 without R2_PUBLIC_URL      → served through /api/files/[...key] (private bucket proxy)
//   - Local                         → also served through /api/files/[...key] — Next's static
//     server can't serve files added to public/ after startup, so runtime uploads always go
//     through the proxy for identical behavior across backends.

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME;

export const storageBackend: "r2" | "local" =
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET ? "r2" : "local";

let s3Client: S3Client | null = null;

function getS3(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3Client;
}

function localPath(key: string): string {
  // Sanitize each segment so keys can never escape the uploads directory.
  // Dots and dot-dot are dropped entirely (not just non-identifier chars), so
  // keys like "../../.env" can't traverse out of the uploads root.
  const safe = key
    .replace(/^\/+/, "")
    .split("/")
    .map((seg) => seg.replace(/[^a-zA-Z0-9._-]/g, ""))
    .filter((seg) => seg && seg !== "." && seg !== "..")
    .join("/");
  const root = path.resolve(process.cwd(), ".local", "uploads");
  const resolved = path.resolve(root, safe);
  // Defense in depth: the resolved path must stay inside the uploads root.
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error("Invalid storage key");
  }
  return resolved;
}

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  if (storageBackend === "r2") {
    await getS3().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return;
  }
  const filePath = localPath(key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body);
}

export async function getObject(
  key: string,
): Promise<{ body: Buffer; contentType: string }> {
  if (storageBackend === "r2") {
    const res = await getS3().send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    const body = Buffer.from(await res.Body!.transformToByteArray());
    return { body, contentType: res.ContentType ?? "application/octet-stream" };
  }
  return { body: await readFile(localPath(key)), contentType: contentTypeFromKey(key) };
}

export async function deleteObject(key: string): Promise<void> {
  if (storageBackend === "r2") {
    await getS3().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return;
  }
  await rm(localPath(key), { force: true });
}

/** Public URL for a stored object — direct CDN URL or app proxy. */
export function publicUrl(key: string): string {
  if (storageBackend === "r2") {
    const base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
    if (base) return `${base}/${key}`;
  }
  return `/api/files/${key}`;
}

function contentTypeFromKey(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  return map[ext ?? ""] ?? "application/octet-stream";
}
