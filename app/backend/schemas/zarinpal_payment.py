"""Pydantic DTOs for the Zarinpal payment flow.

These models describe the wire format between the frontend and the two
checkout endpoints (``POST /api/v1/payment/zarinpal/request`` and
``POST /api/v1/payment/zarinpal/verify``). They are kept here — rather than in
the router — so the request/response contract is easy to import, document and
reuse.
"""

from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class CartItemIn(BaseModel):
    """One cart line as sent by the browser. Prices are re-checked server-side."""

    id: int
    title: str = ""
    price: Decimal = Decimal("0")
    quantity: int = 1

    @field_validator("quantity")
    @classmethod
    def clamp_quantity(cls, value: int) -> int:
        if value < 1:
            raise ValueError("تعداد هر کالا باید حداقل ۱ باشد.")
        if value > 50:
            raise ValueError("تعداد هر کالا نمی‌تواند بیش از ۵۰ باشد.")
        return value

    @field_validator("price")
    @classmethod
    def non_negative_price(cls, value: Decimal) -> Decimal:
        if value < 0:
            raise ValueError("قیمت کالا نامعتبر است.")
        return value


class PaymentRequestIn(BaseModel):
    """Request body for creating a Zarinpal payment."""

    items: List[CartItemIn] = Field(..., min_length=1)
    #: Optional hint only. The configured ``PUBLIC_SITE_URL`` always wins, so a
    #: custom-domain cutover never depends on what the browser reports.
    callback_origin: Optional[str] = Field(
        default=None,
        description="Fallback origin of the frontend, used only when PUBLIC_SITE_URL is unset.",
    )
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    shipping_address: Optional[str] = None
    delivery_method: Optional[str] = None


class PaymentRequestOut(BaseModel):
    """Response returned after a successful payment request."""

    payment_url: str
    authority: str
    order_code: str
    amount_rial: int
    amount_toman: int
    sandbox: bool


class PaymentVerifyIn(BaseModel):
    """Request body for verifying a returned payment."""

    authority: str = Field(..., min_length=5)
    status: Optional[str] = None


class VerifiedItem(BaseModel):
    id: int
    title: str
    price: float
    quantity: int


class PaymentVerifyOut(BaseModel):
    """Response returned after verifying a payment (idempotent)."""

    success: bool
    status: str
    message: str
    order_code: Optional[str] = None
    ref_id: Optional[str] = None
    card_pan: Optional[str] = None
    amount_toman: Optional[int] = None
    already_verified: bool = False
    items: List[VerifiedItem] = []
