"""
InsightDesk — Polars ETL Pipeline
===================================
Reads data.xlsx, validates, transforms, and loads into PostgreSQL.

Usage:
    python etl/scripts/load_data.py

Environment:
    DATABASE_URL — PostgreSQL connection string (from .env or environment)

The script is idempotent: it TRUNCATEs the target table before inserting,
so it is safe to re-run at any time.
"""

import os
import sys
import time
import logging
from pathlib import Path
from datetime import datetime, timezone

import polars as pl
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# ─── Logging setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

# ─── Path constants ───────────────────────────────────────────────────────────
# Resolve paths relative to the project root (two levels above this script)
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DATA_FILE = PROJECT_ROOT / "data" / "data.xlsx"
ENV_FILE = PROJECT_ROOT / "backend" / ".env"

# ─── Expected dataset properties (from Phase 1 analysis) ─────────────────────
EXPECTED_ROWS = 300_000
EXPECTED_COLS = 10
EXPECTED_COLUMNS = {
    "BillNo", "Outlet_Name", "Order_Datetime", "Group",
    "Order_Type", "Item", "Price", "Quantity", "Settlement", "Brand",
}

# ─── PostgreSQL DDL ───────────────────────────────────────────────────────────
# Schema matches the Phase 1 design exactly.
# "Group" is a reserved SQL keyword → renamed to "category".
# "line_revenue" is pre-computed (price × quantity) to avoid per-query multiplication.
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS line_items (
    id               SERIAL          PRIMARY KEY,
    bill_no          INTEGER         NOT NULL,
    outlet_name      VARCHAR(100)    NOT NULL,
    order_datetime   TIMESTAMPTZ     NOT NULL,
    category         VARCHAR(50)     NOT NULL,
    order_type       VARCHAR(20)     NOT NULL,
    item             VARCHAR(150)    NOT NULL,
    price            INTEGER         NOT NULL,
    quantity         SMALLINT        NOT NULL,
    line_revenue     INTEGER         NOT NULL,
    settlement       VARCHAR(50)     NOT NULL,
    brand            VARCHAR(100)    NOT NULL
);
"""

CREATE_INDEXES_SQL = [
    # Date range is the most common dashboard filter
    "CREATE INDEX IF NOT EXISTS idx_line_items_order_datetime  ON line_items (order_datetime);",
    # Outlet filter — used on almost every page
    "CREATE INDEX IF NOT EXISTS idx_line_items_outlet_name     ON line_items (outlet_name);",
    # Category filter — used on Performance and Products pages
    "CREATE INDEX IF NOT EXISTS idx_line_items_category        ON line_items (category);",
    # Order type filter — used on Dashboard and Reports
    "CREATE INDEX IF NOT EXISTS idx_line_items_order_type      ON line_items (order_type);",
    # BillNo — used for COUNT(DISTINCT bill_no) across pages
    "CREATE INDEX IF NOT EXISTS idx_line_items_bill_no         ON line_items (bill_no);",
    # Compound: date + outlet (most common combined filter pattern)
    "CREATE INDEX IF NOT EXISTS idx_line_items_datetime_outlet ON line_items (order_datetime, outlet_name);",
]

BATCH_SIZE = 10_000  # rows per insert batch


# ─── Main pipeline ────────────────────────────────────────────────────────────

def load_env() -> str:
    """Load DATABASE_URL from backend/.env or environment."""
    if ENV_FILE.exists():
        load_dotenv(ENV_FILE)
        log.info("Loaded environment from %s", ENV_FILE)
    else:
        log.warning(".env not found at %s — relying on environment variables", ENV_FILE)

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        log.error(
            "DATABASE_URL is not set. "
            "Create backend/.env from backend/.env.example and set DATABASE_URL."
        )
        sys.exit(1)
    return db_url


def read_excel() -> pl.DataFrame:
    """Step 1 — Read the Excel file with Polars."""
    if not DATA_FILE.exists():
        log.error("Data file not found: %s", DATA_FILE)
        sys.exit(1)

    log.info("Reading Excel file: %s", DATA_FILE)
    t0 = time.perf_counter()
    df = pl.read_excel(DATA_FILE, engine="openpyxl")
    elapsed = time.perf_counter() - t0

    log.info("Read complete: %d rows × %d columns in %.1fs", df.shape[0], df.shape[1], elapsed)
    return df


def validate_structure(df: pl.DataFrame) -> None:
    """Step 2 — Validate that the file has the expected structure."""
    actual_cols = set(df.columns)
    missing = EXPECTED_COLUMNS - actual_cols
    extra = actual_cols - EXPECTED_COLUMNS

    if missing:
        log.error("Missing expected columns: %s", missing)
        sys.exit(1)
    if extra:
        log.warning("Extra columns found (will be ignored): %s", extra)

    if df.shape[0] != EXPECTED_ROWS:
        log.warning(
            "Row count is %d; expected %d. Proceeding anyway.",
            df.shape[0], EXPECTED_ROWS,
        )
    else:
        log.info("Row count confirmed: %d", df.shape[0])


def validate_data(df: pl.DataFrame) -> None:
    """Step 3 — Validate numeric columns and report data-quality findings."""
    # Missing values
    null_counts = {col: df[col].null_count() for col in df.columns}
    has_nulls = {col: n for col, n in null_counts.items() if n > 0}
    if has_nulls:
        log.warning("Null values found: %s", has_nulls)
    else:
        log.info("No null values in any column — dataset is clean.")

    # Price validation
    neg_prices = (df["Price"] < 0).sum()
    zero_prices = (df["Price"] == 0).sum()
    if neg_prices > 0:
        log.error("Found %d rows with negative Price — investigate before loading.", neg_prices)
        sys.exit(1)
    if zero_prices > 0:
        # Per Phase 1 decision: retain zero-price rows, business meaning unknown.
        log.warning(
            "Found %d rows with Price = 0 (%.2f%%). "
            "Business meaning is unknown; rows are retained as-is per Phase 1 decision.",
            zero_prices, zero_prices / len(df) * 100,
        )

    # Quantity validation
    neg_qty = (df["Quantity"] < 0).sum()
    zero_qty = (df["Quantity"] == 0).sum()
    if neg_qty > 0:
        log.error("Found %d rows with negative Quantity — investigate before loading.", neg_qty)
        sys.exit(1)
    if zero_qty > 0:
        log.warning("Found %d rows with Quantity = 0.", zero_qty)

    log.info(
        "Validation summary | neg_prices=%d | zero_prices=%d | neg_qty=%d | zero_qty=%d",
        neg_prices, zero_prices, neg_qty, zero_qty,
    )


def transform(df: pl.DataFrame) -> pl.DataFrame:
    """Steps 4–6 — Rename, compute line_revenue, select final columns."""
    log.info("Transforming data...")

    df = df.rename({"Group": "category"})  # 'Group' is a reserved SQL keyword

    # Compute line_revenue = price × quantity (stored as INTEGER, zero for zero-price rows)
    df = df.with_columns(
        (pl.col("Price") * pl.col("Quantity")).alias("line_revenue")
    )

    # Select and rename to snake_case for PostgreSQL
    df = df.select([
        pl.col("BillNo").alias("bill_no"),
        pl.col("Outlet_Name").alias("outlet_name"),
        pl.col("Order_Datetime").alias("order_datetime"),
        pl.col("category"),
        pl.col("Order_Type").alias("order_type"),
        pl.col("Item").alias("item"),
        pl.col("Price").alias("price"),
        pl.col("Quantity").cast(pl.Int16).alias("quantity"),
        pl.col("line_revenue"),
        pl.col("Settlement").alias("settlement"),
        pl.col("Brand").alias("brand"),
    ])

    # Log revenue sanity check
    total_revenue = df["line_revenue"].sum()
    log.info(
        "Transform complete: %d rows | total_revenue=%s",
        len(df), f"{total_revenue:,}",
    )

    return df


def setup_database(engine) -> None:
    """Step 7 — Create table and indexes if they don't exist."""
    log.info("Setting up database schema...")
    with engine.connect() as conn:
        conn.execute(text(CREATE_TABLE_SQL))
        for idx_sql in CREATE_INDEXES_SQL:
            conn.execute(text(idx_sql))
        conn.commit()
    log.info("Table and indexes are ready.")


def load_to_postgres(df: pl.DataFrame, engine) -> None:
    """Step 8 — TRUNCATE and bulk-insert in batches."""
    total_rows = len(df)
    log.info("Loading %d rows into PostgreSQL (batch size: %d)...", total_rows, BATCH_SIZE)

    with engine.connect() as conn:
        # Idempotent: truncate before inserting so re-runs are safe
        log.info("Truncating line_items table...")
        conn.execute(text("TRUNCATE TABLE line_items RESTART IDENTITY;"))
        conn.commit()

        # Convert to list of dicts for SQLAlchemy bulk insert
        t0 = time.perf_counter()
        records = df.to_dicts()
        batches = [records[i:i + BATCH_SIZE] for i in range(0, total_rows, BATCH_SIZE)]

        for batch_num, batch in enumerate(batches, start=1):
            conn.execute(
                text(
                    """
                    INSERT INTO line_items
                        (bill_no, outlet_name, order_datetime, category, order_type,
                         item, price, quantity, line_revenue, settlement, brand)
                    VALUES
                        (:bill_no, :outlet_name, :order_datetime, :category, :order_type,
                         :item, :price, :quantity, :line_revenue, :settlement, :brand)
                    """
                ),
                batch,
            )
            if batch_num % 5 == 0 or batch_num == len(batches):
                log.info("  Inserted batch %d/%d (%d rows so far)", batch_num, len(batches), batch_num * BATCH_SIZE)

        conn.commit()
        elapsed = time.perf_counter() - t0
        log.info("Insert complete: %d rows in %.1fs", total_rows, elapsed)


def verify_row_count(engine) -> None:
    """Step 9 — Verify the database row count matches the source."""
    log.info("Verifying row count...")
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM line_items;"))
        db_count = result.scalar()

    if db_count == EXPECTED_ROWS:
        log.info("✅ Row count verified: %d rows in line_items.", db_count)
    else:
        log.error(
            "❌ Row count mismatch! Database has %d rows; expected %d.",
            db_count, EXPECTED_ROWS,
        )
        sys.exit(1)


def verify_revenue(engine) -> None:
    """Step 10 — Spot-check total revenue against the Phase 1 computed value."""
    EXPECTED_REVENUE = 69_480_952  # Verified in Phase 1

    with engine.connect() as conn:
        result = conn.execute(text("SELECT SUM(line_revenue) FROM line_items;"))
        db_revenue = result.scalar()

    if db_revenue == EXPECTED_REVENUE:
        log.info("✅ Total revenue verified: Rs. %s", f"{db_revenue:,}")
    else:
        log.warning(
            "Revenue mismatch: DB has Rs. %s; Phase 1 baseline was Rs. %s. "
            "Difference: %s. Proceeding.",
            f"{db_revenue:,}", f"{EXPECTED_REVENUE:,}", f"{abs(db_revenue - EXPECTED_REVENUE):,}",
        )


def print_summary(engine) -> None:
    """Print a quick summary table from the database."""
    log.info("--- Database Summary ---")
    with engine.connect() as conn:
        row = conn.execute(text("""
            SELECT
                COUNT(*)                        AS total_records,
                COUNT(DISTINCT bill_no)         AS total_orders,
                SUM(quantity)                   AS items_sold,
                SUM(line_revenue)               AS total_revenue,
                ROUND(SUM(line_revenue)::numeric / NULLIF(COUNT(DISTINCT bill_no), 0), 2)
                                                AS avg_order_value
            FROM line_items;
        """)).fetchone()

    log.info("  Total Records : %s", f"{row[0]:,}")
    log.info("  Total Orders  : %s", f"{row[1]:,}")
    log.info("  Items Sold    : %s", f"{row[2]:,}")
    log.info("  Total Revenue : Rs. %s", f"{row[3]:,}")
    log.info("  Avg Order Val : Rs. %s", f"{row[4]:,}")
    log.info("------------------------")


# ─── Entry point ─────────────────────────────────────────────────────────────

def main() -> None:
    log.info("========================================")
    log.info(" InsightDesk ETL — Starting")
    log.info("========================================")

    db_url = load_env()
    engine = create_engine(db_url, echo=False)

    # Pipeline steps
    df_raw = read_excel()
    validate_structure(df_raw)
    validate_data(df_raw)
    df_final = transform(df_raw)
    setup_database(engine)
    load_to_postgres(df_final, engine)
    verify_row_count(engine)
    verify_revenue(engine)
    print_summary(engine)

    log.info("========================================")
    log.info(" InsightDesk ETL — Complete ✅")
    log.info("========================================")


if __name__ == "__main__":
    main()
