import time
from typing import Optional, Dict, Union

from labml_db import Model, Index

from labml_app import utils

INSTRUCTIONS = ['start_tensor_board']

STATUSES = ['instruction_received', 'computer_notified', 'ui_notified', 'completed']
ERROR_STATUS = 'error'

JobDict = Dict[str, Union[str, float]]


class Job(Model['Job']):
    job_uuid: str
    instruction: str
    status: str
    created_time: float
    completed_time: float

    @classmethod
    def defaults(cls):
        return dict(job_uuid='',
                    instruction='',
                    status='',
                    created_time=None,
                    completed_time=None
                    )

    def to_data(self) -> JobDict:
        return {
            'job_uuid': self.job_uuid,
            'instruction': self.instruction,
            'status': self.status,
            'created_time': self.created_time,
            'completed_time': self.completed_time
        }

    def update_status(self, status: str = '') -> None:
        if status:
            self.status = status
        elif self.status == STATUSES[-1] or self.status == ERROR_STATUS:
            return
        else:
            for i, status in enumerate(STATUSES):
                if self.status == status:
                    self.status = STATUSES[i + 1]
                    break

        if self.status == STATUSES[-1]:
            self.completed_time = time.time()

        self.save()


class JobIndex(Index['Job']):
    pass


def create(instruction: str) -> Job:
    job = Job(job_uuid=utils.gen_token(),
              instruction=instruction,
              created_time=time.time()
              )
    job.save()
    JobIndex.set(job.job_uuid, job.key)

    return job


def get(job_uuid: str) -> Optional[Job]:
    job_key = JobIndex.get(job_uuid)

    if job_key:
        return job_key.load()

    return None


def delete(job_uuid: str) -> None:
    job_key = JobIndex.get(job_uuid)

    if job_key:
        job_key.delete()
        JobIndex.delete(job_uuid)
