#!/bin/bash
# Regenera la demo rápida después de cambiar el tema, el plugin o el contenido de muestra:
#   1. Construye un WordPress con WordPress Playground CLI (tema + plugin + productos + español).
#   2. Guarda ese sitio ya armado en public/snapshot.zip (la demo interactiva /probar/ arranca de ahí).
#   3. Descarga las páginas públicas como sitio estático (abren al instante).
# Requisitos: Node 22+, zip, wget, python3, una carpeta con WordPress 7.1 limpio y los paquetes es_CO
# (languages/) en ../dist/langs.zip.
set -e
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
WP_LIMPIO="${WP_LIMPIO:?Define WP_LIMPIO con la ruta a un WordPress 7.1 sin instalar}"
TMP="$(mktemp -d)"
"$RAIZ/build.sh" >/dev/null
[ -f "$RAIZ/dist/woocommerce.zip" ] || curl -fL -o "$RAIZ/dist/woocommerce.zip" https://github.com/woocommerce/woocommerce/releases/download/11.2.1/woocommerce.zip
(cd "$RAIZ/dist" && python3 -m http.server 8090 >/dev/null 2>&1 & echo $! > "$TMP/http.pid")
cp -r "$WP_LIMPIO" "$TMP/wordpress"
cat > "$TMP/bp.json" <<'JSON'
{ "preferredVersions": { "php": "8.3", "wp": "latest" }, "steps": [
  { "step": "installPlugin", "pluginData": { "resource": "url", "url": "http://localhost:8090/woocommerce.zip" }, "options": { "activate": true } },
  { "step": "installTheme", "themeData": { "resource": "url", "url": "http://localhost:8090/bicyrekkord.zip" }, "options": { "activate": true } },
  { "step": "installPlugin", "pluginData": { "resource": "url", "url": "http://localhost:8090/brk-operaciones.zip" }, "options": { "activate": true } },
  { "step": "unzip", "zipFile": { "resource": "url", "url": "http://localhost:8090/brk-demo.zip" }, "extractToPath": "/wordpress/wp-content" },
  { "step": "unzip", "zipFile": { "resource": "url", "url": "http://localhost:8090/langs.zip" }, "extractToPath": "/wordpress/wp-content" },
  { "step": "runPHP", "code": "<?php require '/wordpress/wp-load.php'; update_option('WPLANG','es_CO'); require WP_CONTENT_DIR . '/brk-demo/seed.php';" }
] }
JSON
npx -y @wp-playground/cli@3.1.60 server --port 9401 --mount-before-install="$TMP/wordpress:/wordpress" \
  --wordpress-install-mode=install-from-existing-files --blueprint="$TMP/bp.json" > "$TMP/pg.log" 2>&1 &
PG=$!
until grep -q Ready "$TMP/pg.log"; do sleep 3; done
mkdir "$TMP/wget" && (cd "$TMP/wget" && wget -q -e robots=off --recursive --level=4 --page-requisites --no-host-directories --no-parent \
  --reject-regex '(/wp-admin|/wp-login|/mi-cuenta|/carrito|/finalizar-compra|add-to-cart|/feed|/wp-json|xmlrpc|/comments|[?&]s=|orderby=|/embed|\?p=|wc-ajax|replytocom)' \
  http://127.0.0.1:9401/ || true)
kill $PG; kill "$(cat "$TMP/http.pid")"; sleep 2
cd "$TMP/wordpress/wp-content" && rm -f "$RAIZ/dev-site/public/snapshot.zip" && \
  zip -qr "$RAIZ/dev-site/public/snapshot.zip" database themes/bicyrekkord plugins/brk-operaciones mu-plugins/brk-demo-correos.php uploads languages -x 'database/.ht.sqlite.lock'
python3 "$RAIZ/dev-site/estatico.py" "$TMP/wget" http://127.0.0.1:9401 "$RAIZ/dev-site/public"
cp "$RAIZ/dev-site/demo-rapida.js" "$RAIZ/dev-site/public/"
rm -rf "$TMP"
echo "Demo regenerada en dev-site/public"
