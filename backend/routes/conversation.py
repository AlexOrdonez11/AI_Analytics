from db import conversations_collection
from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/conversations")
def create_conversation(project_id: str, role: str, message: dict):
    new_conversation = {
        "project_id": project_id,
        "role": role,
        "message": message,
        "timestamp": datetime.utcnow()
    }
    result = conversations_collection.insert_one(new_conversation)
    return {"id": str(result.inserted_id)}

@router.get("/conversations/{project_id}")
def get_conversations(project_id: str):
    conversations = list(conversations_collection.find({"project_id": project_id}))
    for convo in conversations:
        convo["_id"] = str(convo["_id"])
    return conversations

@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str):    
    result = conversations_collection.delete_one({"_id": ObjectId(conversation_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted"}  