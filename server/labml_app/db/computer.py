from typing import List, Dict, Set, Optional

from labml_db import Model, Index, Key

from . import job

JobResponse = Dict[str, str]


class Computer(Model['Computer']):
    computer_uuid: str
    sessions: Set[str]
    active_runs: Set[str]
    deleted_runs: Set[str]
    active_jobs: Dict[str, Key['job.Job']]
    completed_jobs: Dict[str, Key['job.Job']]

    @classmethod
    def defaults(cls):
        return dict(computer_uuid='',
                    sessions={},
                    active_runs={},
                    deleted_runs={},
                    active_jobs={},
                    completed_jobs={},
                    )

    def get_sessions(self) -> List[str]:
        return list(self.sessions)

    def get_active_runs(self) -> List[str]:
        return list(self.active_runs)

    def get_job(self, job_uuid: str) -> Optional['job.Job']:
        job_key = None

        if job_uuid in self.active_jobs:
            job_key = self.active_jobs[job_uuid]

        if job_uuid in self.completed_jobs:
            job_key = self.completed_jobs[job_uuid]

        if job_key:
            return job_key.load()

        return None

    def get_active_jobs(self) -> List['job.JobDict']:
        res = []
        for k, v in self.active_jobs.items():
            j = v.load()
            res.append(j.to_data())

        return res

    def create_job(self, instruction: str) -> 'job.Job':
        j = job.create(instruction)

        self.active_jobs[j.job_uuid] = j.key
        self.save()

        return j

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

    def sync_job_statuses(self, responses: List[JobResponse]) -> None:
        for response in responses:
            job_uuid = response['job_uuid']
            status = response['status']

            if job_uuid in self.active_jobs:
                j = self.active_jobs[job_uuid].load()
                j.update_status(status)

                if j.is_completed:
                    self.active_jobs.pop(job_uuid)
                    self.completed_jobs[job_uuid] = j.key

        self.save()

    def get_data(self):
        return {
            'computer_uuid': self.computer_uuid,
            'sessions': self.get_sessions(),
            'active_runs': self.get_active_runs()
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
        c.deleted_runs.add(run_uuid)
        c.save()
