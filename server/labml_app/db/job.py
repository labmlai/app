import time
from typing import Optional, Dict, Union, Any

from labml_db import Model, Index

from labml_app import utils


class JobStatuses:
    INITIATED = 'initiated'
    ERROR = 'error'
    COMPLETED = 'completed'
    COMP_NOTIFIED = 'comp_notified'
    UI_NOTIFIED = 'ui_notified'


class JobInstructions:
    START_TB = 'start_tb'
    DELETE_RUN = 'delete_runs'
    CLEAR_CP = 'clear_cp'


JobDict = Dict[str, Union[str, float]]


class Job(Model['Job']):
    job_uuid: str
    instruction: str
    status: str
    created_time: float
    completed_time: float
    data: Dict[str, Any]

    @classmethod
    def defaults(cls):
        return dict(job_uuid='',
                    instruction='',
                    status='',
                    created_time=None,
                    completed_time=None,
                    data={},
                    )

    @property
    def is_completed(self) -> bool:
        return self.status == JobStatuses.COMPLETED

    def is_error(self) -> bool:
        return self.status == JobStatuses.ERROR

    def to_data(self) -> JobDict:
        return {
            'uuid': self.job_uuid,
            'instruction': self.instruction,
            'status': self.status,
            'created_time': self.created_time,
            'completed_time': self.completed_time,
            'data': self.data
        }

    def update_status(self, status: str) -> None:
        self.status = status

        if self.status in [JobStatuses.COMPLETED, JobStatuses.ERROR]:
            self.completed_time = time.time()

        self.save()


class JobIndex(Index['Job']):
    pass


def create(instruction: str, data: Dict[str, Any]) -> Job:
    job = Job(job_uuid=utils.gen_token(),
              instruction=instruction,
              created_time=time.time(),
              data=data,
              status=JobStatuses.INITIATED,
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
