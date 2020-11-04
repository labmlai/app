from pathlib import Path

from labml_db import Model, Index, FileDbDriver, JsonSerializer, FileIndexDbDriver, YamlSerializer

from .project import Project, ProjectIndex, create_float_project, create_samples_project
from .user import User, UserIndex
from .status import Status, RunStatus
from .session import Session, SessionIndex
from .run import Run, RunIndex, RunPreferences
from .series_collection import SeriesCollection

from .. import settings

DATA_PATH = settings.DATA_PATH

Model.set_db_drivers([
    FileDbDriver(JsonSerializer(), User, Path(f'{DATA_PATH}/user')),
    FileDbDriver(YamlSerializer(), Project, Path(f'{DATA_PATH}/project')),
    FileDbDriver(JsonSerializer(), Status, Path(f'{DATA_PATH}/Status')),
    FileDbDriver(JsonSerializer(), RunStatus, Path(f'{DATA_PATH}/RunStatus')),
    FileDbDriver(JsonSerializer(), Session, Path(f'{DATA_PATH}/Session')),
    FileDbDriver(JsonSerializer(), Run, Path(f'{DATA_PATH}/Run')),
    FileDbDriver(JsonSerializer(), SeriesCollection, Path(f'{DATA_PATH}/Series')),
    FileDbDriver(JsonSerializer(), RunPreferences, Path(f'{DATA_PATH}/RunPreferences')),
])

Index.set_db_drivers([
    FileIndexDbDriver(YamlSerializer(), ProjectIndex, Path(f'{DATA_PATH}/ProjectIndex.yaml')),
    FileIndexDbDriver(YamlSerializer(), UserIndex, Path(f'{DATA_PATH}/UserIndex.yaml')),
    FileIndexDbDriver(YamlSerializer(), SessionIndex, Path(f'{DATA_PATH}/SessionIndex.yaml')),
    FileIndexDbDriver(YamlSerializer(), RunIndex, Path(f'{DATA_PATH}/RunIndex.yaml')),
])

create_float_project()
create_samples_project()
