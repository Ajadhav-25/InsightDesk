"""
InsightDesk — Query service
SQL query logic for Phase 3.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime
from app.models.line_item import LineItem


def apply_filters(query, filters: dict):
    """
    Applies shared filters to a SQLAlchemy query object based on the filters dictionary.
    """
    if not filters:
        return query

    if filters.get("start_date"):
        try:
            # Parse date string to append time if needed, or rely on Postgres implicit cast
            query = query.filter(LineItem.order_datetime >= filters["start_date"])
        except ValueError:
            pass

    if filters.get("end_date"):
        try:
            query = query.filter(LineItem.order_datetime <= filters["end_date"])
        except ValueError:
            pass

    if filters.get("outlet"):
        query = query.filter(LineItem.outlet_name == filters["outlet"])

    if filters.get("category"):
        query = query.filter(LineItem.category == filters["category"])

    if filters.get("order_type"):
        query = query.filter(LineItem.order_type == filters["order_type"])
        
    if filters.get("settlement"):
        query = query.filter(LineItem.settlement == filters["settlement"])
        
    if filters.get("brand"):
        query = query.filter(LineItem.brand == filters["brand"])

    return query


def get_summary(db: Session, filters: dict) -> dict:
    """
    Returns 5 KPI metrics in a single SQL query.
    """
    query = db.query(
        func.count(LineItem.id).label("total_records"),
        func.count(func.distinct(LineItem.bill_no)).label("total_orders"),
        func.sum(LineItem.line_revenue).label("total_revenue"),
        func.sum(LineItem.quantity).label("items_sold")
    )
    query = apply_filters(query, filters)
    result = query.first()

    total_records = result.total_records or 0
    total_orders = result.total_orders or 0
    total_revenue = result.total_revenue or 0
    items_sold = result.items_sold or 0

    average_order_value = 0.0
    if total_orders > 0:
        average_order_value = total_revenue / total_orders

    return {
        "total_records": total_records,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "items_sold": items_sold,
        "average_order_value": round(average_order_value, 2)
    }


def get_revenue_trend(db: Session, filters: dict) -> list:
    """
    Returns monthly revenue trend.
    """
    # Group by year-month (YYYY-MM) string format for easy charting
    month_expr = func.to_char(LineItem.order_datetime, 'YYYY-MM')
    
    query = db.query(
        month_expr.label("month"),
        func.sum(LineItem.line_revenue).label("revenue"),
        func.count(func.distinct(LineItem.bill_no)).label("orders")
    ).group_by(month_expr).order_by(month_expr)
    
    query = apply_filters(query, filters)
    results = query.all()
    
    return [
        {
            "month": r.month,
            "revenue": r.revenue or 0,
            "orders": r.orders or 0
        } for r in results
    ]


def get_outlets(db: Session, filters: dict) -> list:
    """Returns revenue, orders, records grouped by outlet_name."""
    query = db.query(
        LineItem.outlet_name.label("outlet"),
        func.sum(LineItem.line_revenue).label("revenue"),
        func.count(func.distinct(LineItem.bill_no)).label("orders"),
        func.count(LineItem.id).label("records")
    ).group_by(LineItem.outlet_name).order_by(desc("revenue"))
    
    query = apply_filters(query, filters)
    results = query.all()
    
    return [
        {
            "outlet": r.outlet,
            "revenue": r.revenue or 0,
            "orders": r.orders or 0,
            "records": r.records or 0
        } for r in results
    ]


def get_categories(db: Session, filters: dict) -> list:
    """Returns revenue, records grouped by category."""
    query = db.query(
        LineItem.category.label("category"),
        func.sum(LineItem.line_revenue).label("revenue"),
        func.count(LineItem.id).label("records")
    ).group_by(LineItem.category).order_by(desc("revenue"))
    
    query = apply_filters(query, filters)
    results = query.all()
    
    return [
        {
            "category": r.category,
            "revenue": r.revenue or 0,
            "records": r.records or 0
        } for r in results
    ]


def get_order_types(db: Session, filters: dict) -> list:
    """Returns revenue, orders, records grouped by order_type."""
    query = db.query(
        LineItem.order_type.label("order_type"),
        func.sum(LineItem.line_revenue).label("revenue"),
        func.count(func.distinct(LineItem.bill_no)).label("orders"),
        func.count(LineItem.id).label("records")
    ).group_by(LineItem.order_type).order_by(desc("revenue"))
    
    query = apply_filters(query, filters)
    results = query.all()
    
    return [
        {
            "order_type": r.order_type,
            "revenue": r.revenue or 0,
            "orders": r.orders or 0,
            "records": r.records or 0
        } for r in results
    ]


def get_products(db: Session, filters: dict, sort_by: str, limit: int) -> list:
    """Returns product rankings grouped by item."""
    query = db.query(
        LineItem.item.label("item"),
        LineItem.category.label("category"),
        func.sum(LineItem.line_revenue).label("revenue"),
        func.sum(LineItem.quantity).label("quantity"),
        func.count(LineItem.id).label("records")
    ).group_by(LineItem.item, LineItem.category)
    
    query = apply_filters(query, filters)
    
    # Simple sort handling
    if sort_by == "quantity":
        query = query.order_by(desc("quantity"))
    else:
        query = query.order_by(desc("revenue"))
        
    if limit > 0:
        query = query.limit(limit)
        
    results = query.all()
    
    return [
        {
            "item": r.item,
            "category": r.category,
            "revenue": r.revenue or 0,
            "quantity": r.quantity or 0,
            "records": r.records or 0
        } for r in results
    ]


def get_settlement(db: Session, filters: dict) -> list:
    """Returns revenue, records grouped by settlement."""
    query = db.query(
        LineItem.settlement.label("settlement"),
        func.sum(LineItem.line_revenue).label("revenue"),
        func.count(LineItem.id).label("records")
    ).group_by(LineItem.settlement).order_by(desc("revenue"))
    
    query = apply_filters(query, filters)
    results = query.all()
    
    return [
        {
            "settlement": r.settlement,
            "revenue": r.revenue or 0,
            "records": r.records or 0
        } for r in results
    ]


def get_orders(db: Session, filters: dict, page: int, limit: int, sort_by: str, sort_dir: str) -> dict:
    """Returns paginated line-item rows with total count."""
    query = db.query(LineItem)
    query = apply_filters(query, filters)
    
    total = query.count()
    
    # Basic sorting logic
    if hasattr(LineItem, sort_by):
        column = getattr(LineItem, sort_by)
        if sort_dir.lower() == "desc":
            query = query.order_by(desc(column))
        else:
            query = query.order_by(column)
    else:
        # Default sort
        query = query.order_by(desc(LineItem.order_datetime))
        
    offset = (page - 1) * limit
    # Cap limit to avoid massive queries
    limit = min(limit, 1000)
    
    records = query.offset(offset).limit(limit).all()
    total_pages = (total + limit - 1) // limit if limit > 0 else 0
    
    return {
        "data": [r.__dict__ for r in records],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }


def get_filters(db: Session) -> dict:
    """Returns all distinct filter values and date range from the database."""
    outlets = [r[0] for r in db.query(LineItem.outlet_name).distinct().order_by(LineItem.outlet_name).all()]
    categories = [r[0] for r in db.query(LineItem.category).distinct().order_by(LineItem.category).all()]
    order_types = [r[0] for r in db.query(LineItem.order_type).distinct().order_by(LineItem.order_type).all()]
    settlements = [r[0] for r in db.query(LineItem.settlement).distinct().order_by(LineItem.settlement).all()]
    brands = [r[0] for r in db.query(LineItem.brand).distinct().order_by(LineItem.brand).all()]
    
    date_range = db.query(
        func.min(LineItem.order_datetime).label("min_date"),
        func.max(LineItem.order_datetime).label("max_date")
    ).first()
    
    # Return as strings for easy json serialization
    min_date = date_range.min_date.isoformat() if date_range.min_date else None
    max_date = date_range.max_date.isoformat() if date_range.max_date else None
    
    return {
        "outlets": outlets,
        "categories": categories,
        "order_types": order_types,
        "settlements": settlements,
        "brands": brands,
        "date_range": {
            "min": min_date,
            "max": max_date
        }
    }
