from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from core.database import Base


class UserTestHistory(Base):
    """Stores customer quiz answers and derived tags privately (isolated from sellers)."""
    __tablename__ = "user_test_history"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String(255), ForeignKey("users.id"), index=True, nullable=True)
    root_category = Column(String(50), nullable=False, index=True)  # skin, hair, body
    answers_json = Column(Text, nullable=False)
    derived_tags_json = Column(Text, nullable=False)
    recommended_product_ids_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now, nullable=False)