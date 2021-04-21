from typing import Optional

from labml_db import Model, Index

from labml_app import utils

INSTRUCTIONS = {

}

STATUSES = ['instruction_received', 'computer_notified', 'ui_notified', 'completed']


class Job(Model['Job']):
    job_uuid: str
    instruction: str
    status: str

    @classmethod
    def defaults(cls):
        return dict(job_uuid='',
                    instruction='',
                    status='',
                    )

    def get_data(self):
        return {
            'job_uuid': self.job_uuid,
            'instruction': self.instruction,
            'status': self.status,
        }

    def update_status(self):
        if self.status == STATUSES[-1]:
            return

        for i, status in enumerate(STATUSES):
            if self.status == status:
                self.status = STATUSES[i + 1]
                break

        self.save()


class JobIndex(Index['Job']):
    pass


def create(instruction: str) -> Job:
    job = Job(job_uuid=utils.gen_token(),
              instruction=instruction,
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
