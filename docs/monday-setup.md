# Monday.com — Setup MK-Way Design Studio

## Estrutura: um board por cliente/projeto

Cada repo tem um ficheiro `.monday.json` na raiz que diz ao GitHub Action
qual board actualizar. Não precisas de configurar nada por projeto no GitHub —
só adicionas o `.monday.json` ao repo do cliente.

---

## 1. Obter o MONDAY_API_KEY (uma vez, para toda a organização)

1. Monday.com → clica no teu avatar → **Developers**
2. **My Access Tokens** → copia o token
3. Adiciona como secret em cada repo GitHub: `MONDAY_API_KEY`

> Dica: podes criar um token de organização em vez de pessoal, para não depender de uma conta específica.

---

## 2. Estrutura de cada board de cliente

Cria (ou adapta) o board do cliente com estas colunas:

| Coluna          | Tipo no Monday | ID sugerido | O que guarda                     |
|-----------------|----------------|-------------|----------------------------------|
| Nome (título)   | —              | —           | `nome-repo / branch`             |
| Ficheiro        | Texto          | `text`      | Ficheiro principal alterado      |
| Repositório     | Texto          | `text4`     | Nome do repo GitHub              |
| Branch          | Texto          | `text7`     | Branch onde foi publicado        |
| Designer        | Texto          | `text8`     | Username GitHub do designer      |
| Preview         | Link           | `link`      | URL Netlify do deploy            |
| Editar no Claude| Link           | `link4`     | Abre o painel com ficheiro certo |
| Commit          | Link           | `link7`     | Link para o commit no GitHub     |
| Estado          | Status         | `status`    | Publicado / Actualizado / Erro   |
| Data            | Data           | `date4`     | Data do último commit            |

---

## 3. Obter os IDs reais das colunas

Corre esta query na [Monday API Playground](https://monday.com/developers/v2/try-it-yourself):

```graphql
query {
  boards(ids: SEU_BOARD_ID) {
    columns {
      id
      title
      type
    }
  }
}
```

Substitui os IDs `text`, `text4`, `link`, etc. no ficheiro
`.github/workflows/deploy-and-notify.yml` pelos IDs reais que obtiveres.

---

## 4. Obter Board ID e Group ID

**Board ID** — está no URL:
```
https://mkway.monday.com/boards/1234567890
                                 ^^^^^^^^^^
```

**Group ID** — corre esta query:
```graphql
query {
  boards(ids: 1234567890) {
    groups {
      id
      title
    }
  }
}
```

---

## 5. Criar o .monday.json no repo do cliente

Em cada repo de design, cria um ficheiro `.monday.json` na raiz:

```json
{
  "board_id": "1234567890",
  "group_id": "topics",
  "client": "Nome do Cliente",
  "project": "Nome do Projeto"
}
```

O GitHub Action lê este ficheiro automaticamente — não precisas de configurar
nenhum secret adicional por cliente.

---

## 6. Exemplo de item criado no Monday

Depois do primeiro push:

```
Board: Cliente ABC — Design
└── Group: Em curso
    └── landing-cliente-abc / main
          Ficheiro:        index.html
          Repositório:     landing-cliente-abc
          Branch:          main
          Designer:        ana.designer
          Preview:         https://landing-cliente-abc.netlify.app  [link]
          Editar no Claude: https://design-studio.mkway.netlify.app/?repo=MK-Way/landing-cliente-abc&branch=main&file=index.html  [link]
          Estado:          Publicado
          Data:            2025-04-14
```

Quando o designer clica **"Editar no Claude"**, o painel abre directamente
com o ficheiro `index.html` do repo `landing-cliente-abc` na branch `main`
já carregado e pronto a editar.

---

## 7. Re-deploy actualiza o mesmo item

Se o mesmo repo/branch já tem um item no Monday, o Action actualiza-o
em vez de criar um novo. O URL de preview muda se for um deploy de preview
(branch que não é `main`), ou mantém-se o mesmo domínio se for `main`.

---

## 8. Checklist de activação por cliente novo

- [ ] Criar repo `MK-Way/nome-cliente` no GitHub
- [ ] Adicionar `.monday.json` com o board ID do cliente
- [ ] Copiar `.github/workflows/deploy-and-notify.yml` para o repo
- [ ] Configurar secrets no repo: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `MONDAY_API_KEY`
- [ ] Ligar repo ao Netlify (New site → Import from Git)
- [ ] Primeiro push → verificar item no Monday ✓
