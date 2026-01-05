"""Database package."""
from .connection import get_database, close_database

__all__ = ["get_database", "close_database"]

