"""
InsightDesk — Common filter parameters
Used as FastAPI query parameter dependencies across all analytics endpoints.
"""
from fastapi import Query
from typing import Optional
from dataclasses import dataclass


@dataclass
class CommonFilters:
    """
    Query parameters shared across analytics endpoints.
    All filters are optional — omitting them returns unfiltered data.
    """
    start_date: Optional[str] = Query(None, description="ISO date string, e.g. 2025-07-01")
    end_date:   Optional[str] = Query(None, description="ISO date string, e.g. 2026-01-31")
    outlet:     Optional[str] = Query(None, description="Filter by outlet name")
    category:   Optional[str] = Query(None, description="Filter by menu category")
    order_type: Optional[str] = Query(None, description="Filter by order type: Dine-In, Takeaway, Delivery")
    settlement: Optional[str] = Query(None, description="Filter by settlement type")
