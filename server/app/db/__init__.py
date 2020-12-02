import redis

from labml_db import Model, Index
from labml_db.driver.redis import RedisDbDriver
from labml_db.index_driver.redis import RedisIndexDbDriver
from labml_db.serializer.json import JsonSerializer
from labml_db.serializer.yaml import YamlSerializer

from .project import Project, ProjectIndex, create_project
from .user import User, UserIndex
from .status import Status, RunStatus
from .session import Session, SessionIndex
from .run import Run, RunIndex
from .computer import Computer, ComputerIndex
from ..analyses import AnalysisManager

from .. import settings

DATA_PATH = settings.DATA_PATH

db = redis.Redis(host='localhost', port=6379, db=0)

Model.set_db_drivers(
    [RedisDbDriver(s(), m, db) for s, m, p in AnalysisManager.get_db_models()] + [
        RedisDbDriver(YamlSerializer(), User, db),
        RedisDbDriver(YamlSerializer(), Project, db),
        RedisDbDriver(JsonSerializer(), Status, db),
        RedisDbDriver(JsonSerializer(), RunStatus, db),
        RedisDbDriver(JsonSerializer(), Session, db),
        RedisDbDriver(JsonSerializer(), Run, db),
        RedisDbDriver(JsonSerializer(), Computer, db),
    ])

Index.set_db_drivers(
    [RedisIndexDbDriver(m, db) for s, m, p in AnalysisManager.get_db_indexes()] + [
        RedisIndexDbDriver(ProjectIndex, db),
        RedisIndexDbDriver(UserIndex, db),
        RedisIndexDbDriver(SessionIndex, db),
        RedisIndexDbDriver(RunIndex, db),
        RedisIndexDbDriver(ComputerIndex, db),
    ])

create_project(settings.FLOAT_PROJECT_TOKEN, 'float project')
create_project(settings.SAMPLES_PROJECT_TOKEN, 'samples project')
