# Prompt de contexto — Chatbot SaaS Stubborn

> Cole este documento no início de uma nova conversa com o assistente para que ele tenha contexto completo do projeto.

---

## O que é este projeto

Plataforma SaaS de chatbot multi-tenant desenvolvida pela Stubborn. Cada cliente recebe um `clientId` único e instala um widget JS no seu site com uma linha de código. O bot age como SDR inteligente: detecta intenção de compra, qualifica leads coletando nome e telefone de forma conversacional, responde dúvidas ou redireciona para WhatsApp.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js 20 + Express 5 (ESModules) |
| IA | Google Gemini (`gemini-2.5-flash-lite` via `@google/genai`) |
| Banco | PostgreSQL + Prisma 7 (driver adapter `PrismaPg`) |
| Deploy | VPS Hetzner + Coolify (Dockerfile) |
| Repositório | `https://github.com/felipetozo/chatbot-api` |

---

## URLs de produção

| Recurso | URL |
|---------|-----|
| API | `https://chat.stubborn.com.br` |
| Health check | `https://chat.stubborn.com.br/health` |
| Widget JS | `https://chat.stubborn.com.br/widget.js` |

---

## Credenciais e tokens

| Variável | Valor |
|----------|-------|
| `ADMIN_SECRET` | `b0b1ed14f00faeb22c3ce93856dd6d978853d49f2b816362e1673d48a376f062` |
| `GEMINI_API_KEY` | `AIzaSyCJ9QxX69qMqFgScXpjXUxX0KP_jT0O29I` |

> O `ADMIN_SECRET` é usado no header `Authorization: Bearer <token>` em todas as rotas `/admin/*`.

---

## Tenants em produção

| Tenant | clientId | Bot | WhatsApp |
|--------|----------|-----|----------|
| Metal Laran | `cfbb30b0-0562-4c2c-8d35-3422655bb41d` | Lara | 5551999999901 |
| Isoart | `085e54f7-6f88-4da9-879b-ef9443115b39` | Iso | 5551999999902 |
| Gerbraz | `1933a4dc-245a-465d-a793-0a23998136aa` | Ger | 5551999999903 |
| Stubborn | `1701c3b0-d559-43a8-9125-09736459e897` | Stub | 5545991584114 |

> ⚠️ Os números de WhatsApp de Metal Laran, Isoart e Gerbraz são placeholders — precisam ser atualizados com os reais.

---

## Endpoints disponíveis

### Públicos (header `x-client-id` obrigatório)

```
POST /api/chat               — envia mensagem, retorna { reply, action, sessionId, whatsappNumber }
GET  /api/widget/config      — config pública do widget (?clientId=xxx ou header)
POST /api/sessions           — cria/recupera sessão
GET  /api/sessions           — lista sessões de um visitorId (?visitorId=xxx)
POST /api/leads              — salva/atualiza lead manualmente
```

### Admin (header `Authorization: Bearer ADMIN_SECRET`)

```
POST /admin/tenants          — cria tenant
GET  /admin/tenants          — lista todos os tenants
PUT  /admin/tenants/:id      — atualiza tenant e/ou config
GET  /admin/leads            — lista leads (?clientId=xxx opcional)
```

---

## Como instalar o widget em um site

Colar antes do `</body>`:

```html
<script
  src="https://chat.stubborn.com.br/widget.js"
  data-client-id="CLIENT_ID_DO_TENANT"
  data-api-url="https://chat.stubborn.com.br"
  async
></script>
```

### Snippet da Stubborn

```html
<script
  src="https://chat.stubborn.com.br/widget.js"
  data-client-id="1701c3b0-d559-43a8-9125-09736459e897"
  data-api-url="https://chat.stubborn.com.br"
  async
></script>
```

---

## Como testar via curl

```bash
ADMIN_TOKEN="b0b1ed14f00faeb22c3ce93856dd6d978853d49f2b816362e1673d48a376f062"
API="https://chat.stubborn.com.br"
CLIENT_ID="1701c3b0-d559-43a8-9125-09736459e897"  # Stubborn

# Health
curl $API/health

# Chat
curl -X POST $API/api/chat \
  -H "Content-Type: application/json" \
  -H "x-client-id: $CLIENT_ID" \
  -d '{"visitorId":"visitor-001","message":"Oi, quero um site"}'

# Listar leads
curl $API/admin/leads -H "Authorization: Bearer $ADMIN_TOKEN"

# Criar tenant
curl -X POST $API/admin/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"Novo Cliente","slug":"novocliente","config":{"botName":"Bot","primaryColor":"#000000","tone":"casual","whatsappNumber":"5500000000000"}}'

# Atualizar tenant
curl -X PUT $API/admin/tenants/ID_DO_TENANT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"config":{"customPrompt":"Novo prompt aqui","whatsappNumber":"5500000000001"}}'
```

---

## Actions retornadas pelo chat

| Action | Significado | Comportamento no widget |
|--------|-------------|------------------------|
| `none` | Resposta normal | Nenhum |
| `collecting_data` | Bot está coletando nome ou telefone | Nenhum |
| `capture_lead` | Coletou nome E telefone | Exibe formulário de lead |
| `redirect_whatsapp` | Visitante quer humano | Abre WhatsApp em nova aba |

---

## Estrutura de arquivos relevantes

```
src/
├── app.js                    — Express app (trust proxy, CORS, static, rotas)
├── server.js                 — Entry point
├── config/prompt-base.js     — buildSystemPrompt() — system prompt dinâmico
├── lib/
│   ├── claude.js             — Integração Gemini (callClaude é o nome interno)
│   ├── prisma.js             — PrismaClient com PrismaPg adapter
│   └── whatsapp.js           — Stub Evolution API (só loga — fase futura)
├── middlewares/
│   ├── auth.js               — Bearer token
│   ├── identify-tenant.js    — Lê x-client-id / query clientId
│   └── rate-limit.js         — 20 msg/min por IP, 300 req/15min global
└── modules/
    ├── chat/                 — POST /api/chat
    ├── sessions/             — sessões e histórico
    ├── leads/                — captura e listagem de leads
    └── tenants/              — CRUD de tenants
public/
├── widget.js                 — Widget embeddável (vanilla JS, zero deps)
└── test.html                 — Página de teste local (Metal Laran)
prisma/
└── schema.prisma             — Modelos: Tenant, TenantConfig, Session, Message, Lead, Document, Chunk
docs/
├── snippets/tenants.md       — Snippets de instalação por cliente
└── to-do/
    ├── execution_01-log.md   — Log da implementação da API
    ├── execution_02-log.md   — Log do widget + deploy
    └── execution_03.md       — Próxima fase (quando existir)
```

---

## Banco de dados local (desenvolvimento)

```
DATABASE_URL=postgresql://felipetozo@localhost:5432/chatbot
```

Para rodar localmente:
```bash
node src/server.js
# ou
npm run dev
```

Página de teste: `http://localhost:3000/test.html`

---

## O que falta (próximas fases)

| Prioridade | Item |
|------------|------|
| Alta | Instalar widget nos sites dos clientes (snippets em `docs/snippets/tenants.md`) |
| Alta | Atualizar `customPrompt` com informações reais de cada cliente |
| Alta | Atualizar `whatsappNumber` real de Metal Laran, Isoart e Gerbraz |
| Média | Evolution API — notificação real por WhatsApp quando lead é capturado |
| Média | Painel admin para gerenciar tenants e ver leads (admin-app) |
| Baixa | RAG com PDFs — upload de documentos e busca semântica no chat |

---

## Observações importantes

- **Prisma 7**: `url` não vai no `schema.prisma` — vai em `prisma.config.ts` (CLI) e via `PrismaPg` adapter (runtime)
- **ESModules**: projeto usa `"type": "module"` — todos os imports precisam de extensão `.js`
- **`app.set('trust proxy', 1)`**: obrigatório para o `express-rate-limit` funcionar atrás do Traefik no Coolify
- **Dockerfile**: usa `npm ci` (tudo) → `prisma generate` → `npm prune --production` para resolver o problema de devDeps no build
- **Alpine sem curl**: o Dockerfile instala `curl` via `apk add` para o HEALTHCHECK funcionar
- **CORS**: controlado pela variável `ALLOWED_ORIGINS` (separada por vírgulas) — vazia = aceita tudo (dev)
