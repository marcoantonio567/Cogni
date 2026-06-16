# Frontend - Gerenciador de Estudos

Aplicação cliente independente criada com Vite, React e TypeScript.

## Arquitetura

- O frontend vive em `frontend/`.
- O backend Django API vive em `backend/`.
- O frontend consome apenas a API pública configurada por ambiente.
- Regras definitivas de negócio, progresso, ordenação persistida, permissão e isolamento por usuário pertencem ao backend.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` quando precisar customizar a execução local.

```bash
VITE_BACKEND_API_URL=http://localhost:8000/api/v1
VITE_USE_MOCK_API=true
```

Use `VITE_USE_MOCK_API=false` para consumir a API Django real.

## Mocks temporários

Enquanto a API separada ainda estiver em preparação, `src/shared/api/mockApi.ts` simula o contrato público esperado. Essa camada é temporária e não deve ser tratada como regra de negócio definitiva.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test
```

O servidor local padrão do Vite fica em `http://localhost:5173/`.
