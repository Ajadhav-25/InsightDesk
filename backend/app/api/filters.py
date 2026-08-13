from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.responses import FiltersResponse
from app.services import query_service

router = APIRouter()

@router.get("/filters", response_model=FiltersResponse)
def get_filters(db: Session = Depends(get_db)):
    """Returns available filter dropdown values directly from the database."""
    return query_service.get_filters(db)
