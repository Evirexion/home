# Revista digital y cuentas de lectores

## Cómo funciona

- `/revista` lista las ediciones; `/revista/<edición>` es el visor (page-flip).
- Las páginas son imágenes WebP guardadas en Cloudflare KV (`PRICES_KV`) bajo
  `revista:<edición>:<NN>`, en base64. Las sirve `/api/revista/<edición>/<n>`.
- Las primeras `previewPages` páginas son públicas; el resto exige una cuenta
  verificada (`src/data/editions.ts`).
- Cuentas en Cloudflare D1 (`DB`, base `evirexion-cuentas`). Las tablas se crean
  solas la primera vez. Contraseñas con PBKDF2; sesiones y enlaces de correo
  guardados solo como hash.
- Correos (activación y cambio de contraseña) con Resend: `RESEND_API_KEY` y
  `ACCOUNT_FROM_EMAIL`.
- Aviso y política de datos (Ley 1581): `src/lib/legal.ts` y `/privacidad`.
  Cuando haya NIT, llenar `nit` y `legalName` en `src/lib/legal.ts`.

## Subir las páginas de una edición

```bash
npx wrangler kv bulk put revista-upload/revista-2026-10.json --binding PRICES_KV --remote
```

## Nueva edición

1. Exportar el PDF desde Canva.
2. Convertir cada página a WebP de 1100 px de ancho y armar el JSON
   `[{ "key": "revista:<edición>:01", "value": "<base64>" }, …]`.
3. Subirlo con el comando de arriba y agregar la edición en `src/data/editions.ts`.

## Aviso de nuevos lectores y lista de suscriptores

- Cuando un lector activa su cuenta por primera vez llega un aviso a
  `cuentas@evirexion.com` (cambiable con la variable `ACCOUNT_NOTIFY_EMAIL`).
- `/cuenta/suscriptores` muestra la lista y la descarga para Excel. Solo la ven
  los lectores cuyos correos estén en el secreto `ADMIN_EMAILS` (separados por
  coma): `npx wrangler secret put ADMIN_EMAILS`.
