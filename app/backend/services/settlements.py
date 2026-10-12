import logging
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from models.order_items import OrderItem
from models.payment_orders import Payment_orders
from models.settlements import Settlement
from models.sellers import Sellers

logger = logging.getLogger(__name__)

class SettlementsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_seller_balance(self, seller_id: int) -> float:
        # Calculate total share of items that are PAID but NOT YET SETTLED
        query = (
            select(func.sum(OrderItem.seller_share))
            .join(Payment_orders, OrderItem.order_id == Payment_orders.id)
            .where(
                OrderItem.seller_id == seller_id,
                OrderItem.settlement_id == None,
                Payment_orders.status == 'paid'
            )
        )
        result = await self.db.execute(query)
        balance = result.scalar() or 0.0
        return balance

    async def get_seller_history(self, seller_id: int) -> List[Settlement]:
        query = select(Settlement).where(Settlement.seller_id == seller_id).order_by(Settlement.id.desc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_all_pending_balances(self) -> List[dict]:
        # Aggregate balances for all sellers
        query = (
            select(
                Sellers.id, Sellers.brand_name, Sellers.iban,
                func.sum(OrderItem.seller_share).label('total_due')
            )
            .join(OrderItem, Sellers.id == OrderItem.seller_id)
            .join(Payment_orders, OrderItem.order_id == Payment_orders.id)
            .where(
                OrderItem.settlement_id == None,
                Payment_orders.status == 'paid'
            )
            .group_by(Sellers.id)
        )
        result = await self.db.execute(query)
        rows = result.all()
        return [
            {"seller_id": r.id, "brand_name": r.brand_name, "iban": r.iban, "available_balance": r.total_due}
            for r in rows if r.total_due > 0
        ]

    async def create_payout(self, seller_id: int) -> Settlement:
        # 1. Ensure seller exists and has an IBAN
        seller_query = await self.db.execute(select(Sellers).where(Sellers.id == seller_id))
        seller = seller_query.scalar_one_or_none()
        if not seller or not seller.iban:
            raise ValueError("Seller not found or IBAN is missing")

        # 2. Get current balance
        balance = await self.get_seller_balance(seller_id)
        if balance <= 0:
            raise ValueError("No pending balance for this seller")

        # 3. Create Settlement Record
        settlement = Settlement(
            seller_id=seller.id,
            amount=balance,
            status="pending",
            iban=seller.iban
        )
        self.db.add(settlement)
        await self.db.flush() # flush to get settlement.id

        # 4. Link OrderItems to this settlement (prevent double payout)
        update_query = (
            update(OrderItem)
            .where(
                OrderItem.seller_id == seller_id,
                OrderItem.settlement_id == None,
                OrderItem.order_id.in_(
                    select(Payment_orders.id).where(Payment_orders.status == 'paid')
                )
            )
            .values(settlement_id=settlement.id)
        )
        await self.db.execute(update_query)
        await self.db.commit()
        await self.db.refresh(settlement)
        return settlement

    async def update_settlement(self, settlement_id: int, updates: dict) -> Settlement:
        query = await self.db.execute(select(Settlement).where(Settlement.id == settlement_id))
        settlement = query.scalar_one_or_none()
        if not settlement:
            raise ValueError("Settlement not found")
        
        for k, v in updates.items():
            setattr(settlement, k, v)
        
        if updates.get('status') == 'completed' and not settlement.settled_at:
            settlement.settled_at = datetime.now(timezone.utc)
            
        # --- SMS Notification ---
        try:
            from services.sms import SMSService
            seller_query = await self.db.execute(select(Sellers).where(Sellers.id == settlement.seller_id))
            seller_obj = seller_query.scalar_one_or_none()
            if seller_obj and getattr(seller_obj, "contact_phone", None):
                await SMSService().send_sms(
                    seller_obj.contact_phone, 
                    "settlement_completed", 
                    amount=settlement.amount,
                    iban=settlement.iban
                )
        except Exception as e:
            logger.error(f"Failed to send settlement SMS: {e}")

        await self.db.commit()
        await self.db.refresh(settlement)
        return settlement