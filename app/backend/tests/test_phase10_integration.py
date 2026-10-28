import pytest
from httpx import ASGITransport, AsyncClient
from main import app
from core.database import db_manager
from models.products import Products


@pytest.mark.asyncio
async def test_json_array_tags_and_history_endpoint():
    """Verify products with JSON-serialized tags (from AdminAddData) match properly and /history returns records."""
    if not db_manager.engine:
        await db_manager.init_db()

    async with db_manager.async_session_maker() as session:
        p = Products(
            seller_id=1,
            title="\u0634\u0627\u0645\u067e\u0648 \u0636\u062f \u0631\u06cc\u0632\u0634 \u06a9\u0627\u0641\u0626\u06cc\u0646 \u062a\u0633\u062a \u0641\u0627\u0632 \u06f1\u06f0",
            price=340000.0,
            category="\u0634\u0627\u0645\u067e\u0648 \u0648 \u0645\u0631\u0627\u0642\u0628\u062a \u0645\u0648",
            target_skin_type='["\u0686\u0631\u0628", "\u0645\u0639\u0645\u0648\u0644\u06cc"]',
            target_concerns='["\u0631\u06cc\u0632\u0634 \u0645\u0648"]',
            target_goals='["clear", "glow"]',
            is_sensitive_friendly=True,
            verified=True,
        )
        session.add(p)
        await session.commit()
        await session.refresh(p)
        pid = p.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post(
            "/api/v1/smart-test/evaluate",
            json={
                "root_category": "hair",
                "skinType": "\u0686\u0631\u0628",
                "concern": "\u0631\u06cc\u0632\u0634 \u0645\u0648",
                "sensitivity": "always",
                "goal": "clear",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert data["root_category"] == "hair"
        matched_ids = [item["id"] for item in data["recommendations"]]
        assert pid in matched_ids

        hist_res = await ac.get("/api/v1/smart-test/history")
        assert hist_res.status_code == 200
        hist_data = hist_res.json()
        assert hist_data["total"] >= 1
        assert hist_data["items"][0]["root_category"] == "hair"

    async with db_manager.async_session_maker() as session:
        obj = await session.get(Products, pid)
        if obj:
            await session.delete(obj)
            await session.commit()