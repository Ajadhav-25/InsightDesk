from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.filters import CommonFilters
from app.schemas.responses import SummaryResponse
from app.services import query_service

router = APIRouter()

@router.get("/dashboard/summary", response_model=SummaryResponse)
def get_dashboard_summary(
    filters: CommonFilters = Depends(),
    db: Session = Depends(get_db)
):
    """Returns top-level KPI metrics for the dashboard."""
    # Convert dataclass to dict, drop Nones
    filter_dict = {k: v for k, v in filters.__dict__.items() if v is not None}
    
    return query_service.get_summary(db, filter_dict)
