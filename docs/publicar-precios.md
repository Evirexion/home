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
