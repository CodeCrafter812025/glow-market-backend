from core.database import Base
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Float
from sqlalchemy.orm import relationship


class Sellers(Base):
    __tablename__ = "sellers"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    #: The platform user that owns this seller profile. One user -> one seller
    #: (MVP). Nullable so an admin can create the seller first and link the user
    #: afterwards. Unique guarantees a user cannot own more than one seller.
    user_id = Column(String(255), ForeignKey("users.id"), unique=True, index=True, nullable=True)
    iban = Column(String(26), nullable=True)
    commission_rate = Column(Float, default=0.0, nullable=False)
    brand_name = Column(String, nullable=False)
    is_founder = Column(Boolean, nullable=True, default=False, server_default='false')
    contact_phone = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="seller", uselist=False)
