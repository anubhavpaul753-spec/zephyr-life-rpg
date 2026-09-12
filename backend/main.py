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

@app.get('/')
def root():
    return {
        'app': 'Project Mirror: Life RPG',
        'status': 'online',
        'docs': '/docs',
        'philosophy': 'Upgrade your true self in the real world.'
    }

@app.get('/health')
def health():
    return {'status': 'healthy'}
