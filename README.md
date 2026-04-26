# SoloFlow

**Legal Vertical SaaS for Solo Attorneys**

SoloFlow is a full-featured practice management platform built for solo and small-firm family law attorneys. It handles financial affidavits, child support calculations, trust accounting, matter management, and client intake — all with South Carolina-specific logic built in.

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for frontend dev outside Docker)
- Python 3.11+ (for backend dev outside Docker)

### Running with Docker (recommended)

```bash
# Clone and start everything
git clone <repo-url>
cd soloflow
docker compose up --build
```

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:5173
- **Database**: PostgreSQL on port 5432

### Running without Docker

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## Configuration

Copy `.env.example` to `.env` in the project root, or set environment variables directly:

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | auto-generated | Django secret key |
| `DEBUG` | `True` | Debug mode for development |
| `DATABASE_URL` | `sqlite:///db.sqlite3` | PostgreSQL connection string |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Frontend origin for CORS |
| `STRIPE_SECRET_KEY` | — | Stripe API key (billing) |
| `STRIPE_WEBHOOK_SECRET` | — | Stripe webhook signing secret |

---

## Features

### 🧮 Financial Wizard
Multi-step intake wizard that walks clients through income, deductions, and expenses. Real-time child support calculator sidebar.

### 📄 SCCA 430 Financial Declaration
Generates South Carolina Family Court Form SCCA 430 as a PDF, populated with affidavit data. Uses ReportLab for court-compliant formatting.

### ⚖️ South Carolina Child Support Engine
- Worksheet A (standard) and Worksheet C (above-guidelines) calculations
- 109-overnight parenting time cliff
- 1.5x multiplier for combined income above $30,000/month
- Basic Obligation Schedule lookups

### 📋 Matter Management
Dashboard with overview, matter list/edit/delete, search, and status tracking. Multi-tenant firm isolation.

### 🏦 Trust Balance Dashboard
Real-time trust balance view for each client, calculated from time entry data.

### 🔗 Embeddable Intake Widget
Drop-in intake widget for law firm websites. Accepts new client data via public API with rate limiting.

---

## Architecture

```
soloflow/
├── backend/          # Django 4.2 REST API
│   ├── config/       # Django settings, URLs, WSGI
│   ├── core/         # Firm, Client, Matter, TimeEntry models
│   ├── financials/   # Affidavit, Child Support, PDF generation
│   └── tests/        # pytest test suite
├── frontend/         # React 19 + Vite + Tailwind 4
│   └── src/
│       ├── auth/         # Login/Signup
│       ├── dashboard/    # Overview, Matters, Settings
│       ├── financials/   # Financial Wizard
│       ├── intake/       # Embeddable widget
│       └── wizard/       # Multi-step form components
├── docker-compose.yml
└── README.md
```

### Key Tech Stack
- **Backend**: Django 4.2, Django REST Framework, ReportLab (PDF), SimpleJWT (auth)
- **Frontend**: React 19, Vite, Tailwind 4, React Router, React Hook Form, Lucide Icons
- **Database**: PostgreSQL 15 (Docker), SQLite (dev fallback)
- **Infrastructure**: Docker Compose, Redis (caching/sessions)

---

## Development

### Running Tests

```bash
cd backend
pytest                          # All tests
pytest tests/ -v                # Verbose
pytest tests/test_child_support_logic.py -v  # Core financial logic only
```

### Creating Migrations

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Adding a New Dashboard Section

1. Create a view component in `frontend/src/components/dashboard/`
2. Add route to `frontend/src/App.jsx`
3. Add menu item in `DashboardLayout.jsx`
4. Wire up backend API in `backend/core/views.py`

---

## License

Proprietary — SoloFlow is intended for licensed legal professionals only.
