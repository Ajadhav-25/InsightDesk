from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.filters import CommonFilters
from app.schemas.responses import PaginatedOrdersResponse
from app.services import query_service

router = APIRouter()

@router.get("/orders", response_model=PaginatedOrdersResponse)
def get_orders(
    filters: CommonFilters = Depends(),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=1000, description="Items per page"),
    sort_by: str = Query("order_datetime", description="Column to sort by"),
    sort_dir: str = Query("desc", description="Sort direction (asc or desc)"),
    db: Session = Depends(get_db)
):
    """Returns paginated orders with applied filters."""
    filter_dict = {k: v for k, v in filters.__dict__.items() if v is not None}
    
    # Cast datetime to string for response using BaseModel serialization if needed,
    # but the service layer uses Pydantic's automatic handling.
    # Actually query_service.get_orders returns dicts, we just pass them to Pydantic.
    result = query_service.get_orders(db, filter_dict, page=page, limit=limit, sort_by=sort_by, sort_dir=sort_dir)
    
    # Format dates
    for row in result["data"]:
        if hasattr(row["order_datetime"], "isoformat"):
            row["order_datetime"] = row["order_datetime"].isoformat()
            
    return result
