"""Zarinpal payment gateway client (REST v4, sandbox-capable).

Design notes
------------
* **REST, not GraphQL.** The customer-facing payment flow (create a payment
  request, redirect to ``StartPay``, then verify on callback) is only available
  through Zarinpal's REST v4 API and is authenticated with a ``merchant_id``.
  Zarinpal's GraphQL endpoint (``zarinpal_graphql_url`` in ``core.config``) is a
  separate OAuth 2.0 API for account/terminal/transaction *management* and has no
  mutation for initiating or verifying a payment — so it is intentionally not
  used here.
* **Single host switch.** The sandbox vs production base host is resolved in ONE
  place (``gateway_host``), driven by ``settings.zarinpal_use_sandbox``.
* **Currency unit.** GlowMarket stores every price in *thousand Toman* units
  (a stored ``68.00`` is displayed as ``68,000 تومان``). Zarinpal expects an
  **integer amount in Rial**. The conversion chain is therefore:

      stored price unit  ->  Toman (x1000)  ->  Rial (x10)

  All conversion happens here so no caller has to remember the factor.
* **Merchant id stays backend-only.** It is read from ``settings`` (the
  ``ZARINPAL_MERCHANT_ID`` environment variable) and is never returned to the
  frontend.
"""

import logging
import os
import random
import re
import string
from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal
from typing import Any, Dict, Optional
from urllib.parse import urlparse

import httpx

from core.config import settings

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Currency helpers
# --------------------------------------------------------------------------- #

#: One stored price unit equals this many Toman.
TOMAN_PER_PRICE_UNIT = 1000
#: Iranian Rial per Toman.
RIAL_PER_TOMAN = 10

#: Zarinpal rejects amounts below 1,000 Toman (10,000 Rial).
MIN_AMOUNT_RIAL = 10_000
#: Guard rail so a malformed cart can never overflow the integer amount column.
MAX_AMOUNT_RIAL = 2_000_000_000


def price_units_to_toman(price_units: Decimal) -> int:
    """Convert a stored price (thousand-Toman units) into whole Toman."""
    toman = Decimal(price_units) * Decimal(TOMAN_PER_PRICE_UNIT)
    return int(toman.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def toman_to_rial(toman: int) -> int:
    """Convert Toman into the Rial amount Zarinpal expects."""
    return int(toman) * RIAL_PER_TOMAN


def validate_amount_rial(amount_rial: int) -> None:
    """Reject amounts the gateway would refuse anyway."""
    if amount_rial < MIN_AMOUNT_RIAL:
        raise ZarinpalError(
            "مبلغ سفارش کمتر از حداقل مجاز درگاه پرداخت است (۱۰۰۰ تومان).",
            code=None,
        )
    if amount_rial > MAX_AMOUNT_RIAL:
        raise ZarinpalError("مبلغ سفارش بیش از حد مجاز است.", code=None)


# --------------------------------------------------------------------------- #
# Errors
# --------------------------------------------------------------------------- #


class ZarinpalError(Exception):
    """A Zarinpal-level failure carrying a Persian, user-safe message."""

    def __init__(self, message: str, code: Optional[int] = None):
        super().__init__(message)
        self.message = message
        self.code = code


#: Persian explanations for the Zarinpal status codes we can actually surface.
ERROR_MESSAGES: Dict[int, str] = {
    -9: "اطلاعات ارسالی به درگاه پرداخت نامعتبر است.",
    -10: "شناسه پذیرنده یا آی‌پی فروشگاه نامعتبر است.",
    -11: "درخواست مورد نظر یافت نشد.",
    -12: "امکان ویرایش درخواست وجود ندارد.",
    -15: "درگاه پرداخت غیرفعال است. با پشتیبانی زرین‌پال تماس بگیرید.",
    -16: "سطح تأیید پذیرنده پایین‌تر از سطح مجاز است.",
    -30: "پذیرنده اجازه دسترسی به این سرویس را ندارد.",
    -31: "حساب بانکی متصل به درگاه تأیید نشده است.",
    -32: "مبلغ تراکنش با مبلغ پرداخت‌شده مطابقت ندارد.",
    -33: "مبلغ تراکنش نامعتبر است.",
    -34: "سقف تعداد یا مبلغ تراکنش عبور کرده است.",
    -40: "پارامترهای اضافی نامعتبر هستند.",
    -50: "مبلغ پرداخت‌شده با مبلغ درخواست مطابقت ندارد.",
    -51: "پرداخت ناموفق بود.",
    -52: "خطای غیرمنتظره در درگاه پرداخت رخ داد.",
    -53: "این پرداخت متعلق به این پذیرنده نیست.",
    -54: "درخواست مورد نظر آرشیو شده است.",
    101: "این تراکنش پیش‌تر تأیید شده است.",
}


def message_for_code(code: Optional[int], fallback: str) -> str:
    """Best-effort Persian message for a gateway code."""
    if code is None:
        return fallback
    return ERROR_MESSAGES.get(code, fallback)


# --------------------------------------------------------------------------- #
# Gateway configuration — the ONE place that knows about sandbox vs production
# --------------------------------------------------------------------------- #


def use_sandbox() -> bool:
    """True when the sandbox gateway should be used."""
    return bool(settings.zarinpal_use_sandbox)


def gateway_host() -> str:
    """Base host for every Zarinpal call. Single source of truth."""
    return settings.zarinpal_gateway_url


def request_endpoint() -> str:
    return f"{gateway_host()}/pg/v4/payment/request.json"


def verify_endpoint() -> str:
    return f"{gateway_host()}/pg/v4/payment/verify.json"


def start_pay_url(authority: str) -> str:
    """Browser redirect URL the customer must be sent to."""
    return f"{gateway_host()}/pg/StartPay/{authority}"


def merchant_id() -> str:
    """Read the merchant id from the settings (backend-only)."""
    value = (settings.zarinpal_merchant_id or "").strip()
    if not value:
        raise ZarinpalError(
            "شناسه پذیرنده زرین‌پال تنظیم نشده است. لطفاً ZARINPAL_MERCHANT_ID را در تنظیمات وارد کنید.",
            code=None,
        )
    return value


# --------------------------------------------------------------------------- #
# Public site origin -> gateway callback URL
# --------------------------------------------------------------------------- #

#: Frontend route that handles the Zarinpal return trip.
CALLBACK_PATH = settings.zarinpal_callback_path or "/payment/callback"

#: Env variables (checked in order) holding the public origin of the site.
#: Setting one of these is the ONLY change needed for a custom-domain cutover.
SITE_ORIGIN_ENV_VARS = ("PUBLIC_SITE_URL", "ZARINPAL_CALLBACK_BASE_URL")


def normalize_site_origin(value: Optional[str]) -> Optional[str]:
    """Return ``scheme://host[:port]`` for a usable absolute http(s) URL.

    Defensive on purpose: a blank/whitespace-only value, an accidentally quoted
    value, a bare hostname, or a value carrying a path/trailing slash can never
    leak through and produce a malformed ``//payment/callback``.

    Returns:
        The normalized origin, or ``None`` when the value is unusable.
    """
    if not value:
        return None
    raw = value.strip().strip('"').strip("'").strip()
    if not raw:
        return None

    parsed = urlparse(raw)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return None
    return f"{parsed.scheme}://{parsed.netloc}"


def configured_site_origin() -> Optional[str]:
    """Public origin from the settings, or None when unset/invalid."""
    # Primary source: the typed ``PUBLIC_SITE_URL`` setting.
    origin = normalize_site_origin(settings.public_site_url)
    if origin:
        return origin
    # Backward-compatible legacy env var.
    return normalize_site_origin(os.environ.get("ZARINPAL_CALLBACK_BASE_URL"))


def resolve_site_origin(fallback_origin: Optional[str] = None) -> str:
    """Resolve the public origin: configured value first, then the request origin.

    Args:
        fallback_origin: Origin observed on the incoming request (browser
            ``window.location.origin`` or the ``Origin``/``Referer`` header),
            used only when no configured origin is set.

    Raises:
        ZarinpalError: when neither source yields a valid absolute http(s)
            origin. This is deliberately loud — a broken ``callback_url``
            silently strands buyers after they have already paid.
    """
    origin = configured_site_origin() or normalize_site_origin(fallback_origin)
    if not origin:
        raise ZarinpalError(
            "آدرس بازگشت از درگاه پرداخت مشخص نیست. لطفاً متغیر PUBLIC_SITE_URL را "
            "با آدرس کامل سایت (مثل https://example.ir) تنظیم کنید.",
            code=None,
        )
    return origin


def build_callback_url(fallback_origin: Optional[str] = None) -> str:
    """Absolute URL Zarinpal must redirect the customer back to."""
    return f"{resolve_site_origin(fallback_origin)}{CALLBACK_PATH}"


# --------------------------------------------------------------------------- #
# Input normalisation helpers
# --------------------------------------------------------------------------- #

_MOBILE_RE = re.compile(r"^09[0-9]{9}$")

#: Persian (U+06F0-U+06F9) and Arabic-Indic (U+0660-U+0669) digits -> ASCII.
_DIGIT_TRANSLATION = {ord("\u06f0") + i: str(i) for i in range(10)}
_DIGIT_TRANSLATION.update({ord("\u0660") + i: str(i) for i in range(10)})


def to_ascii_digits(value: str) -> str:
    """Convert Persian/Arabic-Indic digits in a string to ASCII digits."""
    return value.translate(_DIGIT_TRANSLATION)


def normalize_mobile(value: Optional[str]) -> Optional[str]:
    """Return a gateway-acceptable Iranian mobile number, or None.

    Accepts Persian/Arabic-Indic digits and any separators, so an input like
    "0912-345-6789" written with Persian digits still normalizes correctly.
    """
    if not value:
        return None
    digits = re.sub(r"[^0-9]", "", to_ascii_digits(value))
    return digits if _MOBILE_RE.match(digits) else None


def generate_order_code() -> str:
    """Human-readable, collision-resistant order code."""
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"GM-{suffix}"


# --------------------------------------------------------------------------- #
# Result types
# --------------------------------------------------------------------------- #


@dataclass
class PaymentRequestResult:
    """Outcome of a successful payment request."""

    authority: str
    payment_url: str


@dataclass
class PaymentVerification:
    """Outcome of a payment verification."""

    code: int
    ref_id: Optional[str]
    card_pan: Optional[str]
    already_verified: bool


# --------------------------------------------------------------------------- #
# HTTP plumbing
# --------------------------------------------------------------------------- #

_TIMEOUT = httpx.Timeout(20.0, connect=10.0)


def _extract_error(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Zarinpal v4 returns ``errors`` as ``[]`` on success or an object on failure."""
    errors = payload.get("errors")
    if isinstance(errors, dict) and errors:
        return errors
    if isinstance(errors, list) and errors:
        first = errors[0]
        return first if isinstance(first, dict) else {"message": str(first)}
    return None


async def _post(url: str, body: Dict[str, Any]) -> Dict[str, Any]:
    """POST JSON to Zarinpal and return the parsed ``data`` object.

    Raises:
        ZarinpalError: on transport failure, malformed body, or gateway error.
    """
    # Never log the merchant id.
    safe_body = {k: v for k, v in body.items() if k != "merchant_id"}
    logger.info("Zarinpal POST %s payload=%s", url, safe_body)

    try:
        # A fresh client per call keeps the client bound to the current event
        # loop (important under Lambda), at negligible cost for payment volume.
        async with httpx.AsyncClient(timeout=_TIMEOUT) as http:
            response = await http.post(
                url,
                json=body,
                headers={"Content-Type": "application/json", "Accept": "application/json"},
            )
    except httpx.HTTPError as exc:
        logger.error("Zarinpal transport failure for %s: %s", url, exc)
        raise ZarinpalError("ارتباط با درگاه پرداخت برقرار نشد. لطفاً دوباره تلاش کنید.") from exc

    try:
        payload = response.json()
    except ValueError as exc:
        logger.error("Zarinpal returned non-JSON (status=%s): %s", response.status_code, response.text[:400])
        raise ZarinpalError("پاسخ نامعتبر از درگاه پرداخت دریافت شد.") from exc

    if not isinstance(payload, dict):
        raise ZarinpalError("پاسخ نامعتبر از درگاه پرداخت دریافت شد.")

    error = _extract_error(payload)
    if error:
        code = error.get("code")
        code = int(code) if isinstance(code, (int, str)) and str(code).lstrip("-").isdigit() else None
        # code 101 is not a real failure — the transaction was already verified.
        if code != 101:
            logger.warning("Zarinpal error code=%s message=%s", code, error.get("message"))
            raise ZarinpalError(
                message_for_code(code, error.get("message") or "درگاه پرداخت درخواست را نپذیرفت."),
                code=code,
            )
        return {"code": 101, "ref_id": None, "card_pan": None}

    data = payload.get("data")
    if not isinstance(data, dict) or not data:
        logger.error("Zarinpal response missing data object: %s", str(payload)[:400])
        raise ZarinpalError("پاسخ نامعتبر از درگاه پرداخت دریافت شد.")

    return data


# --------------------------------------------------------------------------- #
# Public gateway operations
# --------------------------------------------------------------------------- #


async def request_payment(
    *,
    amount_rial: int,
    description: str,
    callback_url: str,
    mobile: Optional[str] = None,
    email: Optional[str] = None,
) -> PaymentRequestResult:
    """Open a payment request and return the authority and payment URL.

    Args:
        amount_rial: Integer amount in Rial.
        description: Persian order description shown on the gateway.
        callback_url: Absolute URL Zarinpal redirects the customer back to.
        mobile: Optional Iranian mobile number to prefill on the gateway.
        email: Optional customer email.

    Returns:
        A :class:`PaymentRequestResult` carrying the ``authority`` token and the
        browser URL the customer must be redirected to.
    """
    validate_amount_rial(amount_rial)

    body: Dict[str, Any] = {
        "merchant_id": merchant_id(),
        "amount": int(amount_rial),
        "description": description,
        "callback_url": callback_url,
    }

    metadata: Dict[str, str] = {}
    normalized_mobile = normalize_mobile(mobile)
    if normalized_mobile:
        metadata["mobile"] = normalized_mobile
    if email:
        metadata["email"] = email
    if metadata:
        body["metadata"] = metadata

    data = await _post(request_endpoint(), body)

    authority = data.get("authority")
    if not authority or not isinstance(authority, str):
        logger.error("Zarinpal request returned no authority: %s", str(data)[:300])
        raise ZarinpalError("شناسه پرداخت از درگاه دریافت نشد. لطفاً دوباره تلاش کنید.")

    return PaymentRequestResult(authority=authority, payment_url=start_pay_url(authority))


async def verify_payment(*, amount_rial: int, authority: str) -> PaymentVerification:
    """Verify a returned payment.

    Returns:
        A :class:`PaymentVerification` with the gateway code, the ``ref_id``,
        the masked ``card_pan`` and whether the payment had already been
        verified earlier.

    Raises:
        ZarinpalError: when the gateway reports the payment as not successful.
    """
    data = await _post(
        verify_endpoint(),
        {
            "merchant_id": merchant_id(),
            "amount": int(amount_rial),
            "authority": authority,
        },
    )

    raw_code = data.get("code")
    code = int(raw_code) if isinstance(raw_code, (int, str)) and str(raw_code).lstrip("-").isdigit() else None

    # 100 = verified now, 101 = was already verified earlier. Both mean "paid".
    if code not in (100, 101):
        raise ZarinpalError(
            message_for_code(code, "تأیید پرداخت ناموفق بود."),
            code=code,
        )

    ref_id = data.get("ref_id")
    return PaymentVerification(
        code=code,
        ref_id=str(ref_id) if ref_id not in (None, "") else None,
        card_pan=data.get("card_pan") or None,
        already_verified=code == 101,
    )
