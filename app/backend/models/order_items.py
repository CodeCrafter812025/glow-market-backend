from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    order_id = Column(Integer, ForeignKey("payment_orders.id"), index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), index=True, nullable=False)
    seller_id = Column(Integer, ForeignKey("sellers.id"), index=True, nullable=False)
    
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False) # Snapshot of product price
    commission_rate = Column(Float, nullable=False, default=0.0) # Snapshot of seller commission
    seller_share = Column(Float, nullable=False) # Snapshot of calculated share

    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)

    order = relationship("Payment_orders", back_populates="order_items")
    product = relationship("Products")
    seller = relationship("Sellers")