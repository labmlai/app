import time
from typing import List, Dict, Union

from labml_db import Model, Key, Index

from .run import Run
from .computer import Computer


class Project(Model['Project']):
    labml_token: str
    is_sharable: float
    name: str
    runs: Dict[str, Key[Run]]
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

    def get_runs(self) -> List[Run]:
        res = []
        for run_uuid, run_key in self.runs.items():
            res.append(run_key.load())

        if self.is_run_added:
            self.is_run_added = False
            self.save()

        return res

    def get_computers(self) -> List[Computer]:
        res = []
        for computer_uuid, computer_key in self.computers.items():
            res.append(computer_key.load())

        return res

    def delete_runs(self, run_uuids: List[str]):
        for run_uuid in run_uuids:
            if run_uuid in self.runs:
                self.runs.pop(run_uuid)

        self.save()

    def delete_computers(self, computer_uuids: List[str]):
        for computer_uuid in computer_uuids:
            if computer_uuid in self.computers:
                self.computers.pop(computer_uuid)

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
