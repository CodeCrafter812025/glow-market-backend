import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user, get_current_seller
from models.sellers import Sellers
from schemas.auth import UserResponse
from schemas.settlements import (
    SellerBalanceResponse, SettlementCreateRequest,
    SettlementResponse, SettlementUpdateRequest
)
from services.settlements import SettlementsService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/entities/settlements", tags=["settlements"])

# ----------------- Seller Endpoints ----------------- #

@router.get("/me/balance", response_model=SellerBalanceResponse)
async def get_my_balance(
    current_seller: Sellers = Depends(get_current_seller),
    db: AsyncSession = Depends(get_db)
):
    """(Seller Panel) Get available balance for the logged-in seller."""
    service = SettlementsService(db)
    balance = await service.get_seller_balance(current_seller.id)
    return SellerBalanceResponse(
        seller_id=current_seller.id,
        brand_name=current_seller.brand_name,
        iban=current_seller.iban,
        available_balance=balance
    )

@router.get("/me/history", response_model=List[SettlementResponse])
async def get_my_settlement_history(
    current_seller: Sellers = Depends(get_current_seller),
    db: AsyncSession = Depends(get_db)
):
    """(Seller Panel) View past and pending payouts."""
    service = SettlementsService(db)
    return await service.get_seller_history(current_seller.id)

# ----------------- Admin Endpoints ----------------- #

@router.get("/admin/pending-balances", response_model=List[SellerBalanceResponse])
async def admin_get_pending_balances(
    _: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """(Admin Panel) List all sellers with a positive pending balance."""
    service = SettlementsService(db)
    return await service.get_all_pending_balances()

@router.post("/admin/payout", response_model=SettlementResponse)
async def admin_create_payout(
    req: SettlementCreateRequest,
    _: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """(Admin Panel) Generate a payout record and lock the seller's current balance."""
    service = SettlementsService(db)
    try:
        return await service.create_payout(req.seller_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/admin/{id}", response_model=SettlementResponse)
async def admin_update_payout(
    id: int,
    req: SettlementUpdateRequest,
    _: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """(Admin Panel) Update a payout with tracking reference and mark as completed."""
    service = SettlementsService(db)
    try:
        # filter out None
        updates = {k: v for k, v in req.model_dump().items() if v is not None}
        return await service.update_settlement(id, updates)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))