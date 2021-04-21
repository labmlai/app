from typing import List, Dict, Set

from labml_db import Model, Index, Key

from . import job


class Computer(Model['Computer']):
    computer_uuid: str
    sessions: Set[str]
    active_runs: Set[str]
    deleted_runs: Set[str]
    jobs: Dict[str, Key['job.Job']]

    @classmethod
    def defaults(cls):
        return dict(computer_uuid='',
                    sessions={},
                    active_runs={},
                    deleted_runs={},
                    jobs={}
                    )

    def get_sessions(self) -> List[str]:
        return list(self.sessions)

    def get_runs(self) -> List[str]:
        return list(self.active_runs)

    def sync_runs(self, runs: List[str]) -> Dict[str, List[str]]:
        active = []
        deleted = []
        unknown = []
        for run_uuid in runs:
            if run_uuid in self.active_runs:
                active.append(run_uuid)
            elif run_uuid in self.deleted_runs:
                deleted.append(run_uuid)
            else:
                unknown.append(run_uuid)

        return {'active': active,
                'deleted': deleted,
                'unknown': unknown}

    def get_data(self):
        return {
            'computer_uuid': self.computer_uuid,
            'sessions': self.sessions,
            'active_runs': self.active_runs
        }


class ComputerIndex(Index['Computer']):
    pass


def get_or_create(computer_uuid: str) -> Computer:
    computer_key = ComputerIndex.get(computer_uuid)

    if not computer_key:
        computer = Computer(computer_uuid=computer_uuid,
                            )
        computer.save()
        ComputerIndex.set(computer_uuid, computer.key)

        return computer

    return computer_key.load()


def add_session(computer_uuid: str, session_uuid: str) -> None:
    if not computer_uuid:
        return

    c = get_or_create(computer_uuid)

    c.sessions.add(session_uuid)
    c.save()


def remove_session(computer_uuid: str, session_uuid: str) -> None:
    if not computer_uuid:
        return

    c = get_or_create(computer_uuid)

    if session_uuid in c.sessions:
        c.sessions.remove(session_uuid)
        c.save()


def add_run(computer_uuid: str, run_uuid: str) -> None:
    if not computer_uuid:
        return

    c = get_or_create(computer_uuid)

    c.active_runs.add(run_uuid)
    c.save()


def remove_run(computer_uuid: str, run_uuid: str) -> None:
    if not computer_uuid:
        return

    c = get_or_create(computer_uuid)

    if run_uuid in c.active_runs:
        c.active_runs.remove(run_uuid)
        c.save()
