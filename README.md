# InsightDesk

Business analytics and reporting dashboard built from a 300,000-record Excel dataset.

## Live Application

> URL will be added after Phase 8 deployment.

## Overview

InsightDesk ingests approximately 300,000 line-item sales records from an Excel file (a single Burger Town brand operating 6 outlets across Bangalore) and presents them as an interactive analytics dashboard with server-side aggregation, filtering, and pagination.

## Features

- Dashboard with 5 KPI cards (Total Revenue, Total Orders, AOV, Items Sold, Total Records)
- Revenue trend line chart (monthly, 12-month span)
- Revenue by outlet bar chart
- Order type distribution donut chart
- Product rankings table (sortable)
- Paginated orders table (server-side, 300K records never loaded into the browser)
- Server-side filtering (date range, outlet, category, order type, settlement)

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, Recharts |
| Frontend state/data | TanStack React Query |
| Backend | Python, FastAPI |
| ETL | Polars |
| Database | PostgreSQL |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Database hosting | Supabase |

## Architecture

```
Excel (data.xlsx)
     |
     v
Polars ETL (one-time Python script)
     |
     v
PostgreSQL (Supabase, production)
     |
     v
FastAPI (REST API — server-side aggregation, filtering, pagination)
     |
     v
React + Vite + Tailwind CSS + Recharts (Vercel CDN)
```

## Data Processing

The Excel file is ingested once using a Polars ETL script (`etl/scripts/load_data.py`):

1. Polars reads all 300,000 rows from the `.xlsx` file
2. Column `Group` is renamed to `category` (reserved SQL keyword)
3. Numeric columns are validated (no negatives expected; zero-price rows flagged and retained)
4. `line_revenue = price × quantity` is pre-computed and stored as an integer column
5. Data is bulk-inserted into PostgreSQL in batches
6. Row count is verified: `SELECT COUNT(*) FROM line_items` must equal 300,000

The ETL is idempotent — it `TRUNCATE`s the table before re-inserting, so it is safe to re-run.

## Database Decision

**PostgreSQL** was chosen because:
- 300K rows is small for PostgreSQL; aggregation queries with proper indexes return results quickly
- SQL `GROUP BY`, `WHERE`, and `COUNT(DISTINCT)` map directly to dashboard requirements
- The browser never receives raw records — only aggregated results per query
- Server-side filtering translates naturally to SQL `WHERE` clauses
- `OFFSET/LIMIT` pagination is simple and appropriate for this dataset size

Serving directly from Excel was rejected because each request would require re-parsing the full 15MB file, and Excel cannot be efficiently queried with filters or aggregations.

## Performance Strategy

- All KPIs computed in a single SQL query (no N+1 queries)
- Charts served as small pre-aggregated JSON (12 data points for monthly trend)
- Orders table uses server-side pagination (50 rows per page)
- Indexes on `order_datetime`, `outlet_name`, `category`, `order_type`, `bill_no`, and a compound `(order_datetime, outlet_name)` index for common combined filters
- TanStack React Query caches API responses client-side for the duration of a session
- All performance targets are measured after implementation — see results below

### Measured Performance Results

> To be filled after Phase 7 (performance testing).

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ (or a Supabase project)

### Backend + ETL

```bash
# 1. Clone the repository
git clone https://github.com/<username>/insightdesk.git
cd insightdesk

# 2. Set up Python environment
cd backend
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 4. Run the ETL (one-time)
cd ../etl
pip install -r requirements.txt
# Place data.xlsx in ../data/data.xlsx
python scripts/load_data.py

# 5. Start the backend
cd ../backend
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Trade-offs and Assumptions

| Item | Decision |
|------|----------|
| Zero-price rows (8,611) | Retained as-is; business meaning unknown; assessment does not require removal |
| No Region column | Dataset has no Region column; Outlet_Name (6 outlets) used as the location filter |
| Single brand | Only "Burger Town" exists; brand filter would be a no-op; not exposed in UI |
| Performance targets | Pre-implementation targets only; actual measured results reported in README after Phase 7 |
| ETL is one-time | Dataset is static; no live updates mentioned in assessment |
| Cold start | Render free tier has cold start delays; first request after idle period may be slow |

## API Overview

| Endpoint | Purpose |
|----------|---------|
| `GET /api/dashboard/summary` | 5 KPI metrics (filterable) |
| `GET /api/analytics/revenue-trend` | Monthly revenue trend |
| `GET /api/analytics/outlets` | Revenue by outlet |
| `GET /api/analytics/categories` | Revenue by category |
| `GET /api/analytics/order-types` | Order type distribution |
| `GET /api/analytics/products` | Product rankings |
| `GET /api/analytics/settlement` | Payment method breakdown |
| `GET /api/orders` | Paginated line-item table |
| `GET /api/filters` | Filter dropdown values |

## Deployment

> Configuration details added in Phase 8.

## License

Assessment project — not for redistribution.
