import { NextRequest } from "next/server";

// Proxy da foto: evita bloqueio de CORS/hotlink e só aceita o domínio do TSE.
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("u") || "";
  if (!url.startsWith("https://divulgacandcontas.tse.jus.br/")) return new Response("URL inválida", { status: 400 });
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 86400 } });
  if (!r.ok) return new Response("Foto indisponível", { status: 404 });
  return new Response(await r.arrayBuffer(), {
    headers: { "Content-Type": r.headers.get("content-type") || "image/jpeg", "Cache-Control": "public, max-age=86400" },
  });
}
