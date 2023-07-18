from typing import Optional, List

from beanie import Document
from pydantic import BaseModel

from app.models.listeners import ExtractorInfo, EventListenerJobDB
from app.models.metadata import MongoDBRef
from app.models.pyobjectid import PyObjectId
from app.models.visualization_data import VisualizationDataOut


class VisualizationConfigBase(BaseModel):
    resource: MongoDBRef
    extractor_info: Optional[ExtractorInfo]
    job: Optional[EventListenerJobDB]
    client: Optional[str]
    parameters: dict = {}
    visualization_mimetype: str


class VisualizationConfigIn(VisualizationConfigBase):
    pass


class VisualizationConfigDB(Document, VisualizationConfigBase):
    class Settings:
        name = "vizualization_config"


class VisualizationConfigOut(VisualizationConfigDB):
    visualization_data: List[VisualizationDataOut] = []

    class Config:
        fields = {"id": "id"}
