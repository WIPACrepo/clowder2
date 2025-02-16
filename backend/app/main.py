import logging

import uvicorn
from beanie import init_beanie
from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseConfig

from app.config import settings
from app.keycloak_auth import get_current_username
from app.models.authorization import AuthorizationDB
from app.models.config import ConfigEntryDB
from app.models.datasets import DatasetDB, DatasetDBViewList
from app.models.errors import ErrorDB
from app.models.feeds import FeedDB
from app.models.files import FileDB, FileVersionDB, FileDBViewList
from app.models.folders import FolderDB, FolderDBViewList
from app.models.groups import GroupDB
from app.models.listeners import (
    EventListenerDB,
    EventListenerJobDB,
    EventListenerJobUpdateDB,
    EventListenerJobViewList,
    EventListenerJobUpdateViewList,
)
from app.models.metadata import MetadataDB, MetadataDefinitionDB
from app.models.thumbnails import ThumbnailDB
from app.models.tokens import TokenDB
from app.models.users import UserDB, UserAPIKeyDB, ListenerAPIKeyDB
from app.models.visualization_config import VisualizationConfigDB
from app.models.visualization_data import VisualizationDataDB
from app.routers import folders, groups, status
from app.routers import (
    users,
    authorization,
    metadata,
    files,
    metadata_files,
    datasets,
    metadata_datasets,
    authentication,
    keycloak,
    elasticsearch,
    listeners,
    feeds,
    jobs,
    visualization,
    thumbnails,
)

# setup loggers
from os import path
log_file_path = path.join(path.dirname(path.abspath(__file__)),'logging.conf')
logging.config.fileConfig(log_file_path, disable_existing_loggers=False)
from app.search.config import indexSettings
from app.search.connect import connect_elasticsearch, create_index

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V2_STR}/openapi.json",
    description="A cloud native data management framework to support any research domain. Clowder was "
    "developed to help researchers and scientists in data intensive domains manage raw data, complex "
    "metadata, and automatic data pipelines. ",
    version="2.0.0-beta.1",
    contact={"name": "Clowder", "url": "https://clowderframework.org/"},
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
)
BaseConfig.arbitrary_types_allowed = True

#@app.middleware("http")
#async def log_requests(request: Request, call_next):
#    idem = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
#    logger.info(f"rid={idem} start request path={request.url.path}")
#    start_time = time.time()
#    response = await call_next(request)
#    process_time = (time.time() - start_time) * 1000
#    formatted_process_time = '{0:.2f}'.format(process_time)
#    logger.info(f"rid={idem} completed_in={formatted_process_time}ms status_code={response.status_code}")
#    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter()
api_router.include_router(authentication.router, tags=["login"])
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    authorization.router,
    prefix="/authorizations",
    tags=["authorization"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    metadata.router,
    prefix="/metadata",
    tags=["metadata"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    files.router,
    prefix="/files",
    tags=["files"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    metadata_files.router,
    prefix="/files",
    tags=["metadata"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    datasets.router,
    prefix="/datasets",
    tags=["datasets"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    metadata_datasets.router, prefix="/datasets", tags=["metadata"]
)
api_router.include_router(
    folders.router,
    prefix="/folders",
    tags=["folders"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    listeners.router,
    prefix="/listeners",
    tags=["listeners"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    listeners.legacy_router,
    prefix="/extractors",
    tags=["extractors"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    jobs.router,
    prefix="/jobs",
    tags=["jobs"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    elasticsearch.router,
    prefix="/elasticsearch",
    tags=["elasticsearch"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    feeds.router,
    prefix="/feeds",
    tags=["feeds"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    groups.router,
    prefix="/groups",
    tags=["groups"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    visualization.router,
    prefix="/visualizations",
    tags=["visualizations"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(
    thumbnails.router,
    prefix="/thumbnails",
    tags=["thumbnails"],
    dependencies=[Depends(get_current_username)],
)
api_router.include_router(status.router, prefix="/status", tags=["status"])
api_router.include_router(keycloak.router, prefix="/auth", tags=["auth"])
app.include_router(api_router, prefix=settings.API_V2_STR)


def gather_documents():
    pass


@app.on_event("startup")
async def startup_beanie():
    """Setup Beanie Object Document Mapper (ODM) to interact with MongoDB."""
    client = AsyncIOMotorClient(str(settings.MONGODB_URL))
    await init_beanie(
        database=getattr(client, settings.MONGO_DATABASE),
        # Make sure to include all models. If one depends on another that is not in the list it is not clear which one is missing.
        document_models=[
            ConfigEntryDB,
            DatasetDB,
            DatasetDBViewList,
            AuthorizationDB,
            MetadataDB,
            MetadataDefinitionDB,
            FolderDB,
            FolderDBViewList,
            FileDB,
            FileVersionDB,
            FileDBViewList,
            FeedDB,
            EventListenerDB,
            EventListenerJobDB,
            EventListenerJobUpdateDB,
            EventListenerJobViewList,
            EventListenerJobUpdateViewList,
            UserDB,
            UserAPIKeyDB,
            ListenerAPIKeyDB,
            GroupDB,
            TokenDB,
            ErrorDB,
            VisualizationConfigDB,
            VisualizationDataDB,
            ThumbnailDB,
        ],
        recreate_views=True,
    )


@app.on_event("startup")
async def startup_elasticsearch():
    # create elasticsearch indices
    es = await connect_elasticsearch()
    create_index(
        es,
        settings.elasticsearch_index,
        settings.elasticsearch_setting,
        indexSettings.es_mappings,
    )


@app.on_event("shutdown")
async def shutdown_db_client():
    pass


@app.get("/")
async def root():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
