from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from google.cloud import storage
from bson import ObjectId
import pandas as pd, io, hashlib, os, uuid

from db import datasets_collection  # make sure this exists in your db.py

router = APIRouter()
BUCKET = os.getenv("GCS_BUCKET")
BASE_PREFIX = os.getenv("GCS_BASE_PREFIX", "datasets")

MAX_BYTES = 200 * 1024 * 1024  # 200MB
CSV_MIMES = {"text/csv", "application/vnd.ms-excel", "application/csv", "text/plain"}

class DatasetOut(BaseModel):
    id: str
    project_id: str
    name: str
    contentType: str
    size: int
    createdAt: datetime
    schema: Dict[str, str]
    preview: List[Dict[str, Any]]
    gcs_uri: str

def _oid(s: str):
    try: return ObjectId(s)
    except: raise HTTPException(status_code=400, detail="Invalid id")

def _normalize(doc):
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc

def _infer_csv_schema_preview(buf: bytes):
    # Try common encodings and separators
    for enc in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            df = pd.read_csv(
                io.BytesIO(buf),
                nrows=200,
                encoding=enc,
                sep=None,            # let pandas sniff
                engine="python",     # needed for sep=None
            )
            break
        except Exception:
            df = None
    if df is None:
        raise HTTPException(status_code=400, detail="Unable to parse CSV")

    schema = {c: str(t) for c, t in df.dtypes.items()}
    preview = df.head(20).fillna("").to_dict(orient="records")
    return schema, preview

@router.post("/datasets/upload", response_model=DatasetOut)
async def upload_dataset(project_id: str = Form(...), file: UploadFile = File(...), user_id: Optional[str] = Form(None)):
    if not BUCKET:
        raise HTTPException(status_code=500, detail="GCS_BUCKET not configured")

    filename = file.filename or "upload.csv"
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext != "csv":
        raise HTTPException(status_code=400, detail="Only CSV files are accepted for now")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(content) > MAX_BYTES:
        raise HTTPException(status_code=400, detail=f"File exceeds {MAX_BYTES//(1024*1024)}MB limit")

    # MIME sanity (best-effort)
    if file.content_type and file.content_type not in CSV_MIMES:
        # Not fatal—CSV often uploads as text/plain
        pass

    # Build schema + preview
    schema, preview = _infer_csv_schema_preview(content)

    # Upload to GCS
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET)
    key = f"{BASE_PREFIX}/{project_id}/{uuid.uuid4()}.csv"
    blob = bucket.blob(key)
    blob.upload_from_string(content, content_type="text/csv")

    now = datetime.utcnow()
    sha256 = hashlib.sha256(content).hexdigest()
    ds_doc = {
        "project_id": project_id,
        "name": filename,
        "contentType": "text/csv",
        "size": len(content),
        "gcs_uri": f"gs://{BUCKET}/{key}",
        "gcs_object": key,
        "sha256": sha256,
        "schema": schema,
        "preview": preview,
        "createdAt": now,
        "createdBy": user_id,
    }
    ins = datasets_collection.insert_one(ds_doc)
    created = datasets_collection.find_one({"_id": ins.inserted_id})
    return _normalize(created)

@router.get("/projects/{project_id}/datasets", response_model=List[DatasetOut])
def list_datasets(project_id: str):
    items = list(datasets_collection.find({"project_id": project_id}).sort("createdAt", -1))
    return [_normalize(x) for x in items]

@router.get("/datasets/{dataset_id}/signed-url")
def get_signed_download_url(dataset_id: str, expires_minutes: int = 10):
    ds = datasets_collection.find_one({"_id": _oid(dataset_id)})
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET)
    blob = bucket.blob(ds["gcs_object"])

    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=expires_minutes),
        method="GET",
        response_disposition=f'attachment; filename="{ds["name"]}"',
    )
    return {"url": url}

@router.delete("/datasets/{dataset_id}")
def delete_dataset(dataset_id: str):
    ds = datasets_collection.find_one({"_id": _oid(dataset_id)})
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET)
    bucket.blob(ds["gcs_object"]).delete()
    datasets_collection.delete_one({"_id": ds["_id"]})
    return {"message": "Dataset deleted"}
