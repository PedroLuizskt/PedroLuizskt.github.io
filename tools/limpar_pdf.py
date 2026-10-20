"""Remove dados pessoais de um PDF de verdade (o texto sai do arquivo, nao so fica coberto).

Requer: pip install pymupdf

Exemplos
--------
Curriculo novo (remove trechos exatos e troca o autor dos metadados):
    python tools/limpar_pdf.py curriculo_original.pdf assets/docs/curriculo_pedro_luiz.pdf \
        --trecho "(DDD) 9XXXX-XXXX" --trecho "NN anos" --trecho "CREA-MG nº XXXXXXXXX-X" \
        --autor "Pedro Luiz R. Vaz de Melo"

Prancha em PDF (remove a linha inteira que contem a ART):
    python tools/limpar_pdf.py prancha.pdf prancha_limpa.pdf --linha "ART nº"

Ao final, o script confere que nenhum termo pedido sobrou no texto do arquivo.
"""
import argparse
import sys

import pymupdf

NONE_IMG = getattr(pymupdf, 'PDF_REDACT_IMAGE_NONE', 0)
NONE_ART = getattr(pymupdf, 'PDF_REDACT_LINE_ART_NONE', 0)


def main():
    ap = argparse.ArgumentParser(description='Remove trechos ou linhas de um PDF e limpa os metadados.')
    ap.add_argument('entrada')
    ap.add_argument('saida')
    ap.add_argument('--trecho', action='append', default=[], help='texto exato a remover (pode repetir)')
    ap.add_argument('--linha', action='append', default=[], help='remove a linha inteira que contem este termo (pode repetir)')
    ap.add_argument('--autor', default='', help='autor gravado nos metadados do arquivo limpo')
    a = ap.parse_args()
    if not a.trecho and not a.linha:
        ap.error('informe ao menos um --trecho ou --linha')

    doc = pymupdf.open(a.entrada)
    total = 0
    for page in doc:
        for t in a.trecho:
            for r in page.search_for(t):
                page.add_redact_annot(r + (-0.5, -0.5, 0.5, 0.5), fill=False)
                total += 1
        if a.linha:
            for b in page.get_text('dict')['blocks']:
                for ln in b.get('lines', []):
                    texto = ''.join(s['text'] for s in ln['spans'])
                    if any(k in texto for k in a.linha):
                        r = pymupdf.Rect(ln['bbox'])
                        # faixa central da linha: nao alcanca as linhas vizinhas
                        page.add_redact_annot(pymupdf.Rect(r.x0 - 1, r.y0 + r.height * 0.3, r.x1 + 1, r.y1 - r.height * 0.3), fill=False)
                        total += 1
        page.apply_redactions(images=NONE_IMG, graphics=NONE_ART)

    doc.scrub(metadata=True, xml_metadata=True, javascript=True, thumbnails=True, embedded_files=True,
              attached_files=True, reset_fields=False, clean_pages=True, hidden_text=True, redactions=True, remove_links=False)
    if a.autor:
        doc.set_metadata({'author': a.autor, 'title': '', 'subject': '', 'keywords': '', 'creator': '', 'producer': ''})
    doc.save(a.saida, garbage=4, deflate=True, clean=True)
    doc.close()

    texto = ''.join(p.get_text() for p in pymupdf.open(a.saida))
    sobrou = [t for t in a.trecho + a.linha if t in texto]
    if sobrou:
        print(f'[ERRO] ainda aparecem no arquivo: {sobrou}')
        sys.exit(1)
    print(f'[OK] {total} ocorrencia(s) removida(s). Arquivo limpo: {a.saida}')


if __name__ == '__main__':
    main()
