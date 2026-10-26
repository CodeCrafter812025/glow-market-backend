import json
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from main import app
from core.database import db_manager
from models.products import Products
from models.smart_test import UserTestHistory


@pytest.mark.asyncio
async def test_get_decision_tree_branches():
    """Verify the decision tree endpoint returns root question and all 3 branches (skin, hair, body)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/smart-test/questions")
        assert res.status_code == 200
        data = res.json()
        assert "branches" in data
        assert set(data["branches"].keys()) == {"skin", "hair", "body"}


@pytest.mark.asyncio
async def test_evaluate_smart_test_tag_matching_and_history():
    """Verify tag matching scoring engine ranks matching products and stores private UserTestHistory."""
    if not db_manager.engine:
        await db_manager.init_db()

    async with db_manager.async_session_maker() as session:
        p1 = Products(
            seller_id=1,
            title="\u0633\u0631\u0645 \u0636\u062f \u062c\u0648\u0634 \u0646\u06cc\u0627\u0633\u06cc\u0646\u0627\u0645\u06cc\u062f \u067e\u0648\u0633\u062a",
            price=450000.0,
            description="\u0633\u0631\u0645 \u062a\u062e\u0635\u0635\u06cc \u067e\u0648\u0633\u062a \u0686\u0631\u0628 \u0648 \u062c\u0648\u0634",
            category="\u062f\u0631\u0645\u0627\u0646 \u0627\u0635\u0644\u06cc",
            target_skin_type="\u0686\u0631\u0628, \u0645\u062e\u062a\u0644\u0637",
            target_concerns="\u062c\u0648\u0634, \u0645\u0646\u0627\u0641\u0630 \u0628\u0627\u0632",
            target_goals="matte, clear",
            is_sensitive_friendly=True,
            verified=True,
        )
        session.add(p1)
        await session.commit()
        await session.refresh(p1)
        seeded_id = p1.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "root_category": "skin",
            "skinType": "\u0686\u0631\u0628",
            "concern": "\u062c\u0648\u0634",
            "sunExposure": "medium",
            "sensitivity": "always",
            "goal": "matte",
        }
        res = await ac.post("/api/v1/smart-test/evaluate", json=payload)
        assert res.status_code == 200
        body = res.json()

        assert body["root_category"] == "skin"
        assert "skin" in body["derived_tags"]
        assert isinstance(body["recommendations"], list)
        assert len(body["recommendations"]) >= 1

        top = body["recommendations"][0]
        assert top["score"] >= 80
        assert top["matchPercentage"] >= 80

        test_id = body["test_id"]
        assert test_id is not None

    async with db_manager.async_session_maker() as session:
        stmt = select(UserTestHistory).where(UserTestHistory.id == test_id)
        saved = (await session.execute(stmt)).scalar_one_or_none()
        assert saved is not None
        assert saved.root_category == "skin"
        parsed_answers = json.loads(saved.answers_json)
        assert parsed_answers["concern"] == "\u062c\u0648\u0634"

        prod_to_del = await session.get(Products, seeded_id)
        if prod_to_del:
            await session.delete(prod_to_del)
            await session.commit()