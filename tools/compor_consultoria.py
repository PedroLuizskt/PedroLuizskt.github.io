"""Compoe as imagens de uma consultoria no padrao do site.

Gera em assets/consultorias/<id>/:
  cover.jpg (1600x1000) e cover-800.jpg  -> pranchas em cascata sobre a mesa cartografica
  g1.jpg, g2.jpg, ...                     -> cada prancha em alta (ate 2400 px de largura)
  g1-mini.jpg, g2-mini.jpg, ...           -> miniaturas para o painel

Requer: pip install pillow   (e pdftoppm, do poppler, se passar PDFs)

Exemplo:
    python tools/compor_consultoria.py --id levantamento-app prancha1.png prancha2.pdf prancha3.png

A primeira prancha da lista fica na frente da capa e abre primeiro na galeria.
No fim, o script imprime o trecho "galeria" pronto para colar no data.json.
Antes de publicar, confira se as pranchas nao trazem numero de ART ou outro dado
pessoal (veja tools/limpar_pdf.py e o guia, secao 3).
"""
import argparse
import json
import os
import subprocess
import tempfile

from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 1000
BG, GRID, GRID_MAJOR, BORDER = (15, 20, 27), (24, 31, 41), (31, 40, 53), (46, 56, 72)
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


def carregar(caminho):
    if caminho.lower().endswith('.pdf'):
        base = os.path.join(tempfile.mkdtemp(), 'p')
        subprocess.run(['pdftoppm', '-r', '150', '-png', '-singlefile', '-f', '1', '-l', '1', caminho, base], check=True)
        caminho = base + '.png'
    return Image.open(caminho).convert('RGB')


def mesa():
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    for x in range(0, W, 50):
        d.line([(x, 0), (x, H)], fill=GRID_MAJOR if x % 200 == 0 else GRID)
    for y in range(0, H, 50):
        d.line([(0, y), (W, y)], fill=GRID_MAJOR if y % 200 == 0 else GRID)
    return im


def pousar(canvas, img, box, rot=0):
    x, y, bw, bh = box
    s = min(bw / img.width, bh / img.height)
    nw, nh = int(img.width * s), int(img.height * s)
    framed = Image.new('RGB', (nw + 2, nh + 2), BORDER)
    framed.paste(img.resize((nw, nh), Image.LANCZOS), (1, 1))
    pad = 44
    sombra = Image.new('RGBA', (nw + 2 + pad * 2, nh + 2 + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(sombra).rectangle([pad, pad + 12, pad + nw + 2, pad + nh + 14], fill=(0, 0, 0, 165))
    sombra = sombra.filter(ImageFilter.GaussianBlur(20))
    camada = framed.convert('RGBA')
    if rot:
        sombra = sombra.rotate(rot, expand=True, resample=Image.BICUBIC)
        camada = camada.rotate(rot, expand=True, resample=Image.BICUBIC)
    cx, cy = x + bw // 2, y + bh // 2
    canvas.paste(sombra, (cx - sombra.width // 2, cy - sombra.height // 2), sombra)
    canvas.paste(camada, (cx - camada.width // 2, cy - camada.height // 2), camada)


# posicoes da cascata (de tras para frente) conforme o numero de pranchas
CASCATA = {
    1: [((50, 50, W - 100, H - 100), 0)],
    2: [((60, 50, 1130, 780), 3), ((400, 180, 1130, 780), 0)],
    3: [((70, 40, 1040, 720), 3), ((270, 140, 1040, 720), -2), ((490, 240, 1040, 720), 0)],
}


def main():
    ap = argparse.ArgumentParser(description='Compoe capa e galeria de uma consultoria.')
    ap.add_argument('--id', required=True, help='pasta em assets/consultorias/ (ex.: levantamento-app)')
    ap.add_argument('pranchas', nargs='+', help='PNG, JPG ou PDF; a primeira fica na frente')
    a = ap.parse_args()

    out = os.path.join(RAIZ, 'assets', 'consultorias', a.id)
    os.makedirs(out, exist_ok=True)
    imgs = [carregar(p) for p in a.pranchas]

    capa = mesa()
    frente_primeiro = imgs[:3]
    for (box, rot), img in zip(CASCATA[len(frente_primeiro)], reversed(frente_primeiro)):
        pousar(capa, img, box, rot)
    capa.save(os.path.join(out, 'cover.jpg'), quality=82, optimize=True, progressive=True)
    capa.resize((800, 500), Image.LANCZOS).save(os.path.join(out, 'cover-800.jpg'), quality=78, optimize=True, progressive=True)

    galeria = []
    for i, img in enumerate(imgs, start=1):
        if img.width > 2400:
            img = img.resize((2400, round(img.height * 2400 / img.width)), Image.LANCZOS)
        img.save(os.path.join(out, f'g{i}.jpg'), quality=82, optimize=True, progressive=True)
        mini = img.copy()
        mini.thumbnail((480, 480), Image.LANCZOS)
        mini.save(os.path.join(out, f'g{i}-mini.jpg'), quality=74, optimize=True)
        rel = f'assets/consultorias/{a.id}'
        galeria.append({'src': f'{rel}/g{i}.jpg', 'mini': f'{rel}/g{i}-mini.jpg', 'legenda': '[Descreva esta prancha]'})

    print(f'[OK] imagens salvas em assets/consultorias/{a.id}/')
    print('Cole no data.json, dentro de "midia":')
    print(json.dumps({'capa': f'assets/consultorias/{a.id}/cover.jpg', 'capaMini': f'assets/consultorias/{a.id}/cover-800.jpg',
                      'video': None, 'galeria': galeria}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
