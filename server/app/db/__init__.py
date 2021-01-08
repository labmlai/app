import redis
from importlib import import_module

from labml_db import Model, Index
from labml_db.driver.redis import RedisDbDriver
from labml_db.index_driver.redis import RedisIndexDbDriver
from labml_db.serializer.json import JsonSerializer
from labml_db.serializer.yaml import YamlSerializer

from .. import settings
from .project import Project, ProjectIndex, create_project
from .user import User, UserIndex
from .status import Status, RunStatus
from .session import Session, SessionIndex
from .run import Run, RunIndex
from .computer import Computer, ComputerIndex

AnalysisManager = getattr(import_module(settings.ANALYSES_MODULE, package='app'), "AnalysisManager")

Models = [(YamlSerializer(), User), (YamlSerializer(), Project), (JsonSerializer(), Status),
          (JsonSerializer(), RunStatus), (JsonSerializer(), Session), (JsonSerializer(), Run),
          (JsonSerializer(), Computer)] + [(s(), m) for s, m, p in AnalysisManager.get_db_models()]

Indexes = [ProjectIndex, UserIndex, SessionIndex, RunIndex, ComputerIndex] + [m for s, m, p in
                                                                              AnalysisManager.get_db_indexes()]

DATA_PATH = settings.DATA_PATH

db = redis.Redis(host='localhost', port=6379, db=0)

Model.set_db_drivers(
    [RedisDbDriver(s, m, db) for s, m in Models]

),

Index.set_db_drivers(
    [RedisIndexDbDriver(m, db) for m in Indexes]
)

create_project(settings.FLOAT_PROJECT_TOKEN, 'float project')
create_project(settings.SAMPLES_PROJECT_TOKEN, 'samples project')

project.clean_project(settings.FLOAT_PROJECT_TOKEN)
