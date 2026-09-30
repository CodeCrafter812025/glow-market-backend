"""Zarinpal checkout endpoints (REST v4, sandbox-capable).

Flow
----
1. ``POST /api/v1/payment/zarinpal/request``
   * Recomputes the order total **server-side** (DB price is authoritative for
     any product that exists in the ``products`` table) so a tampered cart
     cannot change the charged amount.
   * Persists a ``pending`` row in ``payment_orders`` **before** redirecting.
   * Returns the gateway URL the browser must be sent to.

2. ``POST /api/v1/payment/zarinpal/verify``
   * Called by the frontend ``/payment/callback`` route with the ``Authority``
     and ``Status`` query params handed back by Zarinpal.
   * Idempotent: a refresh or a duplicate call never double-verifies; the stored
     ``ref_id`` is replayed instead.
"""

import json
import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional

from core.database import get_db
from fastapi import APIRouter, Depends, HTTPException, Request
from models.payment_orders import Payment_orders
from models.products import Products
from schemas.zarinpal_payment import (
    CartItemIn,
    PaymentRequestIn,
    PaymentRequestOut,
    PaymentVerifyIn,
    PaymentVerifyOut,
    VerifiedItem,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from services import zarinpal
from services.zarinpal import ZarinpalError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/payment/zarinpal", tags=["zarinpal"])

#: Shipping fees, expressed in the same unit the cart uses (thousand Toman).
SHIPPING_COST_UNITS: Dict[str, Decimal] = {
    "standard": Decimal("50"),
    "express": Decimal("85"),
}
DEFAULT_DELIVERY_METHOD = "standard"


def resolve_shipping_units(delivery_method: Optional[str]) -> Decimal:
    """Shipping fee for a delivery method, falling back to standard."""
    key = (delivery_method or DEFAULT_DELIVERY_METHOD).strip().lower()
    return SHIPPING_COST_UNITS.get(key, SHIPPING_COST_UNITS[DEFAULT_DELIVERY_METHOD])


STATUS_PENDING = "pending"
STATUS_PAID = "paid"
STATUS_FAILED = "failed"
STATUS_CANCELLED = "cancelled"


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #


async def _price_map(db: AsyncSession, product_ids: List[int]) -> Dict[int, Decimal]:
    """Authoritative price lookup.

    ``products.price`` is stored in **Toman**, while the cart works in
    thousand-Toman units, so the DB value is divided by 1000 to compare.
    """
    if not product_ids:
        return {}

    result = await db.execute(select(Products.id, Products.price).where(Products.id.in_(product_ids)))
    prices: Dict[int, Decimal] = {}
    for row in result.all():
        if row.price is None:
            continue
        prices[int(row.id)] = Decimal(str(row.price)) / Decimal(zarinpal.TOMAN_PER_PRICE_UNIT)
    return prices


def _build_description(items: List[CartItemIn]) -> str:
    count = sum(item.quantity for item in items)
    return f"خرید {count} کالا از گلومارکت"


def _serialize_items(items: List[CartItemIn], resolved: Dict[int, Decimal]) -> str:
    payload = [
        {
            "id": item.id,
            "title": item.title,
            "price": float(resolved.get(item.id, item.price)),
            "quantity": item.quantity,
        }
        for item in items
    ]
    return json.dumps(payload, ensure_ascii=False)


def _request_origin(request: Request, payload_origin: Optional[str]) -> Optional[str]:
    """Best-effort origin of the caller, used only if no env variable is set.

    Priority: explicit body hint -> ``Origin`` header -> ``Referer`` header.
    Each candidate is normalized, so a malformed value is skipped instead of
    producing a broken callback URL.
    """
    candidates = (
        payload_origin,
        request.headers.get("origin"),
        request.headers.get("referer"),
    )
    for candidate in candidates:
        normalized = zarinpal.normalize_site_origin(candidate)
        if normalized:
            return normalized
    return None


def _load_items(raw: Optional[str]) -> List[VerifiedItem]:
    if not raw:
        return []
    try:
        data = json.loads(raw)
    except (TypeError, ValueError):
        return []
    if not isinstance(data, list):
        return []

    parsed: List[VerifiedItem] = []
    for entry in data:
        if not isinstance(entry, dict):
            continue
        try:
            parsed.append(
                VerifiedItem(
                    id=int(entry.get("id", 0)),
                    title=str(entry.get("title", "")),
                    price=float(entry.get("price", 0) or 0),
                    quantity=int(entry.get("quantity", 1) or 1),
                )
            )
        except (TypeError, ValueError):
            continue
    return parsed


# --------------------------------------------------------------------------- #
# Endpoints
# --------------------------------------------------------------------------- #


def _merchant_configured() -> bool:
    """True when ZARINPAL_MERCHANT_ID is present in the backend environment."""
    try:
        zarinpal.merchant_id()
        return True
    except ZarinpalError:
        return False


@router.get("/config")
async def payment_config() -> Dict[str, Any]:
    """Non-secret gateway info for the UI (never exposes the merchant id)."""
    configured_origin = zarinpal.configured_site_origin()
    return {
        "provider": "zarinpal",
        "protocol": "rest_v4",
        "sandbox": zarinpal.use_sandbox(),
        "configured": _merchant_configured(),
        # Which env var names are honoured, and whether one is currently set.
        # Helps confirm a domain cutover without reading the value from code.
        "site_origin_env_vars": list(zarinpal.SITE_ORIGIN_ENV_VARS),
        "site_origin_configured": configured_origin is not None,
        "callback_url": f"{configured_origin}{zarinpal.CALLBACK_PATH}" if configured_origin else None,
        "shipping_costs_toman": {
            method: int(units) * zarinpal.TOMAN_PER_PRICE_UNIT for method, units in SHIPPING_COST_UNITS.items()
        },
    }


@router.post("/request", response_model=PaymentRequestOut)
async def create_payment_request(
    payload: PaymentRequestIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> PaymentRequestOut:
    """Create a Zarinpal payment request and persist the pending order."""
    product_ids = [item.id for item in payload.items]
    db_prices = await _price_map(db, product_ids)

    # Server-side total. DB price wins whenever the product is known.
    subtotal_units = Decimal("0")
    for item in payload.items:
        unit_price = db_prices.get(item.id, item.price)
        if unit_price <= 0:
            raise HTTPException(status_code=400, detail=f"قیمت کالای «{item.title or item.id}» نامعتبر است.")
        subtotal_units += unit_price * Decimal(item.quantity)

    total_units = subtotal_units + resolve_shipping_units(payload.delivery_method)
    amount_toman = zarinpal.price_units_to_toman(total_units)
    amount_rial = zarinpal.toman_to_rial(amount_toman)

    order_code = zarinpal.generate_order_code()

    # Env variable wins; the request origin is only a today-still-works fallback.
    # An unusable origin raises a readable error instead of stranding the buyer
    # behind a malformed callback URL after they have already paid.
    try:
        callback_url = zarinpal.build_callback_url(_request_origin(request, payload.callback_origin))
    except ZarinpalError as exc:
        logger.error("Cannot compose Zarinpal callback URL: %s", exc.message)
        raise HTTPException(status_code=500, detail=exc.message)

    logger.info("Zarinpal callback_url resolved to %s", callback_url)

    try:
        result = await zarinpal.request_payment(
            amount_rial=amount_rial,
            description=_build_description(payload.items),
            callback_url=callback_url,
            mobile=payload.customer_phone,
            email=payload.customer_email,
        )
    except ZarinpalError as exc:
        logger.warning("Zarinpal request failed for order %s: %s", order_code, exc.message)
        raise HTTPException(status_code=502, detail=exc.message)

    order = Payment_orders(
        order_code=order_code,
        amount_rial=amount_rial,
        amount_toman=amount_toman,
        description=_build_description(payload.items),
        authority=result.authority,
        status=STATUS_PENDING,
        items_json=_serialize_items(payload.items, db_prices),
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        customer_email=payload.customer_email,
        shipping_address=payload.shipping_address,
        delivery_method=payload.delivery_method,
    )
    db.add(order)
    await db.commit()

    logger.info(
        "Zarinpal pending order %s created (authority=%s, amount_rial=%s)",
        order_code,
        result.authority,
        amount_rial,
    )

    return PaymentRequestOut(
        payment_url=result.payment_url,
        authority=result.authority,
        order_code=order_code,
        amount_rial=amount_rial,
        amount_toman=amount_toman,
        sandbox=zarinpal.use_sandbox(),
    )


@router.post("/verify", response_model=PaymentVerifyOut)
async def verify_payment(
    payload: PaymentVerifyIn,
    db: AsyncSession = Depends(get_db),
) -> PaymentVerifyOut:
    """Verify a returned Zarinpal payment. Safe to call more than once."""
    result = await db.execute(select(Payment_orders).where(Payment_orders.authority == payload.authority))
    order = result.scalars().first()

    if order is None:
        logger.warning("Verify called with unknown authority=%s", payload.authority)
        raise HTTPException(status_code=404, detail="سفارشی برای این پرداخت یافت نشد.")

    items = _load_items(order.items_json)

    # --- Idempotency: already settled, just replay the stored outcome. ------- #
    if order.status == STATUS_PAID:
        return PaymentVerifyOut(
            success=True,
            status=STATUS_PAID,
            message="این پرداخت قبلاً با موفقیت تأیید شده است.",
            order_code=order.order_code,
            ref_id=order.ref_id,
            card_pan=order.card_pan,
            amount_toman=order.amount_toman,
            already_verified=True,
            items=items,
        )

    if order.status in (STATUS_FAILED, STATUS_CANCELLED):
        return PaymentVerifyOut(
            success=False,
            status=order.status,
            message=order.failure_reason or "پرداخت این سفارش ناموفق بوده است.",
            order_code=order.order_code,
            amount_toman=order.amount_toman,
            items=items,
        )

    # --- Customer aborted on the gateway ------------------------------------ #
    if (payload.status or "").upper() != "OK":
        order.status = STATUS_CANCELLED
        order.failure_reason = "پرداخت توسط کاربر لغو شد."
        await db.commit()
        return PaymentVerifyOut(
            success=False,
            status=STATUS_CANCELLED,
            message="پرداخت توسط شما لغو شد. مبلغی از حساب شما کسر نشده است.",
            order_code=order.order_code,
            amount_toman=order.amount_toman,
            items=items,
        )

    # --- Real verification against Zarinpal --------------------------------- #
    try:
        verification = await zarinpal.verify_payment(
            amount_rial=int(order.amount_rial),
            authority=payload.authority,
        )
    except ZarinpalError as exc:
        order.status = STATUS_FAILED
        order.failure_reason = exc.message
        await db.commit()
        logger.warning("Zarinpal verify failed for order %s: %s", order.order_code, exc.message)
        return PaymentVerifyOut(
            success=False,
            status=STATUS_FAILED,
            message=exc.message,
            order_code=order.order_code,
            amount_toman=order.amount_toman,
            items=items,
        )

    order.status = STATUS_PAID
    order.ref_id = verification.ref_id
    order.card_pan = verification.card_pan
    order.failure_reason = None
    order.verified_at = datetime.now(timezone.utc)
    await db.commit()

    logger.info("Zarinpal order %s verified (ref_id=%s)", order.order_code, order.ref_id)

    return PaymentVerifyOut(
        success=True,
        status=STATUS_PAID,
        message="پرداخت شما با موفقیت انجام شد.",
        order_code=order.order_code,
        ref_id=order.ref_id,
        card_pan=order.card_pan,
        amount_toman=order.amount_toman,
        already_verified=verification.already_verified,
        items=items,
    )
