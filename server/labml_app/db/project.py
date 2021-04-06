import time
from typing import List, Dict, Union

from labml_db import Model, Key, Index

from . import run
from . import session
from ..logger import logger


class Project(Model['Project']):
    labml_token: str
    is_sharable: float
    name: str
    runs: Dict[str, Key[run.Run]]
    sessions: Dict[str, Key[session.Session]]
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

    def get_runs(self) -> List[run.Run]:
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

    def get_sessions(self) -> List[session.Session]:
        res = []
        for session_uuid, session_key in self.sessions.items():
            res.append(session_key.load())

        return res

    def delete_runs(self, run_uuids: List[str], project_owner: str) -> None:
        for run_uuid in run_uuids:
            if run_uuid in self.runs:
                self.runs.pop(run_uuid)
                run_key = run.RunIndex.get(run_uuid)
                if run_key:
                    r = run_key.load()
                    if r.owner == project_owner:
                        run.delete(run_uuid)

        self.save()

    def delete_sessions(self, session_uuids: List[str]) -> None:
        for session_uuid in session_uuids:
            if session_uuid in self.sessions:
                self.sessions.pop(session_uuid)

        self.save()

    def add_run(self, run_uuid: str) -> None:
        run_key = run.RunIndex.get(run_uuid)

        if run_key:
            self.runs[run_uuid] = run_key

        self.save()

    def add_session(self, session_uuid: str) -> None:
        session_key = session.Session.get(session_uuid)

        if session_key:
            self.sessions[session_uuid] = session_key

        self.save()


class ProjectIndex(Index['Project']):
    pass


def get_project(labml_token: str) -> Union[None, Project]:
    project_key = ProjectIndex.get(labml_token)

    if project_key:
        return project_key.load()

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


def clean_project(labml_token: str) -> None:
    project_key = ProjectIndex.get(labml_token)
    p = project_key.load()

    delete_list = []
    for run_uuid, run_key in p.runs.items():
        try:
            r = run_key.load()
            s = r.status.load()

            if (time.time() - 86400) > s.last_updated_time:
                delete_list.append(run_uuid)
        except TypeError:
            logger.error(f'error while deleting the run {run_uuid}')
            delete_list.append(run_uuid)

    for run_uuid in delete_list:
        p.runs.pop(run_uuid)

    p.save()


def delete_unclaimed_runs() -> None:
    run_keys = run.Run.get_all()
    for run_key in run_keys:
        if run_key:
            try:
                r = run_key.load()
                s = r.status.load()

                if not r.is_claimed and (time.time() - 86400) > s.last_updated_time:
                    run.delete(r.run_uuid)
            except TypeError:
                logger.error(f'error while deleting the run {run_key}')
