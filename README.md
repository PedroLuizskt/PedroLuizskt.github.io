# Portfólio de Pedro Luiz R. Vaz de Melo

Engenheiro florestal e cientista de dados geoespaciais. Portfólio em HTML, CSS
e JavaScript sem framework, publicado em
[pedroluizskt.github.io](https://pedroluizskt.github.io).

## O que tem aqui

- **Mapas ao vivo:** os WebMaps publicados rodam dentro da página, carregados
  sob demanda.
- **14 projetos e 3 consultorias em cards do mesmo tamanho:** capa 16:10,
  título, resumo, métricas ou entregas e ações sempre alinhados (CSS subgrid).
  O conteúdo completo abre num painel com galeria em alta, vídeo, destaques e
  ferramentas.
- **Consultorias com entregas reais:** pranchas de PCIA e PRADA, mapas de
  declividade EMBRAPA e o WebMap operacional de uma LT, com botão de proposta.
- **Filtros por tema** com contagem nos projetos.
- **Link direto por projeto ou consultoria:** `/#projeto/<id>`.
- **Privacidade:** o site mostra só nome, e-mail, GitHub, LinkedIn e cidade; o
  currículo e as pranchas publicados não têm telefone, CREA nem número de ART.

## Estrutura

```
index.html                 estrutura da página
style.css                  identidade visual e responsividade
app.js                     renderização e comportamentos
data.json                  todo o conteúdo editável
GUIA_DE_PERSONALIZACAO.md  passo a passo de edição e publicação
assets/
  favicon.svg, og-image.jpg
  docs/curriculo_pedro_luiz.pdf     (versão sem dados pessoais)
  img/perfil.jpg                    (opcional, adicione a sua)
  projects/<id>/                    cover.jpg, cover-800.jpg, g*.jpg, preview.mp4, demo.gif
  consultorias/<id>/                cover.jpg, cover-800.jpg, g*.jpg, g*-mini.jpg, preview.mp4
tools/
  capturar_midias.js       recaptura capas e vídeos dos WebMaps publicados
  converter_videos.sh      gera MP4, GIF e capas leves
  compor_consultoria.py    monta capa e galeria de uma consultoria a partir das pranchas
  limpar_pdf.py            remove telefone, CREA, ART e metadados de PDFs
```

## Rodar localmente

```bash
python -m http.server 8000
```

Abra `http://localhost:8000`. Abrir o `index.html` direto no navegador não
carrega o `data.json`.

## Dependências

Nenhuma instalação para o site. Apenas Google Fonts (Fraunces, Inter Tight e
JetBrains Mono) via CDN. As ferramentas em `tools/` usam Playwright, ffmpeg,
Pillow e PyMuPDF, só no seu computador, nunca no site publicado.

## Acessibilidade e desempenho

- Painel em `<dialog>` nativo: foco preso no painel, Esc fecha e o foco volta
  ao card de origem. Setas navegam na galeria.
- Foco visível em todos os controles; alvos de toque com pelo menos 40 px.
- `prefers-reduced-motion` desliga a entrada animada e a prévia em vídeo.
- Capas de 800 px nos cards e 1600 px no painel (`srcset`), miniaturas leves
  na galeria das consultorias, carregamento preguiçoso e vídeos MP4 no lugar
  de GIFs.

## Licença

Código sob licença MIT (veja `LICENSE`). Os projetos exibidos seguem as
licenças de seus próprios repositórios; as pranchas de consultoria são
entregas técnicas do autor e de seus clientes.
