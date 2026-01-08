"""Application configuration."""
from pathlib import Path
from dotenv import load_dotenv
import os

ROOT_DIR = Path(__file__).parent.parent.parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB configuration
MONGO_URL = os.environ.get('MONGO_URL') or os.environ.get('MONGO_URI')
DB_NAME = os.environ.get('DB_NAME', 'kbeauty')  # Valeur par défaut 'kbeauty'

# CORS configuration
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')

# Logging configuration
LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')