// Stubborn Connect — autenticação do protocolo de integração com o Admin App.
// Todas as rotas em /api/stubborn verificam o header:
//   Authorization: Bearer ${STUBBORN_CONNECT_KEY}

export function isAuthorized(request: Request): boolean {
  const key = process.env.STUBBORN_CONNECT_KEY;
  if (!key) return false;
  return request.headers.get('Authorization') === `Bearer ${key}`;
}

export const STUBBORN_CLIENT = 'stubborn';
export const STUBBORN_CONNECT_VERSION = '1.0';
