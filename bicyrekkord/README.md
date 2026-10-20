# Bicyrekkord.com 2026 — tema, plugin y sitio de demostración

Esta carpeta tiene todo lo del sitio nuevo de Bicyrekkord. Vive en este repositorio solo para publicar la demostración en el dominio dev de evirexion. **No afecta a evirexion.com.**

| Carpeta | Qué es |
| --- | --- |
| `src/bicyrekkord/` | **Tema** de WordPress con el diseño nuevo: anillo que se carga, rueda que gira con el scroll, bordes con corriente y Ricardo en la portada. |
| `src/brk-operaciones/` | **Plugin** con cuentas de cliente y de taller, factura electrónica, estados de pedido con seguimiento y el panel «Pedidos BRK». |
| `src/brk-demo/`, `src/demo-mu/` | Solo para la demostración: productos, cuentas y pedidos de prueba, y el visor de correos. **No se instala en bicyrekkord.com.** |
| `dev-site/` | Página que carga WordPress + WooCommerce dentro del navegador (WordPress Playground) y se publica en Cloudflare. |

## Publicar o actualizar la demostración

En la Terminal del Mac, con la sesión de Cloudflare ya iniciada (`npx wrangler login`, la misma que se usa para evirexion.com):

```bash
cd ~/evirexion-website
git fetch origin && git checkout bicyrekkord-web && git pull
./bicyrekkord/dev-site/desplegar.sh
```

La demostración queda en **https://dev-bicyrekkord.evirexion.com**. También queda en la dirección `workers.dev` que muestra Wrangler.

- La primera carga tarda alrededor de un minuto, porque WordPress se instala dentro del navegador.
- Cada recarga vuelve a dejar el sitio en su estado inicial.
- Accesos: `admin` / `password` · `cliente@demo.com` / `demo1234` · `taller@demo.com` / `demo1234`.

## Pasarlo a bicyrekkord.com (cuando se apruebe)

1. Ejecuta `./bicyrekkord/build.sh`. Crea `dist/bicyrekkord.zip` (el tema) y `dist/brk-operaciones.zip` (el plugin).
2. **Haz una copia de seguridad completa** del sitio actual.
3. Sube el plugin en *Plugins › Añadir nuevo › Subir plugin* y actívalo.
4. Sube el tema en *Apariencia › Temas › Añadir nuevo › Subir tema*. Pruébalo primero con *Vista previa* y después actívalo.
5. Revisa estos ajustes:
   - Las páginas *Carrito* y *Finalizar compra* deben usar los shortcodes clásicos `[woocommerce_cart]` y `[woocommerce_checkout]`. La pregunta de factura electrónica se muestra en el checkout clásico.
   - En *Pedidos BRK › Talleres y ajustes*, importa la base de talleres exportada a CSV desde Excel o Google Sheets. Allí también se confirman el correo de contabilidad y las transportadoras.
   - En *Apariencia › Personalizar › Bicyrekkord* se editan los textos de la portada, el video de Ricardo (opcional) y los datos de contacto.
   - En *Apariencia › Menús*, asigna el menú principal y el de políticas.

**Lo que no cambia:** productos, SKUs, descripciones, URLs `/producto/...`, pedidos, clientes, pagos y WPML. El tema y el plugin no tocan esos datos.

## Funciones del plugin

- **Cuentas:** en *Mi cuenta* se elige entre Cliente y Taller. Un taller que ya está en la base de datos se reconoce por su NIT, correo o celular. Si no está, el sitio le exige el NIT o el documento de identidad.
- **Factura electrónica:** el checkout pregunta *¿Necesitas factura electrónica?*. Si la respuesta es «Sí», se piden el documento, la razón social y el correo, y la solicitud llega a **contabilidad@bicyrekkord.com** con el detalle del pedido. Desde el panel se puede reenviar.
- **Seguimiento:** el pedido pasa por Recibido → Alistando → Enviado (con transportadora y guía) → Entregado. El cliente ve la línea de tiempo en *Mi cuenta › Mis pedidos* y recibe un correo en cada paso.
- **Panel «Pedidos BRK»:** cada estado tiene su pestaña con contador y un botón por pedido para pasarlo al siguiente paso. También permite cambiar varios pedidos a la vez y buscar por número, nombre, celular o correo.
