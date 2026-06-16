# Study Manager

<p align="center">
  <a href="README.md">
    <img alt="Portugues" src="https://img.shields.io/badge/README-Portugues-2563eb?style=for-the-badge&labelColor=111827">
  </a>
  <a href="README.en.md">
    <img alt="English" src="https://img.shields.io/badge/README-English-16a34a?style=for-the-badge&labelColor=111827">
  </a>
</p>

<p align="center">
  <strong>README in English</strong>
</p>

---

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
|-- README.md
`-- README.en.md
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
  <a href="#study-manager">
    <img alt="Back to top" src="https://img.shields.io/badge/back-to_top-111827?style=flat-square">
  </a>
</p>
