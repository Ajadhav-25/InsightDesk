# InsightDesk

InsightDesk is an interactive dashboard designed to efficiently analyze large-scale retail transaction data.

## What You'll Build

### Data handling
The dataset consists of approximately 300,000 retail line-item records originally provided as an Excel file. Reading and processing this Excel file on every request is inefficient and scales poorly. Instead, we implemented a robust ETL (Extract, Transform, Load) pipeline using Python and Polars to quickly process the dataset and bulk-load it into a production Supabase PostgreSQL database using `psycopg2`'s `execute_values`. 
This PostgreSQL backend provides persistent, reliable storage and allows for highly efficient server-side querying and aggregation.

### Dashboard
The application features a comprehensive analytics dashboard that displays:
- Total Records
- Total Revenue
- Total Orders
- Items Sold

Visualizations implemented:
- **Revenue Trend**: Line chart of revenue over time
- **Order Types**: Donut/Pie chart of delivery vs. dine-in/takeaway
- **Outlets & Categories**: Bar charts showing performance across different business units

Filters currently present in the Dashboard:
- Start Date
- End Date
- Outlet
- Category
- Order Type
- Settlement

*(Note: The Brand filter has been intentionally removed.)*

### Performance
To ensure maximum performance when dealing with 300K records, we utilized:
- **PostgreSQL queries**: Fast, indexed database retrievals.
- **Server-side aggregation**: SQL aggregations prevent the frontend from downloading massive datasets.
- **Server-side filtering**: Filtering maps directly to SQL `WHERE` clauses.
- **Server-side pagination**: The Orders table fetches data in small limits using `LIMIT` and `OFFSET`.
- **Database indexes**: Explicit indexes on `order_datetime`, `outlet_name`, `category`, `order_type`, and `bill_no`.
- **Bulk ETL loading**: Efficient insertion of 300K rows in seconds using `execute_values`.

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase PostgreSQL

- **GitHub Repository**: [GitHub Repository](https://github.com/Ajadhav-25/InsightDesk)
- **Live Frontend**: [Live Application](https://insight-desk-plum.vercel.app)
- **Live Backend**: [Backend API](https://insightdesk-hmy6.onrender.com)

## Tech Stack

**Frontend**:
- React
- Vite
- JavaScript
- Tailwind CSS
- Recharts

**Backend**:
- Python
- FastAPI
- SQLAlchemy
- psycopg2

**Database**:
- Supabase PostgreSQL

**ETL**:
- Python
- Polars

**Deployment**:
- Vercel
- Render
- Supabase

## Documentation

### Architecture
```text
User
  ↓
React + Vite
  ↓
Vercel
  ↓
FastAPI
  ↓
Render
  ↓
Supabase PostgreSQL

ETL:

data.xlsx
  ↓
Polars ETL
  ↓
PostgreSQL
```

- **React + Vite**: Handles the interactive UI and frontend routing.
- **FastAPI**: Serves the REST API, executes SQL queries, and manages business logic.
- **Supabase PostgreSQL**: Provides scalable relational data storage and indexing.
- **Polars ETL**: Transforms raw spreadsheet data into production database records.

### Data Processing
- Approximately 300,000 records
- One row = one line item
- One BillNo = one order
- Revenue = Price × Quantity
- Zero-price rows are preserved
- Production database is PostgreSQL

**Verified production values**:
- Total records: 300,000
- Distinct orders: 110,478
- Items sold: 434,448
- Total revenue: ₹69,480,952
- Zero-price rows: 8,611

### Features
- **Dashboard**: High-level KPIs, revenue trend line chart, and breakdown charts with dynamic global filters.
- **Performance**: Monitors and visualizes application performance and metrics.
- **Products**: Table ranking items by revenue contribution.
- **Orders**: Server-side paginated table of raw line-item records.
- **Reports**: Overview of generated reporting insights.

### API
The backend exposes the following endpoints:
- `/api/dashboard/summary`
- `/api/analytics/revenue-trend`
- `/api/analytics/outlets`
- `/api/analytics/categories`
- `/api/analytics/order-types`
- `/api/analytics/products`
- `/api/analytics/settlement`
- `/api/orders`
- `/api/filters`

### Performance Strategy
- **Aggregation happens in PostgreSQL**: Using SQL aggregations (`SUM()`, `COUNT()`) is much faster than downloading raw data to the Browser.
- **Filtering happens server-side**: SQL `WHERE` clauses efficiently narrow down results using database indexes.
- **Orders use server-side pagination**: Only a small subset of records is fetched at once, preventing frontend UI freezing and reducing network payload.
- **The frontend does not download all 300K records**: This ensures immediate dashboard rendering and eliminates excessive bandwidth usage.

### Setup and Run

**Environment Variables**:
Backend (`backend/.env`):
```env
DATABASE_URL=your_database_connection_string
```
Frontend (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

**ETL (Data Loading)**:
```bash
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
pip install polars openpyxl psycopg2-binary
python etl/scripts/load_data.py
```

**Backend**:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

### Architecture Decisions & Trade-offs
1. **Why PostgreSQL was selected**: Reading 300K rows from an Excel file on every request limits concurrency and consumes massive RAM. PostgreSQL provides query speed, index utilization, and scalability.
2. **Why Polars was selected for ETL**: Polars is significantly faster and more memory-efficient than Pandas for loading and transforming the initial dataset.
3. **Why FastAPI was selected**: Chosen for its automatic validation, interactive docs, and high performance.
4. **Why server-side pagination was used**: Prevents the frontend from freezing when attempting to render massive DOM tables.
5. **Why Vercel + Render + Supabase were used**: Separation of frontend, backend, and database hosting allows each layer to scale independently.

### Assumptions
- One row represents one line item.
- One BillNo represents one order.
- Revenue = Price × Quantity.
- Zero-price rows are valid and retained.

### Security
- Credentials stored through environment variables.
- `.env` files excluded from Git.
- Database credentials are not exposed to the frontend.
- Secrets are not committed.

## What We're Looking For
The project satisfies the core requirements by correctly handling 300K records via a robust Postgres/FastAPI backend, maintaining zero-price records, aggregating correctly without double counting, and serving a performant React frontend with server-side pagination and targeted indexes.

## Bonus
This section intentionally left blank as optional bonus features (AI insights, authentication, caching) were not required for this phase.

## Submission

- **GitHub Repository**: [GitHub Repository](https://github.com/Ajadhav-25/InsightDesk)
- **Live Frontend**: [Live Application](https://insight-desk-plum.vercel.app)
- **Live Backend**: [Backend API](https://insightdesk-hmy6.onrender.com)
