# Junta TODO el proyecto (HTML + CSS + JavaScript + QR) en un solo archivo: dist/sushi-puuk.html
# Uso:  python tools/construir_archivo_unico.py
import re, os, glob, base64
raiz = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
leer = lambda r: open(os.path.join(raiz, r), encoding="utf-8").read()
html = leer("index.html")
css = "\n".join(leer(h) for h in re.findall(r'<link rel="stylesheet" href="([^"]+)">', html))
fuentes = re.findall(r'<script src="((?!https?:)[^"]+)"></script>', html)
qr = {}
for f in glob.glob(os.path.join(raiz, "assets", "qr", "mesa-*.png")):
    n = re.search(r"mesa-(\d+)", f).group(1)
    qr[n] = "data:image/png;base64," + base64.b64encode(open(f, "rb").read()).decode()
import json
plantilla = leer("cliente/menu-clientes.template.html")
js = "const QR_DATA = " + json.dumps(qr) + ";\nconst PLANTILLA_MENU_CLIENTES = " + json.dumps(plantilla) + ";\n" + "\n".join(leer(f) for f in fuentes)
js = js.replace("</script", "<\\/script")
out = re.sub(r'<link rel="stylesheet"[^>]+>\n?', "", html)
out = re.sub(r'<script src="(?!https?:)[^"]+"></script>\n?', "", out)
out = out.replace("</head>", "<style>\n" + css + "\n</style>\n</head>", 1)
out = out.replace("</body>", "<script>\n" + js + "\n</script>\n</body>", 1)
os.makedirs(os.path.join(raiz, "dist"), exist_ok=True)
destino = os.path.join(raiz, "dist", "sushi-puuk.html")
open(destino, "w", encoding="utf-8").write(out)
print("Listo:", os.path.normpath(destino), round(len(out) / 1024), "KB")
