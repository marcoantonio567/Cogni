# Gerenciador de Estudos

<p align="center">
  <a href="#portugues">
    <img alt="Portugues" src="https://img.shields.io/badge/README-Portugues-2563eb?style=for-the-badge&labelColor=111827">
  </a>
  <a href="#english">
    <img alt="English" src="https://img.shields.io/badge/README-English-16a34a?style=for-the-badge&labelColor=111827">
  </a>
</p>

<p align="center">
  <strong>Escolha o idioma / Choose your language</strong>
</p>

---

<h2 id="portugues">Portugues</h2>


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

### Variaveis do Backend

O backend le `DJANGO_SECRET_KEY`. Em desenvolvimento, existe uma chave padrao em
`backend/core/settings/base.py`.

Exemplo:

```powershell
$env:DJANGO_SECRET_KEY="sua-chave-local"
```

### Testes do Backend

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

### Variaveis do Frontend

Arquivo de exemplo: `frontend/.env.example`.

```env
VITE_BACKEND_API_URL=http://localhost:8000/api/v1
VITE_USE_MOCK_API=true
```

Use `VITE_USE_MOCK_API=true` para rodar com dados simulados.

Use `VITE_USE_MOCK_API=false` para apontar para a API Django real. Antes disso,
alinhe o contrato live em `frontend/src/shared/api/liveApi.ts` com os endpoints
atuais do backend.

### Scripts do Frontend

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

<p align="right">
  <a href="#gerenciador-de-estudos">
    <img alt="Voltar ao topo" src="https://img.shields.io/badge/voltar-ao_topo-111827?style=flat-square">
  </a>
</p>

---

<h2 id="english">English</h2>


Web application for organizing study categories, topics, and subtopics, with
progress tracking, visual ordering, and a per-user statistics dashboard.

The project uses separate backend and frontend applications:

- `backend/`: Django API responsible for persistence, authentication,
  authorization, business rules, progress, and dashboard data.
- `frontend/`: Vite + React + TypeScript client application responsible for the
  interface, navigation, visual state, HTTP calls, ordering, and charts.

## Current Status

- Django + Django REST Framework backend implemented in `backend/`.
- Versioned API available under `/api/v1/`.
- Vite + React + TypeScript frontend implemented in `frontend/`.
- The frontend runs in mock mode by default with `VITE_USE_MOCK_API=true`.
- Live frontend/backend integration still requires contract alignment between
  `frontend/src/shared/api/liveApi.ts` and the current backend endpoints.
- Backend tests, frontend tests, frontend lint, and frontend build were
  validated locally.

## Structure

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

The official project rules are in `docs/REGRAS_DE_NEGOCIO.md`. The backlog and
evolution decisions are in `docs/BACKLOG.md`.

## Technologies

Backend:

- Python
- Django 5.2.8
- Django REST Framework 3.16.1
- SQLite for development

Frontend:

- Vite
- React 19
- TypeScript
- Axios
- React Router
- SortableJS
- Chart.js with `react-chartjs-2`
- Vitest and Testing Library
- ESLint

## Backend

Enter the backend folder:

```powershell
cd backend
```

Create and activate the virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements/development.txt
```

Run migrations:

```powershell
python manage.py migrate --settings=core.settings.development
```

Create a superuser, if needed:

```powershell
python manage.py createsuperuser --settings=core.settings.development
```

Start the API:

```powershell
python manage.py runserver --settings=core.settings.development
```

Local URL:

```text
http://127.0.0.1:8000/
```

### Backend Environment Variables

The backend reads `DJANGO_SECRET_KEY`. In development, a default key exists in
`backend/core/settings/base.py`.

Example:

```powershell
$env:DJANGO_SECRET_KEY="your-local-key"
```

### Backend Tests

```powershell
python manage.py test --settings=core.settings.development
```

## Frontend

Enter the frontend folder:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Copy the environment variables:

```powershell
Copy-Item .env.example .env.local
```

Start the local server:

```powershell
npm run dev
```

Default local URL:

```text
http://localhost:5173/
```

### Frontend Environment Variables

Example file: `frontend/.env.example`.

```env
VITE_BACKEND_API_URL=http://localhost:8000/api/v1
VITE_USE_MOCK_API=true
```

Use `VITE_USE_MOCK_API=true` to run with simulated data.

Use `VITE_USE_MOCK_API=false` to point to the real Django API. Before doing so,
align the live contract in `frontend/src/shared/api/liveApi.ts` with the current
backend endpoints.

### Frontend Scripts

```powershell
npm run dev
npm run build
npm run lint
npm run test
npm run preview
```

## Current Backend Endpoints

All main endpoints use the `/api/v1/` prefix.

### Accounts

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/accounts/register/` | Creates a user |
| `POST` | `/api/v1/accounts/login/` | Authenticates a user |
| `POST` | `/api/v1/accounts/logout/` | Ends the session |
| `GET` | `/api/v1/accounts/me/` | Returns the authenticated user |

### Estudos

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/v1/estudos/categorias/` | Lists or creates categories |
| `GET/PATCH/PUT/DELETE` | `/api/v1/estudos/categorias/{id}/` | Retrieves, updates, or removes a category |
| `GET/POST` | `/api/v1/estudos/topicos/` | Lists or creates topics |
| `GET/PATCH/PUT/DELETE` | `/api/v1/estudos/topicos/{id}/` | Retrieves, updates, or removes a topic |
| `GET/POST` | `/api/v1/estudos/subtopicos/` | Lists or creates subtopics |
| `GET/PATCH/PUT/DELETE` | `/api/v1/estudos/subtopicos/{id}/` | Retrieves, updates, or removes a subtopic |
| `GET` | `/api/v1/estudos/progresso/` | Returns overall progress |
| `POST` | `/api/v1/estudos/subtopicos/{id}/toggle-conclusao/` | Marks completion on or off |
| `POST` | `/api/v1/estudos/categorias/{id}/ordenar-topicos/` | Persists topic order |
| `POST` | `/api/v1/estudos/topicos/{id}/ordenar-subtopicos/` | Persists subtopic order |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard/resumo/` | Returns general and per-category metrics |
| `GET` | `/api/v1/dashboard/semanal/` | Returns the weekly chart series |

## Example Payloads

Create category:

```json
{
  "nome": "Django",
  "descricao": "Studies about Django and DRF"
}
```

Create topic:

```json
{
  "nome": "REST API",
  "categoria": 1,
  "ordem": 1
}
```

Create subtopic:

```json
{
  "nome": "Serializers",
  "topico": 1,
  "ordem": 1,
  "observacoes": ""
}
```

Order topics or subtopics:

```json
{
  "ids": [3, 1, 2]
}
```

Toggle completion:

```json
{
  "concluido": true
}
```

## Validation

Commands successfully executed:

```powershell
cd backend
python manage.py test --settings=core.settings.development

cd ../frontend
npm install
npm run test
npm run build
npm run lint
```

Validated result:

- Backend: 5 tests passed.
- Frontend: 1 test file passed, with 3 tests.
- Frontend: production build generated successfully.
- Frontend: lint ran with no errors.

## Important Rules

- The backend is the source of truth for business rules, permissions, progress,
  and ordering.
- The frontend must consume only the public backend API.
- The frontend must not calculate definitive progress; it must display values
  returned by the API.
- Each user must view and manipulate only their own data.
- Contract changes between backend and frontend must be recorded in the project
  documentation.

## Next Steps

- Align `frontend/src/shared/api/liveApi.ts` with the real backend endpoints.
- Define the final contract for the study overview used by the main screen.
- Configure CORS/CSRF according to the final authentication strategy between
  frontend and backend.
- Run the frontend with `VITE_USE_MOCK_API=false` after the live contract is
  aligned.

<p align="right">
  <a href="#gerenciador-de-estudos">
    <img alt="Back to top" src="https://img.shields.io/badge/back-to_top-111827?style=flat-square">
  </a>
</p>
