"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronLeft, ChevronRight, UploadCloud, X } from "lucide-react";
import { uploadPhoto } from "@/app/actions/photo-actions";
import { t, type Lang } from "@/lib/i18n";
import type { PhotoView } from "@/lib/serialize";

const SWIPE_THRESHOLD = 50; // px of horizontal travel to count as a swipe

export function GallerySection({
  invitationId,
  photos,
  allowUpload,
  lang,
  preview = false,
}: {
  invitationId: string;
  photos: PhotoView[];
  allowUpload: boolean;
  lang: Lang;
  preview?: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError(t("gallery.choose", lang));
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name);
    startTransition(async () => {
      const res = await uploadPhoto(invitationId, fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setDone(true);
        setName("");
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      }
    });
  }

  const zoomed = zoomedIndex !== null ? photos[zoomedIndex] : null;

  const goTo = useCallback(
    (delta: number) => {
      if (photos.length === 0) return;
      setZoomedIndex((i) => {
        if (i === null) return i;
        return (i + delta + photos.length) % photos.length;
      });
    },
    [photos.length],
  );

  const close = useCallback(() => setZoomedIndex(null), []);

  // Keyboard: arrows navigate, Escape closes. Only active while open.
  useEffect(() => {
    if (zoomedIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") goTo(-1);
      else if (e.key === "ArrowRight") goTo(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomedIndex, goTo, close]);

  // Preload the neighbours' full-size images so swiping feels instant.
  useEffect(() => {
    if (zoomedIndex === null || photos.length < 2) return;
    const urls = [photos[(zoomedIndex + 1) % photos.length].url];
    if (photos.length > 2) urls.push(photos[(zoomedIndex - 1 + photos.length) % photos.length].url);
    for (const url of urls) {
      const img = new Image();
      img.src = url;
    }
  }, [zoomedIndex, photos]);

  // Swipe gestures (mobile). Tracks horizontal travel across the overlay.
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Only treat it as a swipe when the horizontal movement dominates, so
    // vertical page scrolling inside the overlay still works.
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goTo(1);
      else goTo(-1);
    }
  }

  return (
    <div>
      <div className="mb-5 text-center">
        <Camera className="mx-auto mb-2 h-6 w-6" style={{ color: "var(--c-primary)" }} />
        <h3
          className="text-2xl font-semibold"
          style={{ color: "var(--c-text)", fontFamily: "var(--c-font-heading)" }}
        >
          {t("photo.title", lang)}
        </h3>
        <p className="mt-1 text-sm opacity-60">{t("gallery.uploadHint", lang)}</p>
      </div>

      {photos.length === 0 ? (
        <p className="rounded-xl px-4 py-6 text-center text-sm opacity-50" style={{ backgroundColor: "var(--c-surface)" }}>
          {t("photos.empty", lang)}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, i) => (
            <figure key={photo.id} className="overflow-hidden rounded-xl shadow-sm" style={{ backgroundColor: "var(--c-surface)" }}>
              <button
                type="button"
                onClick={() => setZoomedIndex(i)}
                className="block w-full cursor-zoom-in"
                aria-label={photo.caption ?? "gallery photo"}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- gallery images are object-storage URLs */}
                <img
                  src={photo.thumbUrl ?? photo.url}
                  alt={photo.caption ?? "gallery photo"}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </button>
              {photo.guestName && (
                <figcaption className="px-2 py-1.5 text-[11px] opacity-60">
                  {t("gallery.byGuest", lang)} {photo.guestName}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {/* Full-size lightbox */}
      {zoomed && zoomedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/85 p-4 backdrop-blur-sm"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Top bar: close + counter */}
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between pb-3">
            <button
              type="button"
              onClick={close}
              className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium tabular-nums text-white/70">
              {zoomedIndex + 1} / {photos.length}
            </span>
            <span className="w-9" />
          </div>

          {/* Image area: swipe + click on backdrop to close */}
          <div
            className="relative mx-auto flex w-full max-w-3xl flex-1 items-center justify-center"
            onClick={close}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(-1);
              }}
              disabled={photos.length < 2}
              className="absolute left-0 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 disabled:opacity-0 sm:left-2"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element -- lightbox shows full-size object-storage images */}
              <img
                key={zoomed.id}
                src={zoomed.url}
                alt={zoomed.caption ?? "gallery photo"}
                className="animate-lightbox-in max-h-[75vh] w-auto rounded-xl shadow-2xl"
              />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(1);
              }}
              disabled={photos.length < 2}
              className="absolute right-0 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 disabled:opacity-0 sm:right-2"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Caption / guest name */}
          <div className="mx-auto w-full max-w-3xl pt-3 text-center">
            {zoomed.guestName && (
              <p className="text-sm text-white/60">
                {t("gallery.byGuest", lang)} {zoomed.guestName}
              </p>
            )}
            {photos.length > 1 && (
              <p className="mt-1 text-xs text-white/40">
                {t("gallery.swipeHint", lang)}
              </p>
            )}
          </div>
        </div>
      )}

      {allowUpload && !preview && (
        <form
          onSubmit={submit}
          className="mt-5 rounded-2xl p-5"
          style={{ backgroundColor: "var(--c-surface)", border: "1px solid color-mix(in srgb, var(--c-primary) 15%, transparent)" }}
        >
          <p className="mb-3 flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--c-text)" }}>
            <UploadCloud className="h-4 w-4" style={{ color: "var(--c-primary)" }} />
            {t("gallery.upload", lang)}
          </p>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("gallery.uploadName", lang)}
              required
              className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--c-bg)",
                color: "var(--c-text)",
                borderColor: "color-mix(in srgb, var(--c-primary) 25%, transparent)",
              }}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required
              className="w-full text-sm"
              style={{ color: "var(--c-text)" }}
            />
          </div>
          {error && (
            <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "color-mix(in srgb, #ef4444 12%, transparent)", color: "#b91c1c" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ backgroundColor: "var(--c-primary)" }}
          >
            {pending ? t("gallery.uploading", lang) : done ? t("gallery.uploaded", lang) : t("gallery.uploadBtn", lang)}
          </button>
        </form>
      )}
    </div>
  );
}
