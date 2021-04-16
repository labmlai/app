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
from . import project
from . import user
from . import status
from . import app_token
from . import run
from . import session
from . import computer
from . import blocked_uuids
from .. import analyses

DATA_PATH = settings.DATA_PATH

db = redis.Redis(host='localhost', port=6379, db=0)

Models = [(YamlSerializer(), user.User),
          (YamlSerializer(), project.Project),
          (JsonSerializer(), status.Status),
          (JsonSerializer(), status.RunStatus),
          (JsonSerializer(), app_token.AppToken),
          (JsonSerializer(), run.Run),
          (JsonSerializer(), session.Session),
          (JsonSerializer(), computer.Computer)] + [(s(), m) for s, m, p in analyses.AnalysisManager.get_db_models()]

Indexes = [project.ProjectIndex,
           user.UserIndex,
           blocked_uuids.BlockedRunIndex,
           blocked_uuids.BlockedSessionIndex,
           user.TokenOwnerIndex,
           app_token.AppTokenIndex,
           run.RunIndex,
           session.SessionIndex,
           computer.ComputerIndex] + [m for s, m, p in analyses.AnalysisManager.get_db_indexes()]

if settings.IS_LOCAL_SETUP:
    Model.set_db_drivers([FileDbDriver(PickleSerializer(), m, Path(f'{DATA_PATH}/{m.__name__}')) for s, m in Models])
    Index.set_db_drivers(
        [FileIndexDbDriver(YamlSerializer(), m, Path(f'{DATA_PATH}/{m.__name__}.yaml')) for m in Indexes])
else:
    Model.set_db_drivers([RedisDbDriver(s, m, db) for s, m in Models])
    Index.set_db_drivers([RedisIndexDbDriver(m, db) for m in Indexes])

project.create_project(settings.FLOAT_PROJECT_TOKEN, 'float project')
project.create_project(settings.SAMPLES_PROJECT_TOKEN, 'samples project')
