# Educacional

Minha trilha de estudo, ensinada em voz alta. Três cadernos — **Economic Science**, **General Knowledge** e **Foreign Language** — organizados como roadmaps, com uma aula gravada e materiais em cada tópico.

## Como o site está organizado

```
index.html          → a página (não precisa mexer)
css/style.css       → o visual (não precisa mexer)
js/app.js           → o funcionamento (não precisa mexer)
data/notebooks.js   → O CONTEÚDO: cadernos, etapas, tópicos, vídeos, materiais
materials/          → PDFs e arquivos de estudo que você quiser guardar no próprio site
```

No dia a dia, **só o `data/notebooks.js` muda**. Tudo o que entra nele aparece no roadmap e na página inicial automaticamente.

## Tarefas comuns

### Adicionar um tópico a uma etapa

Dentro da etapa, na lista `topics`, acrescente uma linha:

```js
topics: [
  { title: "Mathematics" },
  { title: "Statistics" },
  { title: "Data Science" },
  { title: "Novo tópico" }   // ← nova linha (vírgula na linha de cima!)
]
```

Se a etapa ainda não tem `topics`, acrescente o campo:

```js
{ title: "Econometrics", number: "4",
  about: "...",
  topics: [ { title: "Linear regression" } ] },
```

### Vincular uma videoaula

1. Suba o vídeo no YouTube como **Não listado** (não use "Privado": vídeos privados não tocam fora do YouTube).
2. Copie o link e cole no campo `video` do tópico:

```js
{ title: "Mathematics", video: "https://youtu.be/XXXXXXXXXXX" }
```

O player aparece no painel da aula e o tópico passa a mostrar "Lesson recorded" sozinho.

### Anexar materiais

```js
{ title: "Mathematics",
  materials: [
    { label: "Notes, lesson 1 (PDF)", url: "materials/econ/math-notes-1.pdf" },
    { label: "Chiang, ch. 1–3", url: "https://drive.google.com/..." }
  ] }
```

- Arquivo guardado no site: coloque-o na pasta `materials/` e use o caminho relativo.
- Arquivo no Google Drive: compartilhe como "Qualquer pessoa com o link" e cole o link.

### Marcar que está estudando

```js
{ title: "Mathematics", status: "studying" }
```

### Ligar temas entre cadernos

No fim de `data/notebooks.js`, em `CONNECTIONS`:

```js
["econ:Statistics", "general:Biology"]
```

## Publicar (GitHub Pages)

1. No repositório, vá em **Settings → Pages**.
2. Em *Build and deployment*, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
3. Em 1–2 minutos o site fica no ar em `https://goncalesmarcus.github.io/<nome-do-repositório>/`.

Depois disso, cada alteração enviada ao repositório atualiza o site em cerca de um minuto.

## Editar direto pelo GitHub (sem instalar nada)

Abra `data/notebooks.js` no GitHub, clique no lápis (**Edit this file**), faça a alteração e clique em **Commit changes**. Para enviar um PDF, entre na pasta `materials/` e use **Add file → Upload files**.

## Ver no computador antes de publicar

Basta abrir o `index.html` no navegador. (Os vídeos do YouTube podem não tocar quando a página é aberta direto do disco; no site publicado eles funcionam.)
