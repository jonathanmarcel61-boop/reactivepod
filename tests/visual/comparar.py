"""Compara dos carpetas de capturas y dice cuántos píxeles cambian en cada una.
Uso: python3 tests/visual/comparar.py carpetaA carpetaB [--tolerancia N]"""
import sys, os
from PIL import Image, ImageChops

a, b = sys.argv[1], sys.argv[2]
tol = int(sys.argv[sys.argv.index("--tolerancia") + 1]) if "--tolerancia" in sys.argv else 0
distintas = 0
for nombre in sorted(os.listdir(a)):
    if not nombre.endswith(".png"): continue
    pb = os.path.join(b, nombre)
    if not os.path.exists(pb):
        print(f"FALTA   {nombre}"); distintas += 1; continue
    ia, ib = Image.open(os.path.join(a, nombre)).convert("RGB"), Image.open(pb).convert("RGB")
    if ia.size != ib.size:
        print(f"TAMAÑO  {nombre} {ia.size} vs {ib.size}"); distintas += 1; continue
    diff = ImageChops.difference(ia, ib).convert("L").point(lambda v: 255 if v > tol else 0)
    n = sum(1 for v in diff.tobytes() if v)
    total = ia.size[0] * ia.size[1]
    if n:
        distintas += 1
        print(f"CAMBIA  {nombre}: {n} px ({100*n/total:.2f} %)  caja={diff.getbbox()}")
    else:
        print(f"igual   {nombre}")
print("\n%d de %d capturas difieren" % (distintas, len([f for f in os.listdir(a) if f.endswith('.png')])))
sys.exit(1 if distintas else 0)
