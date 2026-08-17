"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UploadCloud } from "lucide-react";
import { deletePhoto, uploadPhoto } from "@/app/actions/photo-actions";
import { Button, Spinner } from "@/components/ui";
import type { PhotoView } from "@/lib/serialize";

export function GalleryPanel({
  invitationId,
  photos,
}: {
  invitationId: string;
  photos: PhotoView[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  function upload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUploaded(false);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please choose an image.");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const res = await uploadPhoto(invitationId, fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setUploaded(true);
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deletePhoto(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Gallery photos</h3>
        <p className="mt-1 text-xs text-zinc-400">
          Upload event photos, or switch on guest uploads in the &quot;Sections&quot; tab so guests
          can share their own after the event. Stored in Cloudflare R2 (falls back to local disk
          in development).
        </p>
      </div>

      {photos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-400">
          No photos yet. Upload the first one below.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element -- gallery images are object-storage URLs */}
              <img src={photo.thumbUrl ?? photo.url} alt="" className="aspect-square w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                <span className="truncate text-[10px] font-medium text-white">
                  {photo.guestName ? `${photo.guestName} (guest)` : "Host"}
                </span>
                <button
                  onClick={() => remove(photo.id)}
                  disabled={pending}
                  className="rounded-md bg-white/20 p-1 text-white backdrop-blur hover:bg-red-500"
                  title="Delete photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={upload}
        className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
      >
        <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-zinc-800">
          <UploadCloud className="h-4 w-4 text-rose-600" /> Upload photo
        </h4>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="w-full text-sm text-zinc-600"
        />
        <p className="mt-2 text-xs text-zinc-400">JPG, PNG, WEBP or GIF · max 10 MB</p>
        {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
        {uploaded && <p className="mt-2 text-sm font-medium text-emerald-600">Uploaded ✓</p>}
        <Button type="submit" disabled={pending} className="mt-3">
          {pending && <Spinner />} Upload
        </Button>
      </form>
    </div>
  );
}
