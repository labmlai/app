from pathlib import Path

import redis
from labml_db import Model, Index
from labml_db.driver.redis import RedisDbDriver
from labml_db.driver.file import FileDbDriver
from labml_db.index_driver.redis import RedisIndexDbDriver
from labml_db.index_driver.file import FileIndexDbDriver
from labml_db.serializer.json import JsonSerializer
from labml_db.serializer.yaml import YamlSerializer
from labml_db.serializer.pickle import PickleSerializer

from .. import settings
from .project import Project, ProjectIndex, create_project, clean_project, delete_unclaimed_runs
from .user import User, UserIndex, TokenOwnerIndex, add_token_owners, remove_corrupted_runs
from .status import Status, RunStatus
from .app_token import AppToken, AppTokenIndex
from .run import Run, RunIndex
from .computer import Computer, ComputerIndex
from ..analyses import AnalysisManager

Models = [(YamlSerializer(), User), (YamlSerializer(), Project), (JsonSerializer(), Status),
          (JsonSerializer(), RunStatus), (JsonSerializer(), AppToken), (JsonSerializer(), Run),
          (JsonSerializer(), Computer)] + [(s(), m) for s, m, p in AnalysisManager.get_db_models()]

Indexes = [ProjectIndex, UserIndex, TokenOwnerIndex, AppTokenIndex, RunIndex, ComputerIndex] + [m for s, m, p in
                                                                                                AnalysisManager.get_db_indexes()]

DATA_PATH = settings.DATA_PATH

db = redis.Redis(host='localhost', port=6379, db=0)

if settings.IS_LOCAL_SETUP:
    Model.set_db_drivers([FileDbDriver(PickleSerializer(), m, Path(f'{DATA_PATH}/{m.__name__}')) for s, m in Models])
else:
    Model.set_db_drivers([RedisDbDriver(s, m, db) for s, m in Models])

if settings.IS_LOCAL_SETUP:
    Index.set_db_drivers(
        [FileIndexDbDriver(YamlSerializer(), m, Path(f'{DATA_PATH}/{m.__name__}.yaml')) for m in Indexes])

else:
    Index.set_db_drivers([RedisIndexDbDriver(m, db) for m in Indexes])

create_project(settings.FLOAT_PROJECT_TOKEN, 'float project')
create_project(settings.SAMPLES_PROJECT_TOKEN, 'samples project')

# clean_project(settings.FLOAT_PROJECT_TOKEN)
# # TODO schedule this event to run every 12 hours later
# delete_unclaimed_runs()
# remove_corrupted_runs()
