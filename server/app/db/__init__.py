from pathlib import Path

from labml_db import Model, Index, FileDbDriver, JsonSerializer, FileIndexDbDriver, YamlSerializer

from .user import Project, ProjectIndex, User, UserIndex
from .status import Status, RunStatus, StatusIndex
from .session import Session, SessionIndex
from .run import Run, RunIndex, Series

Model.set_db_drivers([
    FileDbDriver(JsonSerializer(), User, Path('./data/user')),
    FileDbDriver(YamlSerializer(), Project, Path('./data/project')),
    FileDbDriver(JsonSerializer(), Status, Path('./data/Status')),
    FileDbDriver(JsonSerializer(), RunStatus, Path('./data/RunStatus')),
    FileDbDriver(JsonSerializer(), Session, Path('./data/Session')),
    FileDbDriver(JsonSerializer(), Run, Path('./data/Run')),
    FileDbDriver(JsonSerializer(), Series, Path('./data/Series')),
])

Index.set_db_drivers([
    FileIndexDbDriver(YamlSerializer(), ProjectIndex, Path('./data/ProjectIndex.yaml')),
    FileIndexDbDriver(YamlSerializer(), UserIndex, Path('./data/UserIndex.yaml')),
    FileIndexDbDriver(YamlSerializer(), SessionIndex, Path('./data/SessionIndex.yaml')),
    FileIndexDbDriver(YamlSerializer(), StatusIndex, Path('./data/StatusIndex.yaml')),
    FileIndexDbDriver(YamlSerializer(), RunIndex, Path('./data/RunIndex.yaml')),
])
