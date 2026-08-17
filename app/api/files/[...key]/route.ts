import { getObject } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * Serves stored images through the app when the bucket isn't public
 * (used when R2 is configured without R2_PUBLIC_URL).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const objectKey = key.join("/");

  try {
    const { body, contentType } = await getObject(objectKey);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
