from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SellerBalanceResponse(BaseModel):
    seller_id: int
    brand_name: str
    available_balance: float
    iban: Optional[str]

class SettlementCreateRequest(BaseModel):
    seller_id: int

class SettlementUpdateRequest(BaseModel):
    status: Optional[str] = None
    tracking_ref: Optional[str] = None
    admin_notes: Optional[str] = None

class SettlementResponse(BaseModel):
    id: int
    seller_id: int
    amount: float
    status: str
    iban: str
    tracking_ref: Optional[str]
    settled_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True