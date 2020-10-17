from pathlib import Path

from labml_db import Model, Index, FileDbDriver, JsonSerializer, FileIndexDbDriver, YamlSerializer

from .user import Project, User, UsernameIndex
from .status import Status, StatusIndex
from .session import Session, SessionIndex

Model.set_db_drivers([
    FileDbDriver(JsonSerializer(), User, Path('./data/user')),
    FileDbDriver(YamlSerializer(), Project, Path('./data/project')),
    FileDbDriver(JsonSerializer(), Status, Path('./data/Status')),
    FileDbDriver(JsonSerializer(), Session, Path('./data/Session')),
])

Index.set_db_drivers([
    FileIndexDbDriver(YamlSerializer(), UsernameIndex, Path('./data/UserNameIndex.yaml')),
    FileIndexDbDriver(YamlSerializer(), SessionIndex, Path('./data/SessionIndex.yaml')),
    FileIndexDbDriver(YamlSerializer(), StatusIndex, Path('./data/StatusIndex.yaml'))
])
