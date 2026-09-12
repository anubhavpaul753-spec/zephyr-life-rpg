from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from config import CORS_ORIGINS
from routers import auth_routes, quest_routes, relationship_routes, career_routes, crossroads_routes, shop_routes

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title='Project Mirror: Life RPG Backend Engine',
    description='Full-stack real-life RPG progression engine, non-linear leveling, relationship bonds, and grounded mentor guidance.',
    version='1.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Register Routers
app.include_router(auth_routes.router)
app.include_router(quest_routes.router)
app.include_router(relationship_routes.router)
app.include_router(career_routes.router)
app.include_router(crossroads_routes.router)
app.include_router(shop_routes.router)

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

# Serve Frontend static assets so entire app runs from 1 server
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
css_dir = os.path.join(frontend_dir, 'css')
js_dir = os.path.join(frontend_dir, 'js')

if os.path.exists(css_dir):
    app.mount('/css', StaticFiles(directory=css_dir), name='css')
if os.path.exists(js_dir):
    app.mount('/js', StaticFiles(directory=js_dir), name='js')

@app.get('/')
@app.get('/app')
def serve_frontend():
    index_path = os.path.join(frontend_dir, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(index_path, headers={'Cache-Control': 'no-cache, no-store, must-revalidate'})
    return {
        'app': 'Project Mirror: Life RPG',
        'status': 'online',
        'docs': '/docs',
        'philosophy': 'Upgrade your true self in the real world.'
    }

@app.get('/health')
def health():
    return {'status': 'healthy'}

@app.get('/api/status')
def api_status():
    return {
        'app': 'Project Mirror: Life RPG Backend Engine',
        'status': 'online',
        'docs': '/docs',
        'health': 'healthy',
        'architecture': 'FastAPI + SQLAlchemy + SQLite/PostgreSQL + LocalStorage Resilient Sync'
    }
