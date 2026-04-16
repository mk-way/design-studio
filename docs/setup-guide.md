# MK-Way Design Studio — Guia de Instalação

## O que este sistema faz

```
Designer no Claude.ai
    → Painel Design Studio (design-studio.mkway.netlify.app)
        → GitHub API (github.com/MK-Way/...)
            → GitHub Action dispara
                → Netlify deploy (~30 seg)
                    → Monday board do cliente actualizado com link
                        → Designer clica "Editar no Claude" → volta ao painel
```

---

## Passo 1 — Criar a GitHub OAuth App (10 min)

1. Vai a: `github.com/organizations/MK-Way/settings/applications`
2. **OAuth Apps → New OAuth App**
3. Preenche:
   - **Application name**: MK-Way Design Studio
   - **Homepage URL**: `https://design-studio.mkway.netlify.app`
   - **Authorization callback URL**: `https://design-studio.mkway.netlify.app/oauth/callback`
4. **Register application**
5. Guarda: **Client ID** e gera **Client Secret**

---

## Passo 2 — Criar o repo do painel no GitHub (2 min)

1. Cria repo: `github.com/MK-Way/design-studio`
2. Adiciona todos os ficheiros deste pacote:

```
design-studio/
├── index.html                          ← o painel
├── netlify.toml
├── netlify/
│   └── functions/
│       └── github-oauth.js
├── .github/
│   └── workflows/
│       └── deploy-and-notify.yml       ← só para o repo do painel
└── docs/
    ├── setup-guide.md
    └── monday-setup.md
```

3. No `index.html`, linha ~30, substitui:
   ```javascript
   const clientId = 'SEU_GITHUB_CLIENT_ID';
   ```
   pelo Client ID da OAuth App que acabaste de criar.

---

## Passo 3 — Deploy do painel no Netlify (5 min)

1. Netlify → **New site → Import from Git** → repo `MK-Way/design-studio`
2. Build settings: deixa tudo em branco (site estático + functions)
3. **Site settings → Environment variables**, adiciona:

| Variável              | Valor                                         |
|-----------------------|-----------------------------------------------|
| `GITHUB_CLIENT_ID`    | Client ID da OAuth App                        |
| `GITHUB_CLIENT_SECRET`| Client Secret da OAuth App                   |
| `ALLOWED_ORIGIN`      | `https://design-studio-mkway.netlify.app`     |

4. **Site settings → General → Site name**: muda para `design-studio-mkway`
   (ou configura domínio próprio se quiseres `studio.mkway.pt`)

---

## Passo 4 — Configurar o Monday (15 min)

Segue o guia em `docs/monday-setup.md`.

Resumo:
- Obtém o API token do Monday
- Para cada board de cliente: obtém o Board ID e Group ID
- Cria as colunas na tabela do guia

---

## Passo 5 — Activar um repo de cliente (3 min por repo)

Para cada repo de design na organização MK-Way:

**5a.** Adiciona o ficheiro `.monday.json` na raiz:
```json
{
  "board_id": "ID_DO_BOARD_DO_CLIENTE",
  "group_id": "topics",
  "client": "Nome do Cliente",
  "project": "Nome do Projeto"
}
```

**5b.** Copia `.github/workflows/deploy-and-notify.yml` para o repo

**5c.** Adiciona secrets em **GitHub → Settings → Secrets**:
```
NETLIFY_AUTH_TOKEN   → token Netlify
NETLIFY_SITE_ID      → ID do site Netlify deste repo
MONDAY_API_KEY       → token Monday
```

**5d.** Liga o repo ao Netlify (New site → Import from Git)

**5e.** Faz um push qualquer → verifica o item no Monday ✓

---

## Passo 6 — Dar acesso aos designers (2 min)

1. Convida os designers para a organização `MK-Way` no GitHub
   (não precisam de saber Git — só precisam de ter conta)
2. Partilha o link do painel: `https://design-studio.mkway.netlify.app`
3. Cada designer autentica uma vez com a sua conta GitHub
4. Pronto — podem criar e editar repos sem abrir o terminal

---

## Checklist final

- [ ] OAuth App criada em github.com/organizations/MK-Way/settings/applications
- [ ] Client ID substituído no index.html
- [ ] Repo `MK-Way/design-studio` criado com todos os ficheiros
- [ ] Site Netlify `design-studio-mkway` activo com as 3 env vars
- [ ] Monday API token obtido
- [ ] Pelo menos um repo de cliente com `.monday.json` + Action + secrets + Netlify
- [ ] Teste completo: designer publica → Netlify faz deploy → item aparece no Monday
- [ ] Link "Editar no Claude" no Monday aponta para o painel e abre ficheiro certo

---

## Suporte e manutenção

**Novo cliente** → cria repo → adiciona `.monday.json` → liga ao Netlify → 3 secrets. Cinco minutos.

**Novo designer** → convida para a org MK-Way no GitHub. Trinta segundos.

**Problema de OAuth** → verifica as env vars no Netlify e o callback URL na OAuth App.

**Monday não actualiza** → verifica o `MONDAY_API_KEY` secret no repo e os IDs das colunas no YAML.
