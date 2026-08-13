# InsightDesk — Requirements Tracking

Sourced from: **Software Developer Intern - Technical Assessment (Revised).docx**  
Dataset: **data.xlsx** (300,000 records, 10 columns)  
Last Updated: Phase 1 (Planning)

---

## MANDATORY REQUIREMENTS

> All items begin unchecked. Mark `[x]` only after implementation **and** verification.

---

### M1 — Data Handling

| # | Requirement | Implementation Location | Verification Method | Status |
|---|-------------|------------------------|---------------------|--------|
| M1.1 | Ingest and serve ~300K rows from Excel dataset | `etl/scripts/load_data.py` | ETL runs without error; rows match in DB | `[x]` |
| M1.2 | Decide and document data ingestion strategy (file/DB/ETL/cache) | `README.md` → Architecture section | README contains decision rationale | `[ ]` |
| M1.3 | Explain trade-offs of chosen ingestion approach | `README.md` → Trade-offs section | Trade-offs documented in README | `[ ]` |
| M1.4 | Browser must NOT receive all 300K raw records | FastAPI endpoints (aggregated responses) | API responses never return all rows unfiltered | `[x]` |

---

### M2 — Dashboard

| # | Requirement | Implementation Location | Verification Method | Status |
|---|-------------|------------------------|---------------------|--------|
| M2.1 | Summary metrics: total records | `frontend/src/pages/Dashboard.jsx` → KPI cards | KPI card shows 300,000 | `[x]` |
| M2.2 | Summary metrics: key KPIs (revenue, orders, AOV, items sold) | `frontend/src/pages/Dashboard.jsx` → KPI cards | All KPI cards render correct values | `[x]` |
| M2.3 | Aggregated statistics displayed | Dashboard + Performance pages | Stats match DB-computed aggregations | `[x]` |
| M2.4 | At least TWO types of visualization (bar, line, pie, trend) | Dashboard page (bar + line at minimum) | Two distinct chart types rendered | `[x]` |
| M2.5 | Filtering relevant to the data (date range, category, outlet/location, order type/settlement) | Filter components in Dashboard, Performance, Products, Orders pages | Server-side filters applied; results change when filters are applied | `[x]` |

---

### M3 — Performance

| # | Requirement | Implementation Location | Verification Method | Status |
|---|-------------|------------------------|---------------------|--------|
| M3.1 | Reasonable page load times | FastAPI + PostgreSQL indexes + frontend | LCP < 3s under normal conditions | `[x]` |
| M3.2 | Efficient queries | PostgreSQL with indexes; server-side aggregation | Query explain plans show index usage | `[x]` |
| M3.3 | Smooth overall user experience | Frontend loading/error/empty states | No UI freezes; loading spinners present | `[x]` |

---

### M4 — Deployment

| # | Requirement | Implementation Location | Verification Method | Status |
|---|-------------|------------------------|---------------------|--------|
| M4.1 | Deploy to a live, working URL | Frontend → Vercel; Backend → Render; DB → Supabase | Public URL loads fully functional app | `[ ]` |
| M4.2 | Deployment on Azure, Vercel, Render, Railway, Netlify, or equivalent | Per above | Platform confirmed | `[ ]` |

---

### M5 — Version Control

| # | Requirement | Implementation Location | Verification Method | Status |
|---|-------------|------------------------|---------------------|--------|
| M5.1 | Public GitHub repository | GitHub | Repo is public and accessible | `[ ]` |
| M5.2 | Clean project structure | Root directory per spec | Directory matches planned structure | `[x]` |
| M5.3 | Meaningful commit history (not one giant commit) | Git log | Multiple descriptive commits throughout phases | `[ ]` |

---

### M6 — Documentation (README)

| # | Requirement | Implementation Location | Verification Method | Status |
|---|-------------|------------------------|---------------------|--------|
| M6.1 | Clear setup instructions | `README.md` | README has working setup steps | `[ ]` |
| M6.2 | Clear run instructions | `README.md` | README has working run steps | `[ ]` |
| M6.3 | Architecture decisions documented (overall approach, data processing, DB rationale) | `README.md` → Architecture section | Section present and complete | `[ ]` |
| M6.4 | Key trade-offs documented | `README.md` → Trade-offs section | Section present and complete | `[ ]` |
| M6.5 | Assumptions documented | `README.md` → Assumptions section | Section present and complete | `[ ]` |
| M6.6 | Deployed application URL in README | `README.md` | Live URL is clickable and working | `[ ]` |

---

### M7 — Submission

| # | Requirement | Implementation Location | Verification Method | Status |
|---|-------------|------------------------|---------------------|--------|
| M7.1 | Submit GitHub repository link | Submission | Link submitted | `[ ]` |
| M7.2 | Submit deployed application URL | Submission | URL submitted | `[ ]` |
| M7.3 | Submit README | Submission (part of repo) | README present in repo root | `[ ]` |

---

## OPTIONAL / BONUS REQUIREMENTS

> These are attempted only after ALL mandatory requirements are complete and verified.

| # | Bonus Feature | Status |
|---|---------------|--------|
| B1 | Advanced filtering (beyond date/category/outlet/type) | `[x]` |
| B2 | Data export (CSV/Excel download) | `[ ]` |
| B3 | Authentication (login/protected routes) | `[ ]` |
| B4 | Responsive / mobile design | `[x]` |
| B5 | AI-generated insights from the data | `[ ]` |
| B6 | Caching and performance optimizations (Redis, query cache) | `[ ]` |
| B7 | Infrastructure automation (Docker Compose, CI/CD) | `[ ]` |

---

## PHASE COMPLETION CHECKLIST

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Dataset inspection + assessment analysis + architecture planning | `[x]` |
| Phase 2 | Project foundation + Polars ETL + PostgreSQL | `[x]` |
| Phase 3 | FastAPI backend + analytics endpoints | `[x]` |
| Phase 4 | React/Vite frontend + InsightDesk UI | `[x]` |
| Phase 5 | Dashboard + charts + filters + tables | `[x]` |
| Phase 6 | Reports/export + responsive design | `[x]` |
| Phase 7 | Performance testing and optimization | `[ ]` |
| Phase 8 | Deployment | `[ ]` |
| Phase 9 | GitHub + README + final assessment verification | `[ ]` |

---

## DATASET FACTS (Phase 1 Verified)

These values are confirmed from the actual data.xlsx file and must be reflected in the live application:

| Metric | Value |
|--------|-------|
| Total Records | 300,000 |
| Total Columns | 10 |
| Unique Orders (BillNo) | 110,478 |
| Items Sold (SUM Quantity) | 434,448 |
| Total Revenue (SUM Price x Qty) | Rs. 69,480,952.00 |
| Average Order Value | Rs. 628.91 |
| Date Range | 2025-06-17 to 2026-06-16 (~12 months) |
| Outlets | 6 (HSR Layout, Indiranagar, JP Nagar, Koramangala, MG Road, Whitefield) |
| Brand | 1 (Burger Town) |
| Menu Categories (Group) | 7 (Burgers, Combos, Desserts, Drinks, Extras, Sides, Wraps) |
| Order Types | 3 (Delivery, Dine-In, Takeaway) |
| Settlement Types | 4 (Cash/Card/Coupon, Dineout, SwiggyPay, ZomatoPay) |
| Unique Menu Items | 45 |
| Missing Values | 0 across all columns |
| Duplicate Rows | 0 |
| Zero-Price Rows | 8,611 (business meaning unknown; retained as-is; line revenue = Rs. 0) |
| Negative Prices | 0 |
| Zero-Quantity Rows | 0 |
| Negative Quantities | 0 |

---

## DATASET-DRIVEN DESIGN DECISIONS (Phase 1)

| Decision | Rationale |
|----------|-----------|
| No Region filter | The dataset has no Region column. Outlet_Name (6 outlets) is used as the location/business filter. This maps to the assessment's filtering example of "region" using the actual data available. |
| Zero-price rows retained | 8,611 rows have Price=0. The assessment does not instruct removal. Business meaning is unknown. They are included in Total Records and contribute Rs. 0 to revenue. |
| No Brand filter | Only one brand exists ("Burger Town"). A brand filter would be a no-op. Brand column is stored in the DB but not exposed as a UI filter. |
| ETL is one-time | The dataset is static; no live updates are mentioned in the assessment. ETL runs once to load PostgreSQL. |
| Performance figures are targets | All response-time figures stated in the plan are pre-implementation targets. Actual results will be measured and reported in the README. |
