"""FastAPI routes for the Level 1 contract (docs/data-contract.md).

Start the server from the ``ml-game-backend`` folder:

    uvicorn app.main:app --reload --port 8000

Then open http://127.0.0.1:8000/docs to try it out.
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.routing import Mount

from . import ml

DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR = Path(os.environ.get("MLPLAYGROUND_DATA_DIR", str(DEFAULT_DATA_DIR)))

# Exact local origins only. Verified 2026-10-19: `npm run dev` in
# ml-game-frontend (Vite 8.3.4, no port pinned in vite.config.js) binds
# http://localhost:5173. No wildcard, no speculative production origins.
ALLOWED_DEV_ORIGINS = ["http://localhost:5173"]

service = None


def _mount_images(app: FastAPI, data_dir: Path) -> None:
    """(Re)mount /images so it always serves data_dir/images.

    Registered at startup (not import time) so MLPLAYGROUND_DATA_DIR applies
    to image serving the same way it applies to the ML service. Any previous
    /images mount is replaced (Starlette matches routes in order, so a stale
    mount would shadow this one).
    """
    app.routes[:] = [
        r for r in app.routes if not (isinstance(r, Mount) and r.path == "/images")
    ]
    app.mount(
        "/images",
        StaticFiles(directory=str(data_dir / "images"), check_dir=False),
        name="images",
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    global service
    data_dir = Path(os.environ.get("MLPLAYGROUND_DATA_DIR", str(DEFAULT_DATA_DIR)))
    service = ml.MLService(data_dir)
    _mount_images(app, data_dir)
    yield
    service = None


app = FastAPI(title="ML Playground API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_DEV_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fallback mount for the default data dir (covers use without lifespan);
# lifespan re-mounts from the env-resolved data dir on every startup.
_mount_images(app, DATA_DIR)


@app.middleware("http")
async def add_no_store_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    return response


@app.exception_handler(ml.ApiError)
async def api_error_handler(request: Request, exc: ml.ApiError):
    return JSONResponse(
        status_code=exc.status,
        content={"code": exc.code, "detail": jsonable_encoder(exc.detail)},
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"code": "invalid_request", "detail": jsonable_encoder(exc.errors())},
    )


def get_service() -> ml.MLService:
    if service is None:
        raise ml.ApiError("invalid_request", "Service not ready yet.", 503)
    return service


class Choice(BaseModel):
    id: str
    category: str


class PoolRequest(BaseModel):
    level: str
    stage: int
    accepted: list[str] = []


class TrainRequest(BaseModel):
    level: str
    stage: int
    choices: list[Choice]


class PredictRequest(BaseModel):
    model_id: str
    test_id: str


class RevealRequest(BaseModel):
    model_id: str
    test_id: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/level/{level_id}/setup")
def setup(level_id: str):
    return get_service().setup(level_id)


@app.post("/api/level/{level_id}/pool")
def pool(level_id: str, request: PoolRequest):
    if request.level != level_id:
        raise ml.ApiError("invalid_request", "Path level and body level differ.", 400)
    return get_service().pool(level_id, request.stage, request.accepted)


@app.post("/api/level/{level_id}/train")
def train(level_id: str, request: TrainRequest):
    if request.level != level_id:
        raise ml.ApiError("invalid_request", "Path level and body level differ.", 400)
    return get_service().train(
        level_id, request.stage, [c.model_dump() for c in request.choices]
    )


@app.post("/api/level/{level_id}/predict")
def predict(level_id: str, request: PredictRequest):
    return get_service().predict(level_id, request.model_id, request.test_id)


@app.post("/api/level/{level_id}/reveal")
def reveal(level_id: str, request: RevealRequest):
    return get_service().reveal(level_id, request.model_id, request.test_id)
