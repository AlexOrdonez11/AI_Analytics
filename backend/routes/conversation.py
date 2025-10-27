from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from bson import ObjectId
from db import conversations_collection

router = APIRouter()

# ---------- Models ----------
Role = Literal["user", "assistant", "system"]

class ConversationCreate(BaseModel):
    project_id: str = Field(min_length=1)
    role: Role
    message: Dict[str, Any]  # { text: "...", ... }

class ConversationOut(BaseModel):
    id: str
    project_id: str
    role: Role
    message: Dict[str, Any]
    timestamp: datetime

def _oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")

def _normalize(doc: Dict[str, Any]) -> Dict[str, Any]:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc

# ---------- Endpoints ----------
@router.post("/conversations", response_model=ConversationOut)
def create_conversation(payload: ConversationCreate):
    doc = {
        "project_id": payload.project_id,
        "role": payload.role,
        "message": payload.message,
        "timestamp": datetime.utcnow(),
    }
    res = conversations_collection.insert_one(doc)
    created = conversations_collection.find_one({"_id": res.inserted_id})
    return _normalize(created)

# Add pagination via query params; keep your route shape for compat
@router.get("/conversations/{project_id}", response_model=List[ConversationOut])
def get_conversations(
    project_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    sort_asc: bool = Query(False),
):
    order = 1 if sort_asc else -1
    cur = (conversations_collection
           .find({"project_id": project_id})
           .sort("timestamp", order)
           .skip(skip)
           .limit(limit))
    items = list(cur)
    return [_normalize(c) for c in items]

@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str):
    res = conversations_collection.delete_one({"_id": _oid(conversation_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted"}