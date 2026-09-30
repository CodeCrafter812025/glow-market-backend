from core.database import Base
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class Sellers(Base):
    __tablename__ = "sellers"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    brand_name = Column(String, nullable=False)
    is_founder = Column(Boolean, nullable=True, default=False, server_default='false')
    contact_phone = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)