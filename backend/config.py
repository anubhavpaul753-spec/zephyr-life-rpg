import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./life_rpg.db')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'e83921bf8a02c9182390a7ef6409b6a5043818e38d9cfb182049e29a8f4c1029')
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 60 * 24 * 7))
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
CORS_ORIGINS = ['*']
