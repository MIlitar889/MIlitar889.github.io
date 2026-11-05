# Descarga las imágenes del sitio a assets/fotos. Requiere Python 3. Se corre con:  python tools/descargar_fotos.py
import json, os, urllib.request
base = os.path.dirname(os.path.abspath(__file__))
datos = json.load(open(os.path.join(base, "..", "data", "referencia", "sitio-extraido.json"), encoding="utf-8"))
destino = os.path.join(base, "..", "assets", "fotos")
os.makedirs(destino, exist_ok=True)
for i in datos["imagenes_a_respaldar"]:
    ruta = os.path.join(destino, i["archivo_sugerido"])
    try:
        req = urllib.request.Request(i["url"], headers={"User-Agent": "Mozilla/5.0"})
        open(ruta, "wb").write(urllib.request.urlopen(req, timeout=30).read())
        print("OK    ", i["archivo_sugerido"])
    except Exception as e:
        print("FALLÓ ", i["archivo_sugerido"], e)
