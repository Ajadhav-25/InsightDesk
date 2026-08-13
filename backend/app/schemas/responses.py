"""
InsightDesk — Pydantic response schemas
Defined here; fully populated in Phase 3.
"""
from pydantic import BaseModel
from typing import Optional


class SummaryResponse(BaseModel):
    total_records: int
    total_orders: int
    total_revenue: int
    items_sold: int
    average_order_value: float


class RevenueTrendPoint(BaseModel):
    month: str
    revenue: int
    orders: int


class OutletData(BaseModel):
    outlet: str
    revenue: int
    orders: int
    records: int


class CategoryData(BaseModel):
    category: str
    revenue: int
    records: int


class OrderTypeData(BaseModel):
    order_type: str
    revenue: int
    orders: int
    records: int


class ProductData(BaseModel):
    item: str
    category: str
    revenue: int
    quantity: int
    records: int


class SettlementData(BaseModel):
    settlement: str
    revenue: int
    records: int


class OrderRow(BaseModel):
    id: int
    bill_no: int
    order_datetime: str
    outlet_name: str
    item: str
    category: str
    order_type: str
    quantity: int
    price: int
    line_revenue: int
    settlement: str
    brand: str


class PaginatedOrdersResponse(BaseModel):
    data: list[OrderRow]
    total: int
    page: int
    limit: int
    total_pages: int


class FiltersResponse(BaseModel):
    outlets: list[str]
    categories: list[str]
    order_types: list[str]
    settlements: list[str]
    date_range: dict
