from __future__ import annotations

import networkx as nx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import FeedItem
from app.schemas import (
    DecisionGraphRequest,
    DecisionGraphResponse,
    FeedItemOut,
    GraphEdge,
    GraphNode,
    RecommendationOut,
)
from app.services.recommendation import score_item


def build_decision_graph(db: Session, profile: DecisionGraphRequest) -> DecisionGraphResponse:
    items = list(db.scalars(select(FeedItem).where(FeedItem.is_active.is_(True))).all())
    ranked: list[RecommendationOut] = []
    for item in items:
        score, reasons = score_item(item, profile)
        if score > 0:
            ranked.append(
                RecommendationOut(item=FeedItemOut.model_validate(item), score=score, reasons=reasons)
            )
    ranked.sort(key=lambda value: value.score, reverse=True)
    ranked = ranked[: profile.max_items]

    graph = nx.DiGraph()
    graph.add_node("user", type="user", label="Current user")
    for skill in sorted({*profile.skills, *profile.interests}):
        node_id = f"skill:{skill.lower()}"
        graph.add_node(node_id, type="skill", label=skill)
        graph.add_edge("user", node_id, relation="has_interest_or_skill", weight=1.0)

    for result in ranked:
        item = result.item
        item_id = f"item:{item.id}"
        source_id = f"source:{item.source_name.lower()}"
        location_id = f"location:{item.location.lower()}"
        graph.add_node(
            item_id,
            type=item.category,
            label=item.title,
            score=result.score,
            verified=item.verification_status == "verified",
        )
        graph.add_node(source_id, type="source", label=item.source_name)
        graph.add_node(location_id, type="location", label=item.location)
        graph.add_edge("user", item_id, relation="recommended", weight=result.score)
        graph.add_edge(item_id, source_id, relation="published_by", weight=item.source_reliability)
        graph.add_edge(item_id, location_id, relation="located_in", weight=1.0)
        item_text = f"{item.title} {item.summary} {item.tags}".lower()
        for skill in {*profile.skills, *profile.interests}:
            if skill.lower() in item_text:
                graph.add_edge(f"skill:{skill.lower()}", item_id, relation="matches", weight=1.0)

    nodes = [
        GraphNode(
            id=str(node_id),
            type=str(attributes.pop("type", "entity")),
            label=str(attributes.pop("label", node_id)),
            attributes={key: value for key, value in attributes.items()},
        )
        for node_id, attributes in ((node_id, dict(attrs)) for node_id, attrs in graph.nodes(data=True))
    ]
    edges = [
        GraphEdge(
            source=str(source),
            target=str(target),
            relation=str(attrs.get("relation", "related_to")),
            weight=float(attrs.get("weight", 1.0)),
        )
        for source, target, attrs in graph.edges(data=True)
    ]
    return DecisionGraphResponse(
        nodes=nodes,
        edges=edges,
        top_items=ranked,
        explanation=(
            "The graph links profile skills and interests to ranked items, original sources and locations. "
            "Recommendation edges are derived scores; source and location edges describe provenance."
        ),
    )
