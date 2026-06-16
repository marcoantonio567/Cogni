# Gerenciador de Estudos

Aplicacao web para organizar categorias, topicos e subtopicos de estudo, com
controle de progresso, ordenacao visual e dashboard de estatisticas por usuario.

O projeto usa backend e frontend separados:

- `backend/`: API Django responsavel por persistencia, autenticacao, autorizacao,
  regras de negocio, progresso e dashboard.
- `frontend/`: aplicacao cliente Vite + React + TypeScript responsavel pela
  interface, navegacao, estado visual, chamadas HTTP, ordenacao e graficos.

## Status Atual

- Backend Django + Django REST Framework implementado em `backend/`.
- API versionada em `/api/v1/`.
- Frontend Vite + React + TypeScript implementado em `frontend/`.
- Frontend roda em modo mock por padrao com `VITE_USE_MOCK_API=true`.
- Integracao live frontend/backend ainda exige alinhamento de contrato entre
  `frontend/src/shared/api/liveApi.ts` e os endpoints atuais do backend.
- Testes do backend, testes do frontend, lint e build do frontend foram
  validados localmente.

## Estrutura

```text
managerstudys/
|-- backend/
|   |-- manage.py
|   |-- core/
|   |   |-- settings/
|   |   `-- urls.py
|   |-- apps/
|   |   |-- accounts/
|   |   |-- estudos/
|   |   `-- dashboard/
|   `-- requirements/
|-- frontend/
|   |-- package.json
|   |-- vite.config.ts
|   |-- public/
|   `-- src/
|       |-- app/
|       |-- features/
|       |   |-- accounts/
|       |   |-- estudos/
|       |   `-- dashboard/
|       `-- shared/
|           |-- api/
|           `-- components/
|-- docs/
|   |-- REGRAS_DE_NEGOCIO.md
|   `-- BACKLOG.md
`-- README.md
```

As regras oficiais do projeto ficam em `docs/REGRAS_DE_NEGOCIO.md`. O backlog e
as decisoes de evolucao ficam em `docs/BACKLOG.md`.

## Tecnologias

Backend:

- Python
- Django 5.2.8
- Django REST Framework 3.16.1
- SQLite em desenvolvimento

Frontend:

- Vite
- React 19
- TypeScript
- Axios
- React Router
- SortableJS
- Chart.js com `react-chartjs-2`
- Vitest e Testing Library
- ESLint

## Backend

Entre na pasta do backend:

```powershell
cd backend
```

Crie e ative o ambiente virtual:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Instale as dependencias:

```powershell
pip install -r requirements/development.txt
```

Execute as migracoes:

```powershell
python manage.py migrate --settings=core.settings.development
```

Crie um superusuario, se necessario:

```powershell
python manage.py createsuperuser --settings=core.settings.development
```

Suba a API:

```powershell
python manage.py runserver --settings=core.settings.development
```

URL local:

```text
http://127.0.0.1:8000/
```

### Variaveis do backend

O backend le `DJANGO_SECRET_KEY`. Em desenvolvimento, existe uma chave padrao em
`backend/core/settings/base.py`.

Exemplo:

```powershell
$env:DJANGO_SECRET_KEY="sua-chave-local"
```

### Testes do backend

```powershell
python manage.py test --settings=core.settings.development
```

## Frontend

Entre na pasta do frontend:

```powershell
cd frontend
```

Instale as dependencias:

```powershell
npm install
```

Copie as variaveis de ambiente:

```powershell
Copy-Item .env.example .env.local
```

Suba o servidor local:

```powershell
npm run dev
```

URL local padrao:

```text
http://localhost:5173/
```

### Variaveis do frontend

Arquivo de exemplo: `frontend/.env.example`.

```env
VITE_BACKEND_API_URL=http://localhost:8000/api/v1
VITE_USE_MOCK_API=true
```

Use `VITE_USE_MOCK_API=true` para rodar com dados simulados.

Use `VITE_USE_MOCK_API=false` para apontar para a API Django real. Antes disso,
alinhe o contrato live em `frontend/src/shared/api/liveApi.ts` com os endpoints
atuais do backend.

### Scripts do frontend

```powershell
npm run dev
npm run build
npm run lint
npm run test
npm run preview
```

## Endpoints Atuais do Backend

Todos os endpoints principais usam o prefixo `/api/v1/`.

### Accounts

| Metodo | Endpoint | Descricao |
|---|---|---|
| `POST` | `/api/v1/accounts/register/` | Cria usuario |
| `POST` | `/api/v1/accounts/login/` | Autentica usuario |
| `POST` | `/api/v1/accounts/logout/` | Encerra sessao |
| `GET` | `/api/v1/accounts/me/` | Retorna usuario autenticado |

### Estudos

| Metodo | Endpoint | Descricao |
|---|---|---|
| `GET/POST` | `/api/v1/estudos/categorias/` | Lista ou cria categorias |
| `GET/PATCH/PUT/DELETE` | `/api/v1/estudos/categorias/{id}/` | Detalha, altera ou remove categoria |
| `GET/POST` | `/api/v1/estudos/topicos/` | Lista ou cria topicos |
| `GET/PATCH/PUT/DELETE` | `/api/v1/estudos/topicos/{id}/` | Detalha, altera ou remove topico |
| `GET/POST` | `/api/v1/estudos/subtopicos/` | Lista ou cria subtopicos |
| `GET/PATCH/PUT/DELETE` | `/api/v1/estudos/subtopicos/{id}/` | Detalha, altera ou remove subtopico |
| `GET` | `/api/v1/estudos/progresso/` | Retorna progresso geral |
| `POST` | `/api/v1/estudos/subtopicos/{id}/toggle-conclusao/` | Marca ou desmarca conclusao |
| `POST` | `/api/v1/estudos/categorias/{id}/ordenar-topicos/` | Persiste ordem dos topicos |
| `POST` | `/api/v1/estudos/topicos/{id}/ordenar-subtopicos/` | Persiste ordem dos subtopicos |

### Dashboard

| Metodo | Endpoint | Descricao |
|---|---|---|
| `GET` | `/api/v1/dashboard/resumo/` | Retorna metricas gerais e por categoria |
| `GET` | `/api/v1/dashboard/semanal/` | Retorna serie semanal para grafico |

## Payloads de Exemplo

Criar categoria:

```json
{
  "nome": "Django",
  "descricao": "Estudos sobre Django e DRF"
}
```

Criar topico:

```json
{
  "nome": "API REST",
  "categoria": 1,
  "ordem": 1
}
```

Criar subtopico:

```json
{
  "nome": "Serializers",
  "topico": 1,
  "ordem": 1,
  "observacoes": ""
}
```

Ordenar topicos ou subtopicos:

```json
{
  "ids": [3, 1, 2]
}
```

Alternar conclusao:

```json
{
  "concluido": true
}
```

## Validacao

Comandos executados com sucesso:

```powershell
cd backend
python manage.py test --settings=core.settings.development

cd ../frontend
npm install
npm run test
npm run build
npm run lint
```

Resultado validado:

- Backend: 5 testes passaram.
- Frontend: 1 arquivo de teste passou, com 3 testes.
- Frontend: build de producao gerado com sucesso.
- Frontend: lint executado sem erros.

## Regras Importantes

- O backend e a fonte da verdade para regras de negocio, permissao, progresso e
  ordenacao.
- O frontend deve consumir apenas a API publica do backend.
- O frontend nao deve calcular progresso definitivo; deve exibir valores
  retornados pela API.
- Cada usuario deve visualizar e manipular apenas os proprios dados.
- Mudancas de contrato entre backend e frontend devem ser registradas na
  documentacao do projeto.

## Proximos Passos

- Alinhar `frontend/src/shared/api/liveApi.ts` com os endpoints reais do backend.
- Definir o contrato final para overview de estudos usado pela tela principal.
- Configurar CORS/CSRF conforme a estrategia final de autenticacao entre
  frontend e backend.
- Rodar o frontend com `VITE_USE_MOCK_API=false` depois do alinhamento live.
