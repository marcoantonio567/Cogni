# Frontend - Gerenciador de Estudos

Aplicacao cliente independente criada com Vite, React e TypeScript.

## Arquitetura

- O frontend vive em `frontend/`.
- O backend Django API vive em `backend/`.
- O frontend consome apenas a API publica configurada por ambiente.
- Regras definitivas de negocio, progresso, ordenacao persistida, permissao e isolamento por usuario pertencem ao backend.

## Variaveis de ambiente

Copie `.env.example` para `.env.local` quando precisar customizar a execucao local.

```bash
VITE_BACKEND_API_URL=http://localhost:8000/api/v1
```

Configure `VITE_BACKEND_API_URL` com a URL publica da API Django no ambiente de hospedagem.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test
```

O servidor local padrao do Vite fica em `http://localhost:5173/`.
