from pathlib import Path

from labml_db import Model, Index, FileDbDriver, JsonSerializer, FileIndexDbDriver, YamlSerializer

Model.set_db_drivers([
    FileDbDriver(JsonSerializer(), 'User', Path('./data/user')),
    FileDbDriver(YamlSerializer(), 'Project', Path('./data/project')),
    FileDbDriver(JsonSerializer(), 'Status', Path('./data/Status')),
    FileDbDriver(JsonSerializer(), 'RunStatus', Path('./data/RunStatus')),
    FileDbDriver(JsonSerializer(), 'Session', Path('./data/Session')),
])

Index.set_db_drivers([
    FileIndexDbDriver(YamlSerializer(), 'UsernameIndex', Path('./data/UserNameIndex.yaml'))
])
