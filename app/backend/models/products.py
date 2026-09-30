from core.database import Base
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String


class Products(Base):
    __tablename__ = "products"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    seller_id = Column(Integer, index=True, nullable=False)
    title = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    description = Column(String, nullable=True)
    target_skin_type = Column(String, nullable=True)
    target_concerns = Column(String, nullable=True)
    category = Column(String, nullable=True)
    is_sensitive_friendly = Column(Boolean, nullable=True, default=False, server_default='false')
    target_goals = Column(String, nullable=True)
    rating = Column(Float, nullable=True, default=0, server_default='0')
    review_count = Column(Integer, nullable=True, default=0, server_default='0')
    verified = Column(Boolean, nullable=True, default=False, server_default='false')
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)