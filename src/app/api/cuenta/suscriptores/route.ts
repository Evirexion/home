import { getCurrentUser, isAdmin, listSubscribers } from "@/lib/accounts";

/** CSV for Excel (UTF-8 BOM + ";" so Excel in Spanish opens it in columns). Admins only. */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!isAdmin(user)) return new Response("No autorizado", { status: 404 });

  const onlyMarketing = new URL(request.url).searchParams.get("filtro") === "novedades";
  const rows = (await listSubscribers()).filter((s) => s.verified && (!onlyMarketing || s.marketingConsent));

  const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const date = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "short", timeStyle: "short" }) : "";
  const lines = [
    ["Nombre", "Correo", "Acepta novedades", "Registro", "Activación", "Versión política"].map(cell).join(";"),
    ...rows.map((s) =>
      [s.name, s.email, s.marketingConsent ? "Sí" : "No", date(s.createdAt), date(s.verifiedAt), s.consentVersion]
        .map(cell)
        .join(";")
    ),
  ];
  const stamp = new Date().toISOString().slice(0, 10);
  const name = `suscriptores-evirexion-${onlyMarketing ? "novedades-" : ""}${stamp}.csv`;
  return new Response(`﻿${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
