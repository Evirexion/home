#!/bin/bash
# Construye los ZIP en ./dist:
#   bicyrekkord.zip      → tema (se sube en Apariencia › Temas › Añadir nuevo)
#   brk-operaciones.zip  → plugin (se sube en Plugins › Añadir nuevo)
#   brk-demo.zip         → solo para el sitio de demostración (productos, cuentas y pedidos de prueba)
set -e
RAIZ="$(cd "$(dirname "$0")" && pwd)"
DIST="$RAIZ/dist"
mkdir -p "$DIST"
rm -f "$DIST/bicyrekkord.zip" "$DIST/brk-operaciones.zip" "$DIST/brk-demo.zip"
cd "$RAIZ/src"
zip -qr "$DIST/bicyrekkord.zip" bicyrekkord -x '*.DS_Store'
zip -qr "$DIST/brk-operaciones.zip" brk-operaciones -x '*.DS_Store'
zip -qr "$DIST/brk-demo.zip" brk-demo -x '*.DS_Store'
TMP="$(mktemp -d)"
mkdir -p "$TMP/mu-plugins"
cp "$RAIZ/src/demo-mu/brk-demo-correos.php" "$TMP/mu-plugins/"
(cd "$TMP" && zip -qr "$DIST/brk-demo.zip" mu-plugins)
rm -rf "$TMP"
ls -la "$DIST"
