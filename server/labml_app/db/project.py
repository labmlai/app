import time
from typing import List, Dict, Union

from labml_db import Model, Key, Index

from . import run
from .computer import Computer
from ..logger import logger


class Project(Model['Project']):
    labml_token: str
    is_sharable: float
    name: str
    runs: Dict[str, Key[run.Run]]
    computers: Dict[str, Key[Computer]]
    is_run_added: bool

    @classmethod
    def defaults(cls):
        return dict(name='',
                    is_sharable=False,
                    labml_token='',
                    runs={},
                    computers={},
                    is_run_added=False,
                    )

    def get_runs(self) -> List[run.Run]:
        res = []
        for run_uuid, run_key in self.runs.items():
            try:
                res.append(run_key.load())
            except TypeError as e:
                logger.log('error in creating run list, ' + run_uuid + ':' + str(e))

        if self.is_run_added:
            self.is_run_added = False
            self.save()

        return res

    def get_computers(self) -> List[Computer]:
        res = []
        for session_uuid, computer_key in self.computers.items():
            res.append(computer_key.load())

        return res

    def delete_runs(self, run_uuids: List[str]):
        for run_uuid in run_uuids:
            if run_uuid in self.runs:
                self.runs.pop(run_uuid)
                run.delete(run_uuid)

        self.save()

    def delete_computers(self, session_uuids: List[str]):
        for session_uuid in session_uuids:
            if session_uuid in self.computers:
                self.computers.pop(session_uuid)

        self.save()


class ProjectIndex(Index['Project']):
    pass


def get_project(labml_token: str) -> Union[None, Project]:
    project_key = ProjectIndex.get(labml_token)

    if project_key:
        return project_key.load()

    return None


def create_project(labml_token: str, name: str):
    project_key = ProjectIndex.get(labml_token)

    if not project_key:
        project = Project(labml_token=labml_token,
                          name=name,
                          is_sharable=True
                          )
        ProjectIndex.set(project.labml_token, project.key)
        project.save()


def clean_project(labml_token: str):
    project_key = ProjectIndex.get(labml_token)
    p = project_key.load()

    delete_list = []
    for run_uuid, run_key in p.runs.items():
        r = run_key.load()
        s = r.status.load()

        if (time.time() - 86400) > s.last_updated_time:
            delete_list.append(run_uuid)

    for run_uuid in delete_list:
        p.runs.pop(run_uuid)

    p.save()


def delete_unclaimed_runs():
    run_keys = run.Run.get_all()
    for run_key in run_keys:
        if run_key:
            try:
                r = run_key.load()
                s = r.status.load()

                if not r.is_claimed and (time.time() - 86400) > s.last_updated_time:
                    run.delete(r.run_uuid)
            except TypeError:
                print(f'error while deleting the run {run_key}')
