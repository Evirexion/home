#!/bin/bash
# Publica el sitio de demostración en https://dev-bicyrekkord.evirexion.com
# Uso (en la Terminal del Mac):  ./bicyrekkord/dev-site/desplegar.sh
set -e
cd "$(dirname "$0")"
../build.sh
cp ../dist/bicyrekkord.zip ../dist/brk-operaciones.zip ../dist/brk-demo.zip public/
if [ ! -f public/woocommerce.zip ]; then
	echo "Descargando WooCommerce 11.2.1…"
	curl -fL -o public/woocommerce.zip https://github.com/woocommerce/woocommerce/releases/download/11.2.1/woocommerce.zip
fi
npx --yes wrangler@4 deploy
