import { getCurrentUser } from "@/lib/accounts";
import { getKV } from "@/lib/cloudflare";
import { getEdition, pageKey } from "@/data/editions";

/**
 * Serves one magazine page image. Preview pages are public (and cached at the
 * edge); the rest are only sent to a signed-in, verified reader.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ edicion: string; pagina: string }> }) {
  const { edicion, pagina } = await params;
  const edition = getEdition(edicion);
  const page = Number.parseInt(pagina, 10);
  if (!edition || !Number.isInteger(page) || page < 1 || page > edition.pages) {
    return new Response("No encontrado", { status: 404 });
  }

  const isPreview = page <= edition.previewPages;
  if (!isPreview && !(await getCurrentUser())) {
    return new Response("Inicia sesión para ver esta página", { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  // Stored as base64 text: `wrangler kv bulk put` round-trips text reliably,
  // while raw binary values got mangled into UTF-8 along the way.
  const kv = await getKV();
  const encoded = kv ? await kv.get(pageKey(edition.slug, page), "text") : null;
  if (!encoded) return new Response("Página no disponible", { status: 404 });
  const image = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));

  return new Response(image, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": isPreview ? "public, max-age=86400" : "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
