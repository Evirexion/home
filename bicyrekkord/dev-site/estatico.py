"""Convierte la copia descargada con wget en un sitio estático servible desde Cloudflare.

Uso: python3 estatico.py <carpeta-wget> <origen-http> <carpeta-destino>
"""
import os
import re
import shutil
import sys

origen_dir, origen_url, destino = sys.argv[1], sys.argv[2].rstrip('/'), sys.argv[3]
url_esc = origen_url.replace('/', '\\/')
inyeccion = ('<link rel="preconnect" href="https://playground.wordpress.net">'
             '<script src="/demo-rapida.js" defer></script>')

for raiz, _, archivos in os.walk(origen_dir):
    for nombre in archivos:
        src = os.path.join(raiz, nombre)
        limpio = nombre.split('?')[0]
        rel = os.path.relpath(os.path.join(raiz, limpio), origen_dir)
        dst = os.path.join(destino, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if limpio.endswith(('.html', '.css', '.js', '.json', '.xml')) or limpio == 'index.html':
            with open(src, encoding='utf-8', errors='surrogateescape') as f:
                t = f.read()
            t = t.replace(origen_url, '').replace(url_esc, '')
            if limpio.endswith('.html'):
                t = re.sub(r'</head>', inyeccion + '</head>', t, count=1)
            with open(dst, 'w', encoding='utf-8', errors='surrogateescape') as f:
                f.write(t)
        else:
            shutil.copyfile(src, dst)
print('listo')
