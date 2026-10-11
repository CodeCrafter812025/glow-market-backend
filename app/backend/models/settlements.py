from core.database import Base
from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

class Settlement(Base):
    __tablename__ = "settlements"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    seller_id = Column(Integer, ForeignKey("sellers.id"), index=True, nullable=False)
    
    amount = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="pending") # pending, completed, rejected
    iban = Column(String(26), nullable=False) # Snapshot of the IBAN used for this transfer
    tracking_ref = Column(String, nullable=True) # Admin inputs bank tracking code here
    admin_notes = Column(String, nullable=True)
    settled_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)

    seller = relationship("Sellers")
    order_items = relationship("OrderItem", back_populates="settlement")