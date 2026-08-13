# InsightDesk — Business Analytics Dashboard

A modern, production-ready analytics dashboard built on top of 300,000 sales records from a quick-service restaurant chain. Built as a technical assessment for a Software Developer Intern role.

## Features

- **Dashboard Summary**: High-level KPIs including Total Revenue, Total Orders, Total Line Items, and Total Items Sold.
- **Revenue Trend**: Line chart visualizing revenue over time.
- **Outlets & Categories**: Bar charts showing performance across different business units and menu categories.
- **Order Types**: Donut/Pie chart of delivery vs. dine-in/takeaway.
- **Products**: Table ranking items by revenue contribution.
- **Orders**: Server-side paginated table of raw line-item records.
- **Performance**: Monitors and visualizes application performance metrics.
- **Reports**: Overview of generated reporting insights.
- **Advanced Filtering**: Filter dashboard data by start date, end date, outlet, category, order type, and settlement.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, Tailwind CSS, Recharts |
| Backend | Python, FastAPI, SQLAlchemy, psycopg2 |
| Database | Supabase PostgreSQL |
| ETL | Python, Polars |
| Deployment | Vercel (frontend), Render (backend), Supabase |

## Architecture

```text
Excel dataset
↓
Polars ETL
↓
Supabase PostgreSQL
↓
FastAPI backend
↓
Render
↓
React/Vite frontend
↓
Vercel
```

- **Polars ETL**: Transforms raw spreadsheet data into production database records.
- **Supabase PostgreSQL**: Provides scalable relational data storage and indexing.
- **FastAPI backend**: Serves the REST API, executes SQL queries, and manages business logic.
- **React/Vite frontend**: Handles the interactive UI and frontend routing.

## Dataset & ETL Approach

- Dataset contains 300,000 line-item records.
- One row represents one line item.
- One BillNo represents one order.
- Revenue = Price × Quantity.
- Zero-price rows are preserved.
- Polars is used for data processing.
- `psycopg2.execute_values` was used for efficient bulk loading.
- Production ETL was successfully completed.

## Production Data Verification

| Metric | Value |
|---|---:|
| Total Records | 300,000 |
| Distinct Orders | 110,478 |
| Items Sold | 434,448 |
| Total Revenue | ₹69,480,952 |
| Zero-Price Rows | 8,611 |

## Database Decision

Supabase PostgreSQL was selected because holding 300K rows in a relational database allows for efficient, indexed query performance. Keeping 300K records in PostgreSQL allows server-side filtering, aggregation, and pagination instead of sending the entire dataset to the browser, significantly reducing bandwidth and memory consumption.

## API Overview

The backend exposes the following REST API endpoints:

- `GET /api/dashboard/summary`
- `GET /api/analytics/revenue-trend`
- `GET /api/analytics/outlets`
- `GET /api/analytics/categories`
- `GET /api/analytics/order-types`
- `GET /api/analytics/products`
- `GET /api/analytics/settlement`
- `GET /api/orders`
- `GET /api/filters`

## Filtering

The Dashboard currently has the following filters:
- Start Date
- End Date
- Outlet
- Category
- Order Type
- Settlement


## Performance Strategy

- PostgreSQL server-side aggregation
- Server-side filtering
- Server-side pagination
- Database indexes
- Bulk ETL loading using `psycopg2.execute_values`
- Frontend receives aggregated data rather than the complete 300K-row dataset

## Application Pages

- **Dashboard**: Central hub displaying high-level KPIs, revenue trend line chart, and breakdown charts with dynamic global filters.
- **Performance**: Displays application performance and metrics.
- **Products**: Table ranking items by their revenue contribution.
- **Orders**: Server-side paginated table showing raw line-item records.
- **Reports**: Overview of generated reporting insights.

## Architecture Decisions & Trade-offs

1. **Why PostgreSQL instead of querying Excel on every request**: Reading a 15MB Excel file with 300K rows on every request limits concurrency and consumes massive RAM. PostgreSQL provides query speed, index utilization, and scalability.
2. **Why Polars for ETL**: Polars is significantly faster and more memory-efficient than Pandas for loading and transforming the dataset.
3. **Why FastAPI**: Chosen for its automatic validation, interactive docs, and high performance.
4. **Why server-side filtering**: Filtering maps directly to SQL `WHERE` clauses, preventing the frontend from downloading massive datasets.
5. **Why server-side pagination**: Prevents the frontend from freezing when attempting to render massive DOM tables.
6. **Why Vercel + Render + Supabase**: Separation of frontend, backend, and database hosting allows each layer to scale independently.

## Assumptions

- One row = one line item.
- One BillNo = one order.
- Revenue = Price × Quantity.
- Zero-price rows are retained.

## Security

- Database credentials stored through environment variables.
- `.env` files excluded from Git.
- Database credentials are not exposed to the frontend.
- Secrets are not committed.

## Local Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/Ajadhav-25/InsightDesk.git
cd InsightDesk
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
# Copy the example env file and set your DATABASE_URL
cp .env.example .env
```

### 3. Run ETL

Place `data.xlsx` in the `data/` directory, then:

```bash
cd etl
pip install polars openpyxl psycopg2-binary
python scripts/load_data.py
```

### 4. Run backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 5. Frontend setup

```bash
cd frontend
npm install
# Set VITE_API_BASE_URL=http://localhost:8000/api
cp .env.example .env.local
npm run dev
```

## Deployment

Frontend:
[https://insight-desk-plum.vercel.app/](https://insight-desk-plum.vercel.app/)

Backend:
[https://insightdesk-hmy6.onrender.com/](https://insightdesk-hmy6.onrender.com/)

Database:
Supabase PostgreSQL

GitHub:
[https://github.com/Ajadhav-25/InsightDesk](https://github.com/Ajadhav-25/InsightDesk)


## Scrennshots
<img width="1306" height="793" alt="image" src="https://github.com/user-attachments/assets/6b6466fd-ab8c-492c-a77b-03df05af0b30" />
<br><br>
<img width="1394" height="847" alt="image" src="https://github.com/user-attachments/assets/49100ae2-80d4-45b8-be56-348a81e498d4" />
<br><br>
<img width="1458" height="836" alt="image" src="https://github.com/user-attachments/assets/ba3ad061-5b3c-4d9a-8ba0-655a3466732e" />
<br><br>
<img width="1524" height="856" alt="image" src="https://github.com/user-attachments/assets/18aa702a-3584-4017-a634-2b71b17bfadb" />
<br><br>
<img width="1396" height="852" alt="image" src="https://github.com/user-attachments/assets/63678323-a87e-4eb0-be61-ebe5d5e01732" />



## Submission

- **GitHub Repository**: [InsightDesk](https://github.com/Ajadhav-25/InsightDesk)
- **Live URL**: [InsightDesk Dashboard](https://insight-desk-plum.vercel.app/)

