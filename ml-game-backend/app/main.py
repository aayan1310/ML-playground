"""FastAPI routes only. The thinking happens in app/ml.py.

Start the server from the ``backend`` folder:

    uvicorn app.main:app --reload --port 8000

Then open http://127.0.0.1:8000/docs to try it out.
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import ml

DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR = Path(os.environ.get("MLPLAYGROUND_DATA_DIR", DEFAULT_DATA_DIR))

service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global service
    service = ml.MLService(DATA_DIR)
    yield
    service = None


app = FastAPI(title="ML Playground API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/images",
    StaticFiles(directory=str(DATA_DIR / "images"), check_dir=False),
    name="images",
)


class TrainRequest(BaseModel):
    cat_ids: list[str]
    dog_ids: list[str]


class PredictRequest(BaseModel):
    model_id: str
    image_id: str


def get_service() -> ml.MLService:
    if service is None:
        raise HTTPException(status_code=503, detail="Service not ready yet.")
    return service


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/dataset")
def get_dataset():
    return get_service().dataset()


@app.post("/train")
def train(request: TrainRequest):
    try:
        return get_service().train(request.cat_ids, request.dog_ids)
    except ml.InvalidInput as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/predict")
def predict(request: PredictRequest):
    try:
        return get_service().predict(request.model_id, request.image_id)
    except ml.ModelNotFound as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ml.InvalidInput as exc:
        raise HTTPException(status_code=400, detail=str(exc))
