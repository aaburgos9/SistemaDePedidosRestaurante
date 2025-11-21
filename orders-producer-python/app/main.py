from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.controllers.order_controller import router as order_router
from app.messaging.messaging import init_rabbit, close_rabbit

app = FastAPI(title=settings.PROJECT_NAME)

# 👇 orígenes permitidos (Vite)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    init_rabbit(app)


@app.on_event("shutdown")
def shutdown_event():
    close_rabbit(app)


app.include_router(order_router)
