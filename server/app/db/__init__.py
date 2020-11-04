from pathlib import Path

from labml_db import Model, Index
from labml_db.driver.file import FileDbDriver
from labml_db.index_driver.file import FileIndexDbDriver
from labml_db.serializer.pickle import PickleSerializer
from labml_db.serializer.json import JsonSerializer
from labml_db.serializer.yaml import YamlSerializer

from .project import Project, ProjectIndex, create_project
from .user import User, UserIndex
from .status import Status, RunStatus
from .session import Session, SessionIndex
from .run import Run, RunIndex, RunPreferences
from .series_collection import SeriesCollection

from .. import settings

DATA_PATH = settings.DATA_PATH

Model.set_db_drivers([
    FileDbDriver(YamlSerializer(), User, Path(f'{DATA_PATH}/User')),
    FileDbDriver(YamlSerializer(), Project, Path(f'{DATA_PATH}/Project')),
    FileDbDriver(JsonSerializer(), Status, Path(f'{DATA_PATH}/Status')),
    FileDbDriver(JsonSerializer(), RunStatus, Path(f'{DATA_PATH}/RunStatus')),
    FileDbDriver(JsonSerializer(), Session, Path(f'{DATA_PATH}/Session')),
    FileDbDriver(JsonSerializer(), Run, Path(f'{DATA_PATH}/Run')),
    FileDbDriver(PickleSerializer(), SeriesCollection, Path(f'{DATA_PATH}/SeriesCollection')),
    FileDbDriver(JsonSerializer(), RunPreferences, Path(f'{DATA_PATH}/RunPreferences')),
])

Index.set_db_drivers([
    FileIndexDbDriver(YamlSerializer(), ProjectIndex, Path(f'{DATA_PATH}/ProjectIndex.yaml')),
    FileIndexDbDriver(YamlSerializer(), UserIndex, Path(f'{DATA_PATH}/UserIndex.yaml')),
    FileIndexDbDriver(YamlSerializer(), SessionIndex, Path(f'{DATA_PATH}/SessionIndex.yaml')),
    FileIndexDbDriver(YamlSerializer(), RunIndex, Path(f'{DATA_PATH}/RunIndex.yaml')),
])

create_project(settings.FLOAT_PROJECT_TOKEN, 'float project')
create_project(settings.SAMPLES_PROJECT_TOKEN, 'samples project')
