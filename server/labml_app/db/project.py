from typing import List, Dict, Union, Optional

from labml_db import Model, Key, Index

from . import run
from . import session
from ..logger import logger


class Project(Model['Project']):
    labml_token: str
    is_sharable: float
    name: str
    runs: Dict[str, Key['run.Run']]
    sessions: Dict[str, Key['session.Session']]
    computers: Dict[str, any]
    is_run_added: bool

    @classmethod
    def defaults(cls):
        return dict(name='',
                    is_sharable=False,
                    labml_token='',
                    runs={},
                    sessions={},
                    computers={},
                    is_run_added=False,
                    )

    def is_project_run(self, run_uuid: str) -> bool:
        return run_uuid in self.runs

    def is_project_session(self, session_uuid: str) -> bool:
        return session_uuid in self.sessions

    def get_runs(self) -> List['run.Run']:
        res = []
        for run_uuid, run_key in self.runs.items():
            try:
                r = run.get_run(run_uuid)
                if r:
                    res.append(r)
                else:
                    logger.error('error in creating run list, ' + run_uuid)
            except TypeError as e:
                logger.error('error in creating run list, ' + run_uuid + ':' + str(e))

        if self.is_run_added:
            self.is_run_added = False
            self.save()

        return res

    def get_sessions(self) -> List['session.Session']:
        res = []
        for session_uuid, session_key in self.sessions.items():
            res.append(session_key.load())

        return res

    def delete_runs(self, run_uuids: List[str], project_owner: str) -> None:
        for run_uuid in run_uuids:
            if run_uuid in self.runs:
                self.runs.pop(run_uuid)
                r = run.get_run(run_uuid)
                if r and r.owner == project_owner:
                    run.delete(run_uuid)

        self.save()

    def delete_sessions(self, session_uuids: List[str], project_owner: str) -> None:
        for session_uuid in session_uuids:
            if session_uuid in self.sessions:
                self.sessions.pop(session_uuid)
                s = session.get_session(session_uuid)
                if s and s.owner == project_owner:
                    session.delete(session_uuid)

        self.save()

    def add_run(self, run_uuid: str) -> None:
        r = run.get_run(run_uuid)

        if r:
            self.runs[run_uuid] = r.key

        self.save()

    def add_session(self, session_uuid: str) -> None:
        s = session.get_session(session_uuid)

        if s:
            self.sessions[session_uuid] = s.key

        self.save()


class ProjectIndex(Index['Project']):
    pass


def get_project(labml_token: str) -> Union[None, Project]:
    project_key = ProjectIndex.get(labml_token)

    if project_key:
        return project_key.load()

    return None


def get_run(run_uuid: str, labml_token: str = '') -> Optional['run.Run']:
    p = get_project(labml_token)

    if run_uuid in p.runs:
        return p.runs[run_uuid].load()
    else:
        return None


def get_session(session_uuid: str, labml_token: str = '') -> Optional['session.Session']:
    p = get_project(labml_token)

    if session_uuid in p.sessions:
        return p.sessions[session_uuid].load()
    else:
        return None


def create_project(labml_token: str, name: str) -> None:
    project_key = ProjectIndex.get(labml_token)

    if not project_key:
        project = Project(labml_token=labml_token,
                          name=name,
                          is_sharable=True
                          )
        ProjectIndex.set(project.labml_token, project.key)
        project.save()
