# Guia de personalização (v7.0)

Passo a passo para validar, manter e publicar o portfólio. Quase tudo se edita
em dois arquivos: o `data.json` (conteúdo em português) e o `data.en.json`
(a tradução para o inglês). HTML, CSS e JavaScript só precisam ser tocados
para mudanças de estrutura.

## Sumário

1. Testar localmente
2. Editar as consultorias
3. Dados pessoais: o que foi removido e como manter assim
4. Trocar sua foto
5. Editar ou adicionar um projeto
6. Trocar imagens, vídeos e GIFs
7. Recapturar os WebMaps com o mapa base real
8. Configurar os mapas ao vivo
9. Publicar no GitHub Pages
10. Checklist antes de divulgar
11. Problemas comuns
12. Versão em inglês

---

## 1. Testar localmente

O site carrega o `data.json` via `fetch`, então precisa de um servidor HTTP.
Abrir o `index.html` com duplo clique não funciona.

```bash
cd portfolio-pedro-luiz-v7.0
python -m http.server 8000
```

Abra `http://localhost:8000`. Para testar o celular, use o modo responsivo do
navegador (F12, depois Ctrl+Shift+M). A versão em inglês abre em
`http://localhost:8000/?lang=en` ou pelo seletor PT/EN no topo.

---

## 2. Editar as consultorias

A seção Consultorias usa os mesmos cards dos projetos, com a mesma altura: capa
16:10, local, título, resumo, três entregas e ações. O card abre o painel com a
galeria de pranchas em alta, o texto completo e o botão "Pedir uma proposta".

No `data.json`, a chave `consultorias` tem três partes:

```json
"consultorias": {
  "rascunho": false,
  "intro": "Parágrafo que abre a seção.",
  "itens": [ ... ],
  "cta": { "texto": "Pedir uma proposta", "assunto": "Consultoria: pedido de proposta" }
}
```

Cada item de `itens`:

```json
{
  "id": "consultoria-declividade",
  "titulo": "Declividade e APP por relevo",
  "local": "Minas Gerais, sob demanda",
  "resumo": "Uma frase de até 125 caracteres que aparece no card.",
  "entregaveis": ["Entrega 1", "Entrega 2", "Entrega 3"],
  "descricao": ["Primeiro parágrafo do painel.", "Segundo parágrafo."],
  "destaques": ["Resultado 1", "Resultado 2", "Resultado 3"],
  "metricas": [
    { "valor": "1 m", "rotulo": "LIDAR aerotransportado" },
    { "valor": "12,5 m", "rotulo": "ALOS PALSAR RTC" },
    { "valor": "6", "rotulo": "classes EMBRAPA" }
  ],
  "stack": ["Python", "Rasterio", "GDAL"],
  "midia": {
    "capa": "assets/consultorias/declividade-embrapa/cover.jpg",
    "capaMini": "assets/consultorias/declividade-embrapa/cover-800.jpg",
    "video": null,
    "galeria": [
      { "src": "assets/consultorias/declividade-embrapa/g1.jpg", "mini": "assets/consultorias/declividade-embrapa/g1-mini.jpg", "legenda": "O que a prancha mostra" }
    ]
  }
}
```

Regras que mantêm os cards do mesmo tamanho:

| Campo | Regra |
|---|---|
| `titulo` | até cerca de 28 caracteres, para caber numa linha |
| `resumo` | até cerca de 125 caracteres (o card corta na 3ª linha) |
| `entregaveis` | exatamente 3 itens curtos (até cerca de 42 caracteres) |
| `metricas` | exatamente 3; aparecem só no painel |

Com 3 consultorias a grade fecha numa fileira no desktop. Se adicionar outras,
prefira chegar a 6.

### Adicionar uma consultoria nova com suas pranchas

1. Separe as pranchas (PNG, JPG ou PDF) e confira a seção 3 (sem ART nem dados
   pessoais).
2. Gere capa, galeria e miniaturas no padrão do site:

```bash
pip install pillow
python tools/compor_consultoria.py --id levantamento-app prancha1.png prancha2.pdf prancha3.png
```

A primeira prancha da lista fica na frente da capa. O script imprime o trecho
`midia` pronto para colar no `data.json`; troque as legendas.

3. Copie um item existente de `itens`, troque os textos e cole o `midia` gerado.

Para incluir um vídeo (como o do WebMap da LT), grave a tela, converta com o
comando da seção 6 e aponte `"video"` para o arquivo `preview.mp4`.

---

## 3. Dados pessoais: o que foi removido e como manter assim

Nesta versão, o site mostra apenas nome, e-mail, GitHub, LinkedIn e cidade.

| Onde | O que mudou |
|---|---|
| Site | Telefone e CREA removidos do hero, do contato, do rodapé e do `data.json`; coordenadas arredondadas no nível da cidade, sem marcador no mapa |
| Imagem de compartilhamento | `og-image.jpg` refeita, sem o CREA |
| Currículos em PDF | `curriculo_pedro_luiz.pdf` (português) e `resume_pedro_luiz_en.pdf` (inglês) são versões públicas, geradas sem telefone, idade e CREA; o currículo completo, com esses dados, é só o que você envia direto às empresas |
| Pranchas das consultorias | Número da ART removido das 6 pranchas, porque a consulta pública da ART no CREA leva ao seu registro |

Ao trocar um currículo, use a versão pública (sem telefone, idade e CREA). Se partir
do PDF completo, limpe-o antes de colocá-lo no site:

```bash
pip install pymupdf
python tools/limpar_pdf.py curriculo_novo.pdf assets/docs/curriculo_pedro_luiz.pdf \
  --trecho "(DDD) 9XXXX-XXXX" --trecho "NN anos" --trecho "CREA-MG nº XXXXXXXXX-X" \
  --autor "Pedro Luiz R. Vaz de Melo"
```

Troque os `--trecho` pelos textos exatos que aparecem no PDF novo. O script confere, no
fim, que nenhum termo sobrou. Para o inglês, o destino é
`assets/docs/resume_pedro_luiz_en.pdf` (o caminho fica no `data.en.json`, em
`autor.curriculo`).

Para pranchas em PDF, remova a linha inteira da ART:

```bash
python tools/limpar_pdf.py prancha.pdf prancha_limpa.pdf --linha "ART nº"
```

Para pranchas em PNG, o caminho mais limpo é gerar a figura sem a linha da ART
no seu script de Matplotlib. Se não der, cubra a linha com a cor do quadro
num editor de imagem.

Nomes de clientes e de colegas continuam nas pranchas, como créditos
técnicos. Confirme com a Vimef se pode publicar essas entregas.

---

## 4. Trocar sua foto

Sua foto profissional já está em `assets/img/perfil.jpg`, na seção Panorama.
Para trocar por outra, siga os passos abaixo; se apagar o arquivo, o espaço
some e o texto ocupa a largura toda.

1. Escolha uma foto em proporção 4:5 (retrato), por exemplo 960 x 1200 px.
2. Comprima para menos de 200 KB (squoosh.app, formato MozJPEG, qualidade 78).
3. Salve como `assets/img/perfil.jpg`.

Recarregue a página: o texto passa a dividir espaço com a foto
automaticamente.

---

## 5. Editar ou adicionar um projeto

Os 14 cards de projeto são gerados a partir do array `projetos`. Para
adicionar um, copie um objeto existente e ajuste:

```json
{
  "id": "meu-projeto",
  "titulo": "Nome curto",
  "local": "Área ou escala do estudo",
  "resumo": "Uma frase de até 170 caracteres que aparece no card.",
  "descricao": ["Primeiro parágrafo do painel.", "Segundo parágrafo."],
  "destaques": ["Resultado 1", "Resultado 2", "Resultado 3"],
  "metricas": [
    { "valor": "468", "rotulo": "municípios" },
    { "valor": "+183%", "rotulo": "acima da média" },
    { "valor": "20 anos", "rotulo": "de série" }
  ],
  "tags": ["webgis", "clima"],
  "stack": ["Python", "GeoPandas", "Leaflet.js"],
  "links": { "codigo": "https://github.com/...", "demo": null },
  "midia": {
    "capa": "assets/projects/meu-projeto/cover.jpg",
    "capaMini": "assets/projects/meu-projeto/cover-800.jpg",
    "video": null,
    "galeria": [
      { "src": "assets/projects/meu-projeto/cover.jpg", "legenda": "O que a imagem mostra" }
    ]
  }
}
```

Regras que mantêm a grade uniforme:

| Campo | Regra |
|---|---|
| `titulo` | até cerca de 28 caracteres (uma linha) |
| `resumo` | até cerca de 170 caracteres (o card corta na 3ª linha) |
| `metricas` | exatamente 3; valores curtos (até 10 caracteres) |
| `tags` | a primeira define a cor do card |
| `capa` | 1600 x 1000 px (16:10), mais uma versão `cover-800.jpg` de 800 x 500 |

Tags disponíveis: `webgis` (verde), `clima` (azul), `sr` (sensoriamento remoto,
âmbar), `ml` (machine learning e IA, magenta) e `eng` (engenharia de software,
aço). Os filtros e as contagens são calculados automaticamente e só atuam na
grade de projetos.

A ordem no array é a ordem na grade. Quando a última fileira fica incompleta,
entra no fim um quadro tracejado "Todos os repositórios", do mesmo tamanho dos
cards, que fecha a fileira e leva ao GitHub. Com 14 projetos isso acontece no
desktop (3 colunas); no tablet (2 colunas) a grade já fecha sozinha e o quadro
vira um link simples abaixo dela. Nos filtros, ele também vira link.

Cada projeto e cada consultoria têm link direto:
`pedroluizskt.github.io/#projeto/<id>` abre o painel correspondente. Útil para
mandar a um recrutador ou cliente. Em inglês:
`pedroluizskt.github.io/?lang=en#projeto/<id>`.

Projeto novo também precisa da tradução no `data.en.json`; sem ela, o card
aparece em português na versão em inglês. Veja a seção 12.

---

## 6. Trocar imagens, vídeos e GIFs

| Arquivo | Uso | Especificação |
|---|---|---|
| `cover.jpg` | capa no painel | 1600 x 1000, JPG qualidade 80 |
| `cover-800.jpg` | capa leve usada no card | 800 x 500 |
| `g1.jpg`, `g2.jpg`... | galeria do painel | até 2400 px de largura |
| `g1-mini.jpg`... | miniatura da galeria (opcional) | até 480 px |
| `preview.mp4` | vídeo no hover do card e no painel | 960 x 600, H.264, sem áudio |
| `demo.gif` | não é usado pelo site; serve para seus READMEs | 720 px de largura |

Para converter uma gravação de tela (`gravacao.mp4`) no padrão do site:

```bash
ffmpeg -i gravacao.mp4 -vf "fps=24,scale=960:600:force_original_aspect_ratio=decrease,pad=960:600:(ow-iw)/2:(oh-ih)/2:color=0x0F141B,format=yuv420p" -c:v libx264 -crf 30 -preset slow -movflags +faststart -an preview.mp4
```

Para gerar a capa leve a partir da grande:

```bash
ffmpeg -i cover.jpg -vf scale=800:500 -q:v 4 cover-800.jpg
```

### Trocou um arquivo e o site mostra o antigo?

É o cache do navegador: ele reaproveita imagens e vídeos com o mesmo nome. O
site evita isso com um número de versão na URL de cada arquivo. Sempre que
trocar imagens ou vídeos mantendo o nome:

1. No `data.json`, suba o campo `"versao"` (por exemplo, de `"7.0"` para `"7.1"`).
2. Se mudou `style.css`, `app.js` ou a foto de perfil, troque também o `?v=7.0`
   dessas três linhas no `index.html`.

Para testar na sua máquina sem esperar, recarregue com Ctrl+Shift+R ou abra uma
janela anônima. No GitHub Pages, o cache do próprio servidor dura até cerca de
10 minutos depois do push.

Imagens de fundo claro (mapas impressos, relatórios, interfaces claras) ficam
pousadas sobre a "mesa cartográfica" escura, o que mantém a grade coesa. O
script `tools/compor_consultoria.py` aplica esse tratamento automaticamente.

---

## 7. Recapturar os WebMaps com o mapa base real

As capturas foram feitas num ambiente sem acesso aos servidores de mapa base.
Por isso algumas mostram fundo liso no lugar do basemap (inclusive o WebMap da
LT 203 kV, cuja base padrão é a imagem de satélite da Esri).

Para refazer os WebMaps publicados com os basemaps reais:

```bash
npm install --no-save playwright
npx playwright install chromium
node tools/capturar_midias.js
bash tools/converter_videos.sh
```

Para refazer só um projeto: `node tools/capturar_midias.js enso-centro-oeste`.

O Open Buildings usa as suas fotos do webmap e o recomendador usa imagens
desenhadas a partir do código; nenhum dos dois entra nesse script. Para trocar
as fotos do Open Buildings, substitua `g1.jpg`, `g2.jpg`, `cover.jpg` e
`cover-800.jpg` em `assets/projects/open-buildings-explorer-br/`.

O WebMap da LT 203 kV, a Chuva extrema e o GeoPython usam as suas gravações e
capturas oficiais e ficam fora desse script, para não serem sobrescritos.

---

## 8. Configurar os mapas ao vivo

A chave `aoVivo` define as abas da seção. Cada item aponta para um projeto
(usa a capa dele como prévia) e para a URL publicada:

```json
{ "projeto": "enso-centro-oeste", "rotulo": "ENSO no Centro-Oeste",
  "url": "https://pedroluizskt.github.io/enso-centro-oeste/", "aviso": "Carrega cerca de 2 MB." }
```

O mapa só carrega quando o visitante clica em "Carregar mapa interativo". O de
Florestas Públicas baixa cerca de 85 MB; mantenha o `aviso` honesto sobre o
peso. No `data.en.json`, cada aba traduzida repete o `projeto` e traz só o
`rotulo` e o `aviso` em inglês. Os WebMaps em si continuam no idioma em que
foram publicados.

Os WebMaps de consultoria são entregas a clientes e não entram como mapa ao
vivo; no site aparecem só em imagens e vídeo.

---

## 9. Publicar no GitHub Pages

O site já está publicado. Para subir uma atualização, basta copiar os arquivos
novos para a pasta do repositório e rodar:

```bash
git add -A
git commit -m "feat: portfolio v7.0 com versao em ingles"
git push
```

Para publicar do zero num repositório novo:

1. Crie o repositório com o nome exato `PedroLuizskt.github.io`, público e sem
   README inicial.
2. Na pasta do portfólio:

```bash
git init
git add .
git commit -m "feat: portfolio v7.0"
git branch -M main
git remote add origin https://github.com/PedroLuizskt/PedroLuizskt.github.io.git
git push -u origin main
```

3. No GitHub: Settings, Pages, Source "Deploy from a branch", branch `main`,
   pasta `/ (root)`.

Em 1 a 2 minutos o site fica em `https://pedroluizskt.github.io`. Os sites dos
outros projetos continuam funcionando normalmente.

A pasta `tools/` não é carregada pelo site. Pode ficar no repositório ou sair.

---

## 10. Checklist antes de divulgar

- [ ] Textos das consultorias revisados (escritos a partir das pranchas)
- [ ] Vimef de acordo com a publicação das pranchas e do WebMap da LT
- [ ] Currículos em `assets/docs/` (PT e EN) são as versões públicas mais recentes, sem telefone e CREA
- [ ] `python tools/verificar_traducoes.py` termina com `[OK]`
- [ ] Versão em inglês conferida em `?lang=en`: seletor PT/EN, painéis e botão do currículo
- [ ] Todos os links "Código" e "Demo" abrem
- [ ] Testado no celular: menu, filtros, painéis de projeto e de consultoria
- [ ] Prévia de compartilhamento testada em opengraph.xyz após publicar

---

## 11. Problemas comuns

**"Os projetos não carregaram."** O site foi aberto com `file://`. Use o
servidor da seção 1.

**Mudei o `data.json` e nada mudou.** Recarregue sem cache: Ctrl+Shift+R.

**Um card ficou mais alto que os outros.** Confira as regras de tamanho das
seções 2 e 5: título longo demais (quebra em duas linhas) ou mais de três
itens em `entregaveis` ou `metricas`. Firefox ou Safari muito antigos, sem
suporte a subgrid, também podem desalinhar.

**O vídeo não toca no hover.** A prévia só roda em dispositivos com mouse e
quando o sistema não pede movimento reduzido. No painel, o vídeo sempre tem
controles.

**O JSON quebrou.** Cole o conteúdo em jsonlint.com: o erro mais comum é
vírgula sobrando no último item de uma lista.

---

## 12. Versão em inglês

O site tem dois idiomas. O seletor PT/EN fica no topo, ao lado do menu, e
também funciona pelo endereço:

| Endereço | Idioma |
|---|---|
| `pedroluizskt.github.io/?lang=pt` | português |
| `pedroluizskt.github.io/?lang=en` | inglês |
| `pedroluizskt.github.io/` | o último escolhido pelo visitante; na primeira visita, o idioma do navegador (português para quem usa português, inglês para os demais) |

Use o link com `?lang=en` quando for mandar o portfólio para uma vaga no
exterior.

### Onde ficam os textos

| Arquivo | O que tem |
|---|---|
| `data.json` | todo o conteúdo em português, imagens, links e vídeos (fonte principal) |
| `data.en.json` | só os textos em inglês: títulos, resumos, descrições, destaques, métricas, legendas, mapas ao vivo, consultorias, camadas, trajeto, formação e idiomas |
| `app.js`, objeto `UI` | textos fixos da interface (menu, botões, títulos de seção), em `pt` e `en` |
| `index.html` | o texto em português de cada elemento fixo, marcado com `data-i18n="chave"` |

O `data.en.json` não repete imagens nem links: ele se sobrepõe ao `data.json`.
Projetos e consultorias se casam pelo `id`; abas dos mapas ao vivo, pelo
`projeto`; as demais listas (galeria, métricas, experiência), pela posição.
Por isso a galeria traduzida precisa ter o mesmo número de legendas, na mesma
ordem. Listas de textos simples, como `destaques`, `entregaveis` e `stack`,
são trocadas inteiras. Campo que não aparece no `data.en.json` continua em
português.

### Traduzir um projeto novo

Depois de criar o projeto no `data.json` (seção 5), acrescente no
`data.en.json`, dentro de `projetos`:

```json
{
  "id": "meu-projeto",
  "titulo": "Short name",
  "local": "Study area or scale",
  "resumo": "One sentence of up to 170 characters shown on the card.",
  "descricao": ["First paragraph of the panel.", "Second paragraph."],
  "destaques": ["Result 1", "Result 2", "Result 3"],
  "metricas": [
    { "valor": "468", "rotulo": "municipalities" },
    { "valor": "+183%", "rotulo": "above the mean" },
    { "valor": "20 years", "rotulo": "of data" }
  ],
  "midia": {
    "galeria": [
      { "legenda": "What the image shows" }
    ]
  }
}
```

Em inglês, números usam ponto como separador decimal e vírgula como separador
de milhar: `339,8` vira `339.8` e `20.829` vira `20,829`. Por isso o `valor` das
métricas também entra na tradução quando tiver número com vírgula ou ponto.

Se o `stack` tiver algo em português (como "SQL espacial"), repita a lista
inteira traduzida no `data.en.json`.

### Conferir a tradução

```bash
python tools/verificar_traducoes.py
```

O script aponta `id` que não existe no `data.json`, galeria com número de
legendas diferente, textos que ficaram iguais ao português e chaves de
interface que faltam em um dos idiomas. Ele termina com `[OK]` quando está
tudo consistente.

### Textos fixos da interface

Para mudar um texto fixo (por exemplo, o parágrafo do Panorama), edite a mesma
chave nos dois blocos do objeto `UI`, no início do `app.js` (`pt` e `en`), e o
texto em português correspondente no `index.html`. Para um elemento novo,
coloque `data-i18n="secao.chave"` no HTML e crie a chave nos dois idiomas.

