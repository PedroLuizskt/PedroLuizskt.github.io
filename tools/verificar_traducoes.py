"""Confere a versao em ingles do portfolio.

Verifica:
  1. se data.en.json e um JSON valido e se cada "id" existe no data.json;
  2. se as galerias traduzidas tem o mesmo numero de itens (a sobreposicao e por posicao);
  3. quais textos continuam iguais ao portugues depois da sobreposicao (faltou traduzir?);
  4. se toda chave data-i18n do index.html existe no dicionario UI do app.js, em PT e EN.

Uso (na pasta do site):
    python tools/verificar_traducoes.py
Sai com codigo 1 se encontrar erro; avisos nao interrompem.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CAMPOS_TEXTO = {
    "titulo", "local", "resumo", "descricao", "destaques", "rotulo", "legenda", "aviso", "entregaveis",
    "intro", "texto", "assunto", "nome", "cargo", "vinculo", "periodo", "curso", "instituicao", "idioma", "nivel",
}
# Textos que sao iguais nos dois idiomas por natureza (nomes proprios, siglas, numeros)
IGUAIS_OK = {
    "WebGIS", "AgroDados", "Open Buildings", "Open Buildings Explorer BR", "Brazil Hydro Dynamics",
    "Geospatial Automation Suite", "Forest-Py", "GeoPython Assistant", "Llama-3 via Groq", "ALOS PALSAR RTC",
    "Paraná, Earth Engine App", "EnvironBIT", "Vimef Engenharia", "Instituto Espinhaço", "Pedro Luiz R. Vaz de Melo",
}


def mesclar(base, over):
    if over is None:
        return base
    if isinstance(base, list) and isinstance(over, list):
        if base and isinstance(base[0], dict):
            chave = next((k for k in ("id", "projeto") if k in base[0] and any(isinstance(o, dict) and k in o for o in over)), None)
            if chave:
                idx = {o.get(chave): o for o in over if isinstance(o, dict)}
                return [mesclar(b, idx[b[chave]]) if b.get(chave) in idx else b for b in base]
            return [mesclar(b, over[i]) if i < len(over) and over[i] else b for i, b in enumerate(base)]
        return over
    if isinstance(base, dict) and isinstance(over, dict):
        out = dict(base)
        for k, v in over.items():
            out[k] = mesclar(base[k], v) if k in base else v
        return out
    return over


def textos(no, caminho="", campo=None):
    if isinstance(no, dict):
        for k, v in no.items():
            yield from textos(v, f"{caminho}.{k}" if caminho else k, k)
    elif isinstance(no, list):
        for i, v in enumerate(no):
            rot = v.get("id") if isinstance(v, dict) and "id" in v else i
            yield from textos(v, f"{caminho}[{rot}]", campo)
    elif isinstance(no, str) and campo in CAMPOS_TEXTO:
        yield caminho, no


def main():
    erros, avisos = [], []
    pt = json.loads((RAIZ / "data.json").read_text(encoding="utf-8"))
    try:
        en = json.loads((RAIZ / "data.en.json").read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"[ERRO] data.en.json invalido: {exc}")
        return 1

    ids_pt = {p["id"] for p in pt["projetos"]} | {c["id"] for c in pt["consultorias"]["itens"]}
    ids_en = {p["id"] for p in en.get("projetos", [])} | {c["id"] for c in en.get("consultorias", {}).get("itens", [])}
    for i in sorted(ids_en - ids_pt):
        erros.append(f"id no data.en.json que nao existe no data.json: {i}")
    for i in sorted(ids_pt - ids_en):
        avisos.append(f"projeto sem traducao (aparece em portugues): {i}")

    grupos = [(pt["projetos"], en.get("projetos", [])), (pt["consultorias"]["itens"], en.get("consultorias", {}).get("itens", []))]
    for base, over in grupos:
        idx = {o["id"]: o for o in over}
        for b in base:
            o = idx.get(b["id"])
            if not o or "midia" not in o:
                continue
            nb, no = len(b["midia"].get("galeria", [])), len(o["midia"].get("galeria", []))
            if nb != no:
                erros.append(f"{b['id']}: galeria com {nb} itens no PT e {no} no EN (a ordem precisa bater)")

    final = mesclar(json.loads(json.dumps(pt)), en)
    mapa_pt = dict(textos(pt))
    for cam, txt in textos(final):
        if mapa_pt.get(cam) == txt and txt not in IGUAIS_OK and not re.fullmatch(r"[\d\s.,%+>–-]+", txt):
            avisos.append(f"igual ao portugues: {cam} = {txt[:70]!r}")

    # Tamanhos que mantem os cards alinhados (veja as secoes 2 e 5 do guia)
    for lbl, itens, lim_r in (("projeto", final["projetos"], 170), ("consultoria", final["consultorias"]["itens"], 125)):
        for it in itens:
            if len(it.get("titulo", "")) > 30:
                avisos.append(f"titulo longo em ingles ({len(it['titulo'])} caracteres, pode quebrar a linha): {it['id']}")
            if len(it.get("resumo", "")) > lim_r:
                avisos.append(f"resumo longo em ingles ({len(it['resumo'])} caracteres, o card corta na 3a linha): {it['id']}")
            for e in it.get("entregaveis", []):
                if len(e) > 42:
                    avisos.append(f"entrega longa em ingles ({len(e)} caracteres): {it['id']}: {e}")

    app = (RAIZ / "app.js").read_text(encoding="utf-8")
    html = (RAIZ / "index.html").read_text(encoding="utf-8")
    blocos = {}
    for lang in ("pt", "en"):
        m = re.search(rf"\n  {lang}: \{{(.*?)\n  \}},", app, re.S)
        blocos[lang] = set(re.findall(r"'([\w.]+)':", m.group(1))) if m else set()
    for k in sorted(blocos["pt"] ^ blocos["en"]):
        erros.append(f"chave do dicionario UI so existe em um idioma: {k}")
    usadas = set(re.findall(r'data-i18n="([\w.]+)"', html)) | {c.split(":")[1] for a in re.findall(r'data-i18n-attr="([^"]+)"', html) for c in a.split(";")}
    usadas |= set(re.findall(r"\bt\('([\w.]+)'", app))
    for k in sorted(usadas - blocos["pt"]):
        erros.append(f"chave usada mas ausente no dicionario UI: {k}")

    for a in avisos:
        print(f"[AVISO] {a}")
    for e in erros:
        print(f"[ERRO] {e}")
    if not erros:
        print(f"[OK] traducao consistente: {len(ids_en)} itens traduzidos, {len(blocos['pt'])} textos de interface, {len(avisos)} aviso(s)")
    return 1 if erros else 0


if __name__ == "__main__":
    sys.exit(main())
