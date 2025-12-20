import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time

from app.config import settings
from app.controllers.order_controller import router as order_router


app = FastAPI(
    title=settings.PROJECT_NAME,
    # No redirigir, aceptar ambas variantes directamente
    redirect_slashes=False
)

# Middleware para logging de todas las peticiones
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    print(f"📨 Incoming request: {request.method} {request.url.path}")
    print(f"📋 Headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    print(f"✅ Response: {response.status_code} - took {process_time:.2f}s")
    return response

# 👇 orígenes permitidos (Vite)
origins = [
    os.getenv("CORS_ORIGIN", "https://orders-producer-frontend-27263349264.northamerica-south1.run.app"),
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(order_router)

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "orders-producer-python",
        "timestamp": "2025-12-18T00:00:00Z"
    }

# Debug endpoint para ver rutas registradas
@app.get("/debug/routes")
def debug_routes():
    routes = []
    for route in app.routes:
        routes.append({
            "path": getattr(route, "path", None),
            "name": getattr(route, "name", None),
            "methods": list(getattr(route, "methods", []))
        })
    return {"routes": routes}
