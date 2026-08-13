"""
InsightDesk — Query service
SQL query logic — fully implemented in Phase 3.
This stub documents the planned functions.
"""
from sqlalchemy.orm import Session


def get_summary(db: Session, filters: dict) -> dict:
    """
    Returns 5 KPI metrics in a single SQL query.
    SQL: SELECT COUNT(*), COUNT(DISTINCT bill_no), SUM(line_revenue), SUM(quantity) ...
    """
    raise NotImplementedError("Implemented in Phase 3")


def get_revenue_trend(db: Session, filters: dict) -> list:
    """
    Returns monthly revenue trend.
    SQL: GROUP BY DATE_TRUNC('month', order_datetime)
    """
    raise NotImplementedError("Implemented in Phase 3")


def get_outlets(db: Session, filters: dict) -> list:
    """Returns revenue, orders, records grouped by outlet_name."""
    raise NotImplementedError("Implemented in Phase 3")


def get_categories(db: Session, filters: dict) -> list:
    """Returns revenue, records grouped by category."""
    raise NotImplementedError("Implemented in Phase 3")


def get_order_types(db: Session, filters: dict) -> list:
    """Returns revenue, orders, records grouped by order_type."""
    raise NotImplementedError("Implemented in Phase 3")


def get_products(db: Session, filters: dict, sort_by: str, limit: int) -> list:
    """Returns product rankings grouped by item."""
    raise NotImplementedError("Implemented in Phase 3")


def get_settlement(db: Session, filters: dict) -> list:
    """Returns revenue, records grouped by settlement."""
    raise NotImplementedError("Implemented in Phase 3")


def get_orders(db: Session, filters: dict, page: int, limit: int, sort_by: str, sort_dir: str) -> dict:
    """Returns paginated line-item rows with total count."""
    raise NotImplementedError("Implemented in Phase 3")


def get_filters(db: Session) -> dict:
    """Returns all distinct filter values and date range from the database."""
    raise NotImplementedError("Implemented in Phase 3")
