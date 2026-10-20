#!/bin/bash
# Publica la demostración en bicyrekkord-dev.<subdominio>.workers.dev
# (normalmente lo hace GitHub Actions solo; esto es por si se quiere hacer a mano).
set -e
cd "$(dirname "$0")"
if [ ! -f public/woocommerce.zip ]; then
	curl -fL -o public/woocommerce.zip https://github.com/woocommerce/woocommerce/releases/download/11.2.1/woocommerce.zip
fi
npx --yes wrangler@4 deploy
