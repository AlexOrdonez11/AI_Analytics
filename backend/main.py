from fastapi import FastAPI

app = FastAPI(title="Analytics API")

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/")
def root():
    return {"message": "API is up"}