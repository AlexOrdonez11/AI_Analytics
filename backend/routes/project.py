from db import project_collection
from fastapi import APIRouter, HTTPException
from bson import ObjectId

router = APIRouter()

@router.post("/projects")
def create_project(name: str, description: str, user_id: str):
    if project_collection.find_one({"name": name, "user_id": user_id}):
        raise HTTPException(status_code=400, detail="Project name already exists")
    new_project = {"name": name, "description": description, "user_id": user_id}
    result = project_collection.insert_one(new_project)
    return {"id": str(result.inserted_id)}

@router.get("/projects/{project_id}")
def get_project(project_id: str):
    project = project_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project["_id"] = str(project["_id"])
    return project

@router.delete("/projects/{project_id}")
def delete_project(project_id: str):    
    result = project_collection.delete_one({"_id": ObjectId(project_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}

@router.get("/projects/user/{user_id}")
def get_user_projects(user_id: str):
    projects = list(project_collection.find({"user_id": user_id}))
    for project in projects:
        project["_id"] = str(project["_id"])
    return projects