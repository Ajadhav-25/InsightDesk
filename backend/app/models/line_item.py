"""
InsightDesk — SQLAlchemy ORM model for the line_items table.
Matches the schema defined in etl/scripts/load_data.py exactly.
"""
from sqlalchemy import Column, Integer, SmallInteger, String, DateTime
from app.db.session import Base


class LineItem(Base):
    __tablename__ = "line_items"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    bill_no        = Column(Integer, nullable=False, index=True)
    outlet_name    = Column(String(100), nullable=False, index=True)
    order_datetime = Column(DateTime(timezone=True), nullable=False, index=True)
    category       = Column(String(50), nullable=False, index=True)
    order_type     = Column(String(20), nullable=False, index=True)
    item           = Column(String(150), nullable=False)
    price          = Column(Integer, nullable=False)
    quantity       = Column(SmallInteger, nullable=False)
    line_revenue   = Column(Integer, nullable=False)
    settlement     = Column(String(50), nullable=False)
    brand          = Column(String(100), nullable=False)
