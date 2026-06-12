# Auto Insights — AI-Powered Analytics Platform

An end-to-end AI analytics SaaS platform where users upload datasets (CSV/XLSX) and receive automated profiling, AI-driven hypotheses, EDA visualizations, executable Python code, SQL generation, and downloadable executive reports.

## Architecture

```
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│   React Frontend     │────▶│  Node.js / Express   │────▶│  Python / FastAPI     │
│   (Vite + Tailwind)  │     │  REST API Backend    │     │  Data Processing     │
│   Port: 5173         │     │  Port: 5000          │     │  Port: 8000          │
└──────────────────────┘     └──────────┬───────────┘     └──────────────────────┘
                                        │
                              ┌─────────▼──────────┐
                              │   MongoDB Atlas     │
                              │   (Database)        │
                              └────────────────────┘
                                        │
                              ┌─────────▼──────────┐
                              │   OpenAI GPT API    │
                              │   (AI Layer)        │
                              └────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS 3, Recharts, Framer Motion, Axios |
| Backend | Node.js, Express.js, Mongoose, JWT Auth |
| Database | MongoDB Atlas |
| AI Layer | OpenAI GPT-4o API |
| Data Processing | Python 3.11, FastAPI, Pandas, NumPy, Plotly |
| Deployment | Vercel (frontend), Render (backend + Python) |

## Features

- **JWT Authentication** with role-based access control
- **Dataset Upload** (CSV/XLSX) with drag-and-drop
- **Auto Profiling** — column types, missing values, statistics
- **AI Hypothesis Generator** — 10 business hypotheses from GPT
- **Automated EDA** — histograms, box plots, correlation matrix
- **AI Insight Generator** — executive summary, findings, risks
- **Python Code Generator** — executable Pandas code
- **Sandboxed Code Execution** — safe subprocess with timeout
- **SQL Query Generator** — schema-aware SQL generation
- **Executive Report** — PDF download with all insights

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key

### 1. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and OpenAI API key
npm install
npm run dev
```

### 2. Python Microservice Setup

```bash
cd python-service
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Visit **http://localhost:5173** to use the app.

## Environment Variables

### Backend (`server/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_EXPIRE` | Token expiry (default: 7d) | No |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `OPENAI_MODEL` | Model to use (default: gpt-4o) | No |
| `PYTHON_SERVICE_URL` | Python service URL | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |

### Python Service (`python-service/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Service port (default: 8000) | No |
| `EXECUTION_TIMEOUT` | Code execution timeout in seconds | No |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/auth/profile` — Get profile
- `PUT /api/auth/profile` — Update profile

### Datasets
- `POST /api/dataset/upload` — Upload dataset (multipart)
- `GET /api/dataset/list` — List user datasets
- `GET /api/dataset/:id` — Get dataset details
- `DELETE /api/dataset/:id` — Delete dataset

### Analysis
- `POST /api/analysis/profile/:datasetId` — Profile dataset
- `POST /api/analysis/hypothesis/:datasetId` — Generate hypotheses
- `POST /api/analysis/generate-insights/:datasetId` — Generate insights
- `POST /api/analysis/generate-sql/:datasetId` — Generate SQL
- `POST /api/analysis/generate-code/:datasetId` — Generate code
- `POST /api/analysis/execute-code` — Execute code

### Reports
- `POST /api/report/generate/:datasetId` — Generate report
- `GET /api/report/list` — List reports
- `GET /api/report/:id` — Get report

## Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
```

### Backend → Render
Deploy using `server/render.yaml` configuration.

### Python Service → Render
Deploy using `python-service/render.yaml` or `python-service/Dockerfile`.

## License

MIT
