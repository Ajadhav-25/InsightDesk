from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.filters import CommonFilters
from app.schemas.responses import (
    RevenueTrendPoint,
    OutletData,
    CategoryData,
    OrderTypeData,
    ProductData,
    SettlementData
)
from app.services import query_service

router = APIRouter()


@router.get("/revenue-trend", response_model=list[RevenueTrendPoint])
def get_revenue_trend(
    filters: CommonFilters = Depends(),
    db: Session = Depends(get_db)
):
    filter_dict = {k: v for k, v in filters.__dict__.items() if v is not None}
    return query_service.get_revenue_trend(db, filter_dict)


@router.get("/outlets", response_model=list[OutletData])
def get_outlets(
    filters: CommonFilters = Depends(),
    db: Session = Depends(get_db)
):
    filter_dict = {k: v for k, v in filters.__dict__.items() if v is not None}
    return query_service.get_outlets(db, filter_dict)


@router.get("/categories", response_model=list[CategoryData])
def get_categories(
    filters: CommonFilters = Depends(),
    db: Session = Depends(get_db)
):
    filter_dict = {k: v for k, v in filters.__dict__.items() if v is not None}
    return query_service.get_categories(db, filter_dict)


@router.get("/order-types", response_model=list[OrderTypeData])
def get_order_types(
    filters: CommonFilters = Depends(),
    db: Session = Depends(get_db)
):
    filter_dict = {k: v for k, v in filters.__dict__.items() if v is not None}
    return query_service.get_order_types(db, filter_dict)


@router.get("/products", response_model=list[ProductData])
def get_products(
    filters: CommonFilters = Depends(),
    sort_by: str = Query("revenue", description="Sort by 'revenue' or 'quantity'"),
    limit: int = Query(10, description="Limit number of returned products (0 for all)"),
    db: Session = Depends(get_db)
):
    filter_dict = {k: v for k, v in filters.__dict__.items() if v is not None}
    return query_service.get_products(db, filter_dict, sort_by=sort_by, limit=limit)


@router.get("/settlement", response_model=list[SettlementData])
def get_settlement(
    filters: CommonFilters = Depends(),
    db: Session = Depends(get_db)
):
    filter_dict = {k: v for k, v in filters.__dict__.items() if v is not None}
    return query_service.get_settlement(db, filter_dict)
