from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String


class Payment_orders(Base):
    __tablename__ = "payment_orders"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    order_code = Column(String, nullable=False)
    amount_rial = Column(Integer, nullable=False)
    amount_toman = Column(Integer, nullable=True)
    description = Column(String, nullable=True)
    authority = Column(String, nullable=True)
    ref_id = Column(String, index=True, nullable=True)
    card_pan = Column(String, nullable=True)
    status = Column(String, nullable=False)
    items_json = Column(String, nullable=True)
    customer_name = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)
    customer_email = Column(String, nullable=True)
    shipping_address = Column(String, nullable=True)
    delivery_method = Column(String, nullable=True)
    failure_reason = Column(String, nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)