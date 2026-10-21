# Portfólio de Pedro Luiz R. Vaz de Melo

Engenheiro florestal e cientista de dados geoespaciais. Portfólio em HTML, CSS
e JavaScript sem framework, em português e inglês, publicado em
[pedroluizskt.github.io](https://pedroluizskt.github.io)
([English version](https://pedroluizskt.github.io/?lang=en)).

## O que tem aqui

- **Português e inglês:** seletor PT/EN no topo, link direto com `?lang=en` e
  escolha lembrada entre visitas. Na primeira visita, o site segue o idioma do
  navegador.
- **Mapas ao vivo:** os WebMaps publicados rodam dentro da página, carregados
  sob demanda.
- **14 projetos e 3 consultorias em cards do mesmo tamanho:** capa 16:10,
  título, resumo, métricas ou entregas e ações sempre alinhados (CSS subgrid).
  O conteúdo completo abre num painel com galeria em alta, vídeo, destaques e
  ferramentas.
- **Consultorias com entregas reais:** pranchas de PCIA e PRADA, mapas de
  declividade EMBRAPA e o WebMap operacional de uma LT, com botão de proposta.
- **Filtros por tema** com contagem nos projetos.
- **Link direto por projeto ou consultoria:** `/#projeto/<id>` (em inglês,
  `/?lang=en#projeto/<id>`).
- **Privacidade:** o site mostra só nome, e-mail, GitHub, LinkedIn e cidade; os
  currículos e as pranchas publicados não têm telefone, CREA nem número de ART.

## Estrutura

```
index.html                 estrutura da página (textos fixos marcados com data-i18n)
style.css                  identidade visual e responsividade
app.js                     renderização, comportamentos e textos da interface (PT e EN)
data.json                  todo o conteúdo em português (fonte principal)
data.en.json               tradução para o inglês, sobreposta ao data.json
GUIA_DE_PERSONALIZACAO.md  passo a passo de edição, tradução e publicação
assets/
  favicon.svg, og-image.jpg
  docs/curriculo_pedro_luiz.pdf     currículo público em português (sem dados pessoais)
  docs/resume_pedro_luiz_en.pdf     currículo público em inglês (sem dados pessoais)
  img/perfil.jpg                    foto da seção Panorama
  projects/<id>/                    cover.jpg, cover-800.jpg, g*.jpg, preview.mp4, demo.gif
  consultorias/<id>/                cover.jpg, cover-800.jpg, g*.jpg, g*-mini.jpg, preview.mp4
tools/
  capturar_midias.js       recaptura capas e vídeos dos WebMaps publicados
  converter_videos.sh      gera MP4, GIF e capas leves
  compor_consultoria.py    monta capa e galeria de uma consultoria a partir das pranchas
  limpar_pdf.py            remove telefone, CREA, ART e metadados de PDFs
  verificar_traducoes.py   confere se a versão em inglês está completa e consistente
```

## Rodar localmente

```bash
python -m http.server 8000
```

Abra `http://localhost:8000` (ou `http://localhost:8000/?lang=en`). Abrir o
`index.html` direto no navegador não carrega o `data.json`.

## Dependências

Nenhuma instalação para o site. Apenas Google Fonts (Fraunces, Inter Tight e
JetBrains Mono) via CDN. As ferramentas em `tools/` usam Playwright, ffmpeg,
Pillow e PyMuPDF, só no seu computador, nunca no site publicado.

## Acessibilidade e desempenho

- Painel em `<dialog>` nativo: foco preso no painel, Esc fecha e o foco volta
  ao card de origem. Setas navegam na galeria.
- O atributo `lang` da página acompanha o idioma escolhido, para leitores de
  tela e tradutores automáticos.
- Foco visível em todos os controles; alvos de toque com pelo menos 40 px.
- `prefers-reduced-motion` desliga a entrada animada e a prévia em vídeo.
- Capas de 800 px nos cards e 1600 px no painel (`srcset`), miniaturas leves
  na galeria das consultorias, carregamento preguiçoso e vídeos MP4 no lugar
  de GIFs. A tradução só é baixada quando alguém escolhe o inglês.

## Licença

Código sob licença MIT (veja `LICENSE`). Os projetos exibidos seguem as
licenças de seus próprios repositórios; as pranchas de consultoria são
entregas técnicas do autor e de seus clientes.
