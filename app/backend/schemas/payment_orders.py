"""Pydantic DTOs for the ``payment_orders`` entity.

These models back the generic CRUD router (``/api/v1/entities/payment_orders``)
and describe how order information and payment status are persisted/read from
the ``payment_orders`` table.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class Payment_ordersData(BaseModel):
    """Entity data schema (for create/update)"""

    order_code: str
    amount_rial: int
    amount_toman: int = None
    description: str = None
    authority: str = None
    ref_id: str = None
    card_pan: str = None
    status: str
    items_json: str = None
    customer_name: str = None
    customer_phone: str = None
    customer_email: str = None
    shipping_address: str = None
    delivery_method: str = None
    failure_reason: str = None
    verified_at: Optional[datetime] = None


class Payment_ordersUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""

    order_code: Optional[str] = None
    amount_rial: Optional[int] = None
    amount_toman: Optional[int] = None
    description: Optional[str] = None
    authority: Optional[str] = None
    ref_id: Optional[str] = None
    card_pan: Optional[str] = None
    status: Optional[str] = None
    items_json: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    shipping_address: Optional[str] = None
    delivery_method: Optional[str] = None
    failure_reason: Optional[str] = None
    verified_at: Optional[datetime] = None


class Payment_ordersResponse(BaseModel):
    """Entity response schema"""

    id: int
    order_code: str
    amount_rial: int
    amount_toman: Optional[int] = None
    description: Optional[str] = None
    authority: Optional[str] = None
    ref_id: Optional[str] = None
    card_pan: Optional[str] = None
    status: str
    items_json: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    shipping_address: Optional[str] = None
    delivery_method: Optional[str] = None
    failure_reason: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Payment_ordersListResponse(BaseModel):
    """List response schema"""

    items: List[Payment_ordersResponse]
    total: int
    skip: int
    limit: int


class Payment_ordersBatchCreateRequest(BaseModel):
    """Batch create request"""

    items: List[Payment_ordersData]


class Payment_ordersBatchUpdateItem(BaseModel):
    """Batch update item"""

    id: int
    updates: Payment_ordersUpdateData


class Payment_ordersBatchUpdateRequest(BaseModel):
    """Batch update request"""

    items: List[Payment_ordersBatchUpdateItem]


class Payment_ordersBatchDeleteRequest(BaseModel):
    """Batch delete request"""

    ids: List[int]
