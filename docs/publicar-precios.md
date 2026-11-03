# Guía de precios — publicar desde el Google Sheet

El Sheet `EVirexion_Guia_de_Precios` es la fuente de verdad. Editas el Sheet,
abres el menú **E-Virexion › Publicar precios en la web**, revisas el resumen
(nuevos / con cambios / se quitarán / filas con problemas) y confirmas. La
página `/prices` cambia al instante: no hay que reconstruir ni desplegar.

```
Google Sheet ──(Apps Script, menú E-Virexion)──> POST /api/prices/publish ──> Cloudflare KV ──> /prices
                 1º simula y muestra cambios        clave PRICES_PUBLISH_SECRET    (PRICES_KV)    (se lee en cada visita)
                 2º publica si confirmas
```

El Sheet sigue privado: es el Sheet el que envía los datos a la web, la web no
lee el Sheet. No hace falta Google Cloud, cuenta de servicio ni Sanity.

## Varios países

Cada país es **una pestaña** del mismo Sheet, con el mismo formato que Colombia
(fila de encabezados con `Marca` y `Modelo`, filas de marca, etc.). El botón
publica todas las pestañas de país a la vez y la web muestra un selector
Colombia / México / Brasil / Perú en `/prices` (`/prices?pais=mexico`).

- **Cómo reconoce el país:** por el nombre de la pestaña (`Colombia`, `México`,
  `Brasil`, `Perú`, `Argentina`, `Chile`; con o sin tilde, p. ej. "Guía Brasil").
  Si el nombre no lo dice, mira el título de las filas 1–2 (así la pestaña
  original "Guía de Precios" se reconoce como Colombia).
- **Se ignoran solas:** pestañas sin encabezados `Marca` + `Modelo`, y las que
  empiezan por "Notas", "Marcas", "Copia", "Backup" o "Respaldo".
- **Moneda:** un `$` solo es la moneda del país (COP, MXN, ARS, CLP). Se respeta
  lo escrito en la celda: `US$ 19.990`, `S/ 1.400`, `R$ 118.990`. En Perú los
  carros quedan en US$ y las motos en S/, cada uno con su símbolo.
- **Formato del número:** Colombia sigue aceptando `$79M – $85M`. Los demás
  países se escriben completos (`$1,606,900`, `R$ 118.990`).
- **Precio usado:** opcional. Si la pestaña no tiene columna "Usado", la web
  muestra N/D.
- Solo se publican los países que cambiaron; "Deshacer" restaura los países de
  la última publicación.
- Para agregar un país nuevo (Argentina, Chile ya están previstos): crea su
  pestaña y publica. Otro país distinto requiere añadirlo en `src/lib/countries.ts`.

**Después de este cambio hay que volver a pegar `docs/apps-script/PublicarPrecios.gs`
en Extensiones › Apps Script** (la versión anterior solo publicaba una pestaña).

## Activación (una sola vez)

En la Terminal del Mac:

```bash
cd ~/evirexion-website
git pull
npm install
npx wrangler login                       # abre el navegador; entra con Evirexion@gmail.com
npm run deploy                           # crea PRICES_KV automáticamente y publica el código
openssl rand -hex 32 | tee /dev/tty | npx wrangler secret put PRICES_PUBLISH_SECRET
```

El último comando imprime la clave y la guarda en Cloudflare. **Cópiala.**

En el Google Sheet:

1. **Extensiones › Apps Script**.
2. Borra lo que haya en `Código.gs` y pega todo `docs/apps-script/PublicarPrecios.gs`. Guarda (⌘S).
3. Vuelve al Sheet y recarga la página. Aparece el menú **E-Virexion**.
4. **E-Virexion › Configurar conexión** → pega la clave → en la dirección deja vacío
   (usa `https://e-virexion.evirexion.workers.dev`) o escribe `https://evirexion.com`
   cuando el dominio ya apunte al sitio nuevo.
5. La primera vez Google pide autorizar el script (“Esta app no está verificada” →
   Configuración avanzada → Ir a … → Permitir). Es tu propio script.

## Menú

| Opción | Qué hace |
| --- | --- |
| Publicar precios en la web | Simula, muestra el resumen y publica si dices Sí |
| Ver cambios sin publicar | Solo muestra el resumen |
| Deshacer última publicación | Vuelve a la versión anterior |
| Configurar conexión | Clave y dirección de la web |

## Reglas de lectura

Las mismas de `src/lib/vehicleSheet.ts`: columnas por nombre de encabezado, una
fila es vehículo solo si tiene Marca **y** Modelo, filas de marca y vacías se
ignoran, categoría desconocida o repetidos se reportan como “Filas que NO se
publicarán”. Precios en formato `$79M – $85M`, `$2.1M` o `N/D`.

Seguridad: si una publicación dejaría menos de la mitad de los vehículos
actuales, el Sheet pide una segunda confirmación.

## Problemas

| Mensaje | Arreglo |
| --- | --- |
| Clave de publicación incorrecta | Reconfigura la clave en el Sheet o vuelve a correr el `wrangler secret put` |
| PRICES_PUBLISH_SECRET no está configurada | Falta el `wrangler secret put` |
| PRICES_KV no está conectado | Vuelve a correr `npm run deploy` |
| La web respondió algo inesperado (404) | La dirección configurada no tiene la versión nueva desplegada |
