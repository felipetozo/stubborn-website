# Stubborn Connect

Integração bidirecional com o Admin App da Stubborn. Uso interno — permite que o painel consuma dados do próprio site e registre conteúdo publicado.

## Credenciais

| Campo | Valor |
|-------|-------|
| `STUBBORN_CONNECT_KEY` | `sk_stub_zooRzi2VRG4YvB3aupYFVQ` |
| URL base (Admin App) | `https://stubborn.com.br/api/stubborn` |

A env var deve estar presente no `.env.local` (dev) e no Coolify (produção).

## Endpoints a implementar

Criar os três arquivos abaixo seguindo o contrato padrão do Stubborn Connect.

Todas as rotas (exceto `/health`) devem verificar:
```
Authorization: Bearer STUBBORN_CONNECT_KEY
```

### `GET /api/stubborn/health`
```json
{ "ok": true, "client": "stubborn", "version": "1.0" }
```

### `GET /api/stubborn/data`
Retorna dados relevantes do site para o agente de conteúdo do Admin App.

Sugestão para Stubborn: cases recentes, serviços ativos, posts do blog.

```json
{
  "client": "stubborn",
  "updated_at": "2026-05-23T10:00:00Z",
  "data": {
    "cases_recentes": [],
    "servicos": [],
    "posts_recentes": []
  }
}
```

### `POST /api/stubborn/content`
Recebe conteúdo aprovado no Admin App.

```json
{
  "type": "tweet | thread | blog_post",
  "content": "texto do conteúdo",
  "metadata": {},
  "published_at": "2026-05-23T10:00:00Z"
}
```

Salvar em tabela ou arquivo de log.

## Status

🔴 Pendente — endpoints ainda não implementados.
