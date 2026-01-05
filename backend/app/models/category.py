"""Category model."""
from pydantic import BaseModel, Field, ConfigDict
import uuid


class Category(BaseModel):
    """Category model."""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    image_url: str

