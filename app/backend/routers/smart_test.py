import json
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.products import Products
from models.smart_test import UserTestHistory

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/smart-test", tags=["smart_test"])


DECISION_TREE: Dict[str, Any] = {
    "root_Question": {
        "id": "root",
        "title": "\u0645\u0634\u0627\u0648\u0631\u0647 \u0647\u0648\u0634\u0645\u0646\u062f \u0631\u0627 \u0628\u0631\u0627\u06cc \u06a9\u062f\u0627\u0645 \u0628\u062e\u0634 \u0645\u06cc\u200c\u062e\u0648\u0627\u0647\u06cc\u062f\u061f",
        "subtitle": "\u0628\u0631 \u0627\u0633\u0627\u0633 \u0627\u0646\u062a\u062e\u0627\u0628 \u0634\u0645\u0627\u060c \u0633\u0648\u0627\u0644\u0627\u062a \u062a\u062e\u0635\u0635\u06cc \u0647\u0645\u0627\u0646 \u062d\u0648\u0632\u0647 \u067e\u0631\u0633\u06cc\u062f\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f.",
        "options": [
            {"value": "skin", "label": "\u0645\u0631\u0627\u0642\u0628\u062a \u0627\u0632 \u067e\u0648\u0633\u062a \u0635\u0648\u0631\u062a", "desc": "\u0628\u0631\u0631\u0633\u06cc \u0646\u0648\u0639 \u067e\u0648\u0633\u062a\u060c \u062c\u0648\u0634\u060c \u0644\u06a9\u060c \u0686\u0631\u0648\u06a9 \u0648 \u0622\u0628\u0631\u0633\u0627\u0646\u06cc"},
            {"value": "hair", "label": "\u0645\u0631\u0627\u0642\u0628\u062a \u0627\u0632 \u0645\u0648 \u0648 \u06a9\u0641 \u0633\u0631", "desc": "\u0628\u0631\u0631\u0633\u06cc \u062c\u0646\u0633 \u06a9\u0641 \u0633\u0631\u060c \u0631\u06cc\u0632\u0634\u060c \u0634\u0648\u0631\u0647 \u0648 \u0622\u0633\u06cc\u0628\u200c\u062f\u06cc\u062f\u06af\u06cc \u0633\u0627\u0642\u0647 \u0645\u0648"},
            {"value": "body", "label": "\u0645\u0631\u0627\u0642\u0628\u062a \u0648 \u0628\u0647\u062f\u0627\u0634\u062a \u0628\u062f\u0646", "desc": "\u0628\u0631\u0631\u0633\u06cc \u062e\u0634\u06a9\u06cc \u067e\u0648\u0633\u062a \u0628\u062f\u0646\u060c \u062a\u06cc\u0631\u06af\u06cc\u060c \u062c\u0648\u0634 \u0628\u062f\u0646 \u0648 \u0644\u0637\u0627\u0641\u062a"},
        ],
    },
    "branches": {
        "skin": [
            {"id": "type", "title": "\u0646\u0648\u0639 \u067e\u0648\u0633\u062a \u0635\u0648\u0631\u062a \u062e\u0648\u062f \u0631\u0627 \u0686\u06af\u0648\u0646\u0647 \u0627\u0631\u0632\u06cc\u0627\u0628\u06cc \u0645\u06cc\u200c\u06a9\u0646\u06cc\u062f\u061f", "options": ["\u0686\u0631\u0628", "\u062e\u0634\u06a9", "\u0645\u062e\u062a\u0644\u0637", "\u0645\u0639\u0645\u0648\u0644\u06cc"]},
            {"id": "concern", "title": "\u062f\u063a\u062f\u063a\u0647 \u0627\u0635\u0644\u06cc \u067e\u0648\u0633\u062a \u0634\u0645\u0627 \u0686\u06cc\u0633\u062a\u061f", "options": ["\u062c\u0648\u0634", "\u0686\u0631\u0648\u06a9", "\u0644\u06a9", "\u0622\u0628\u0631\u0633\u0627\u0646\u06cc", "\u0645\u0646\u0627\u0641\u0630 \u0628\u0627\u0632"]},
            {"id": "sensitivity", "title": "\u0645\u06cc\u0632\u0627\u0646 \u062d\u0633\u0627\u0633\u06cc\u062a \u067e\u0648\u0633\u062a \u0634\u0645\u0627\u061f", "options": ["rarely", "sometimes", "always"]},
            {"id": "goal", "title": "\u0647\u062f\u0641 \u0646\u0647\u0627\u06cc\u06cc \u0634\u0645\u0627\u061f", "options": ["glow", "matte", "hydrated", "clear"]},
        ],
        "hair": [
            {"id": "type", "title": "\u062c\u0646\u0633 \u06a9\u0641 \u0633\u0631 \u0648 \u0645\u0648\u06cc \u0634\u0645\u0627 \u0686\u06af\u0648\u0646\u0647 \u0627\u0633\u062a\u061f", "options": ["\u0686\u0631\u0628", "\u062e\u0634\u06a9", "\u0645\u062e\u062a\u0644\u0637", "\u0645\u0639\u0645\u0648\u0644\u06cc"]},
            {"id": "concern", "title": "\u0645\u0634\u06a9\u0644 \u0627\u0635\u0644\u06cc \u0645\u0648\u0647\u0627\u06cc \u0634\u0645\u0627 \u0686\u06cc\u0633\u062a\u061f", "options": ["\u0631\u06cc\u0632\u0634 \u0645\u0648", "\u062e\u0634\u06a9\u06cc \u0648 \u0648\u0632", "\u0634\u0648\u0631\u0647 \u0648 \u062e\u0627\u0631\u0634", "\u0645\u0648\u062e\u0648\u0631\u0647 \u0648 \u0622\u0633\u06cc\u0628"]},
            {"id": "sensitivity", "title": "\u0622\u06cc\u0627 \u06a9\u0641 \u0633\u0631 \u062d\u0633\u0627\u0633\u06cc \u062f\u0627\u0631\u06cc\u062f\u061f", "options": ["rarely", "sometimes", "always"]},
            {"id": "goal", "title": "\u0647\u062f\u0641 \u0646\u0647\u0627\u06cc\u06cc \u0628\u0631\u0627\u06cc \u0645\u0648\u0647\u0627\u06cc\u062a\u0627\u0646\u061f", "options": ["hydrated", "glow", "matte", "clear"]},
        ],
        "body": [
            {"id": "type", "title": "\u062c\u0646\u0633 \u067e\u0648\u0633\u062a \u0628\u062f\u0646 \u0634\u0645\u0627 \u0686\u06af\u0648\u0646\u0647 \u0627\u0633\u062a\u061f", "options": ["\u062e\u0634\u06a9", "\u0686\u0631\u0628", "\u0645\u0639\u0645\u0648\u0644\u06cc", "\u0645\u062e\u062a\u0644\u0637"]},
            {"id": "concern", "title": "\u062f\u063a\u062f\u063a\u0647 \u0627\u0635\u0644\u06cc \u067e\u0648\u0633\u062a \u0628\u062f\u0646 \u0634\u0645\u0627 \u0686\u06cc\u0633\u062a\u061f", "options": ["\u0622\u0628\u0631\u0633\u0627\u0646\u06cc", "\u062c\u0648\u0634", "\u0644\u06a9", "\u0632\u0628\u0631\u06cc \u0648 \u062a\u06cc\u0631\u06af\u06cc"]},
            {"id": "sensitivity", "title": "\u062d\u0633\u0627\u0633\u06cc\u062a \u067e\u0648\u0633\u062a \u0628\u062f\u0646\u061f", "options": ["rarely", "sometimes", "always"]},
            {"id": "goal", "title": "\u0646\u062a\u06cc\u062c\u0647 \u062f\u0644\u062e\u0648\u0627\u0647 \u0634\u0645\u0627\u061f", "options": ["hydrated", "clear", "glow", "matte"]},
        ],
    },
}


class SmartTestSubmission(BaseModel):
    root_category: str = Field(default="skin", description="skin | hair | body")
    skinType: str = Field(default="")
    concern: str = Field(default="")
    sunExposure: Optional[str] = Field(default="medium")
    sensitivity: Optional[str] = Field(default="rarely")
    goal: Optional[str] = Field(default="glow")
    extra_tags: Optional[List[str]] = Field(default_factory=list)


def _split_tags(raw: Optional[str]) -> List[str]:
    if not raw:
        return []
    return [t.strip().lower() for t in str(raw).replace("\u060c", ",").split(",") if t.strip()]


@router.get("/questions")
async def get_decision_tree():
    """Return the dynamic branching quiz structure."""
    return DECISION_TREE


@router.post("/evaluate")
async def evaluate_smart_test(
    payload: SmartTestSubmission,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Evaluate user answers using Tag Matching & Scoring Engine and save history privately."""
    root_cat = (payload.root_category or "skin").strip().lower()
    derived_tags: List[str] = [root_cat]

    for val in [payload.skinType, payload.concern, payload.sunExposure, payload.sensitivity, payload.goal]:
        if val and str(val).strip():
            derived_tags.append(str(val).strip().lower())
    if payload.extra_tags:
        derived_tags.extend([t.strip().lower() for t in payload.extra_tags if t.strip()])

    stmt = select(Products)
    result = await db.execute(stmt)
    products = result.scalars().all()

    scored_items: List[Dict[str, Any]] = []
    category_keywords = {
        "skin": ["\u067e\u0648\u0633\u062a", "\u0635\u0648\u0631\u062a", "\u0633\u0631\u0645", "\u06a9\u0631\u0645", "\u0636\u062f\u0622\u0641\u062a\u0627\u0628", "\u0634\u0648\u06cc\u0646\u062f\u0647", "\u062a\u0648\u0646\u0631", "\u0622\u0628\u0631\u0633\u0627\u0646", "skin"],
        "hair": ["\u0645\u0648", "\u0634\u0627\u0645\u067e\u0648", "\u0645\u0627\u0633\u06a9 \u0645\u0648", "\u0633\u0631\u0645 \u0645\u0648", "\u0631\u06cc\u0632\u0634", "hair"],
        "body": ["\u0628\u062f\u0646", "\u0644\u0648\u0633\u06cc\u0648\u0646", "\u0634\u0627\u0645\u067e\u0648 \u0628\u062f\u0646", "\u0627\u0633\u06a9\u0631\u0627\u0628", "\u0635\u0627\u0628\u0648\u0646", "body"],
    }

    for p in products:
        score = 0
        match_reasons: List[str] = []

        p_cat = (p.category or "").lower()
        p_title = (p.title or "").lower()
        p_desc = (p.description or "").lower()
        p_skin_types = _split_tags(p.target_skin_type)
        p_concerns = _split_tags(p.target_concerns)
        p_goals = _split_tags(p.target_goals)

        # 1. Root branch alignment (+30 pts)
        branch_kws = category_keywords.get(root_cat, [])
        if any(kw in p_cat or kw in p_title or kw in p_desc for kw in branch_kws):
            score += 30

        # 2. Type match (+35 pts)
        user_type = (payload.skinType or "").strip().lower()
        if user_type:
            if user_type in p_skin_types or "\u0627\u0646\u0648\u0627\u0639 \u067e\u0648\u0633\u062a" in p_skin_types or "all" in p_skin_types:
                score += 35
                match_reasons.append(f"\u0645\u0646\u0627\u0633\u0628 \u0628\u0631\u0627\u06cc \u062a\u0627\u06cc\u067e {payload.skinType}")
            elif user_type in p_title or user_type in p_desc:
                score += 20

        # 3. Concern match (+40 pts)
        user_concern = (payload.concern or "").strip().lower()
        if user_concern:
            if any(user_concern in c or c in user_concern for c in p_concerns):
                score += 40
                match_reasons.append(f"\u0647\u062f\u0641\u200c\u06af\u06cc\u0631\u06cc \u0645\u0633\u062a\u0642\u06cc\u0645 {payload.concern}")
            elif user_concern in p_title or user_concern in p_desc:
                score += 25
                match_reasons.append(f"\u0645\u0648\u062b\u0631 \u062f\u0631 \u0628\u0647\u0628\u0648\u062f {payload.concern}")

        # 4. Goal match (+20 pts)
        user_goal = (payload.goal or "").strip().lower()
        if user_goal and (user_goal in p_goals or user_goal in p_desc):
            score += 20

        # 5. Sensitivity filter/boost (+15 pts)
        if payload.sensitivity in ("always", "sometimes"):
            if getattr(p, "is_sensitive_friendly", False):
                score += 15
                match_reasons.append("\u0641\u0631\u0645\u0648\u0644\u0627\u0633\u06cc\u0648\u0646 \u0645\u0644\u0627\u06cc\u0645 \u0648 \u0636\u062f\u062d\u0633\u0627\u0633\u06cc\u062a")
            else:
                score -= 10

        match_percentage = min(99, max(55, score))
        scored_items.append({
            "id": p.id,
            "name": p.title,
            "title": p.title,
            "price": p.price,
            "image_url": p.image_url,
            "category": p.category,
            "seller_id": p.seller_id,
            "target_skin_type": p.target_skin_type,
            "target_concerns": p.target_concerns,
            "target_goals": p.target_goals,
            "is_sensitive_friendly": p.is_sensitive_friendly,
            "score": score,
            "matchPercentage": match_percentage,
            "matchReasons": match_reasons,
        })

    scored_items.sort(key=lambda x: x["score"], reverse=True)
    top_recommendations = scored_items[:6]

    history_entry = UserTestHistory(
        user_id=None,
        root_category=root_cat,
        answers_json=json.dumps(payload.model_dump(), ensure_ascii=False),
        derived_tags_json=json.dumps(derived_tags, ensure_ascii=False),
        recommended_product_ids_json=json.dumps([item["id"] for item in top_recommendations]),
    )
    db.add(history_entry)
    await db.commit()
    await db.refresh(history_entry)

    return {
        "test_id": history_entry.id,
        "root_category": root_cat,
        "derived_tags": derived_tags,
        "recommendations": top_recommendations,
    }