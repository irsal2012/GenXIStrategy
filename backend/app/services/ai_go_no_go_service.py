"""AI Go/No-Go service.

Implements the 9-factor gate from the provided rubric.

We keep the factor list + deterministic rollup logic server-side so the UI
can remain thin and we don't rely on LLM math.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

GoNoGoTraffic = Literal["go", "cautious", "risk"]


@dataclass(frozen=True)
class GoNoGoFactorDef:
    id: str
    category: str
    question: str


FACTOR_DEFS: List[GoNoGoFactorDef] = [
    # Business Feasibility
    GoNoGoFactorDef(
        id="business.problem_definition",
        category="Business Feasibility",
        question="Is there a clear problem definition?",
    ),
    GoNoGoFactorDef(
        id="business.invest_change",
        category="Business Feasibility",
        question="Is the organization willing to invest and change?",
    ),
    GoNoGoFactorDef(
        id="business.roi_impact",
        category="Business Feasibility",
        question="Is there sufficient ROI or impact?",
    ),
    # Data Feasibility
    GoNoGoFactorDef(
        id="data.required_data_exists",
        category="Data Feasibility",
        question="Do you have the required data that measures what you care about?",
    ),
    GoNoGoFactorDef(
        id="data.quantity_access",
        category="Data Feasibility",
        question="Is there sufficient quantity of data needed to train systems, and do you have access to that data?",
    ),
    GoNoGoFactorDef(
        id="data.quality",
        category="Data Feasibility",
        question="Is the data of sufficient quality?",
    ),
    # Technology/Execution Feasibility
    GoNoGoFactorDef(
        id="execution.tech_skills",
        category="Technology/Execution Feasibility",
        question="Do you have the required technology and skills?",
    ),
    GoNoGoFactorDef(
        id="execution.timing",
        category="Technology/Execution Feasibility",
        question="Can you execute the model as required in a timely manner?",
    ),
    GoNoGoFactorDef(
        id="execution.deployment_fit",
        category="Technology/Execution Feasibility",
        question="Does it make sense to use the model where you plan to use it?",
    ),
]


def _points(status: GoNoGoTraffic) -> int:
    if status == "risk":
        return 0
    if status == "cautious":
        return 50
    return 100


def compute_overall(factors: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compute deterministic overall score/status.

    Rules:
    - score = average(points)
    - if any Risk in Data Feasibility OR Technology/Execution Feasibility => overall risk
    - else if score < 70 OR >=2 cautious => overall cautious
    - else go
    """
    if not factors:
        return {"status": "risk", "score": 0}

    statuses: List[GoNoGoTraffic] = []
    cautious_count = 0

    hard_stop_categories = {"Data Feasibility", "Technology/Execution Feasibility"}
    hard_stop = False

    total = 0
    for f in factors:
        status = str(f.get("status", "risk")).lower()
        if status not in {"go", "cautious", "risk"}:
            status = "risk"
        status_t = status  # type: ignore[assignment]
        statuses.append(status_t)
        total += _points(status_t)

        if status_t == "cautious":
            cautious_count += 1
        if status_t == "risk" and str(f.get("category")) in hard_stop_categories:
            hard_stop = True

    score = round(total / len(statuses))

    if hard_stop:
        overall_status: GoNoGoTraffic = "risk"
    elif score < 70 or cautious_count >= 2:
        overall_status = "cautious"
    else:
        overall_status = "go"

    return {"status": overall_status, "score": score}


def normalize_assessment(raw: Dict[str, Any], *, user_id: Optional[int] = None) -> Dict[str, Any]:
    """Normalize an assessment JSON.

    - Ensures factor list contains the 9 expected factors (adds missing).
    - Ensures each factor has category/question.
    - Recomputes overall.
    """
    raw = raw or {}
    incoming_factors = raw.get("factors")
    factors: List[Dict[str, Any]] = incoming_factors if isinstance(incoming_factors, list) else []

    by_id = {str(f.get("id")): f for f in factors if isinstance(f, dict) and f.get("id")}
    normalized_factors: List[Dict[str, Any]] = []

    for d in FACTOR_DEFS:
        f = dict(by_id.get(d.id, {}))
        f.setdefault("id", d.id)
        f["category"] = d.category
        f["question"] = d.question
        # defaults
        status = str(f.get("status", "cautious")).lower()
        if status not in {"go", "cautious", "risk"}:
            status = "cautious"
        f["status"] = status
        f.setdefault("confidence", 0.5)
        f.setdefault("rationale", "")
        f.setdefault("evidence", [])
        f.setdefault("user_override", False)
        normalized_factors.append(f)

    overall = compute_overall(normalized_factors)
    now = datetime.now(timezone.utc).isoformat()

    normalized: Dict[str, Any] = {
        "version": raw.get("version") or "v1",
        "overall": overall,
        "factors": normalized_factors,
        "generated_at": raw.get("generated_at") or now,
        "generated_by": raw.get("generated_by") or "ai",
        "last_edited_at": now,
        "last_edited_by": user_id,
    }

    return normalized

