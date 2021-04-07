import time

from labml_app import settings
from labml_app import block_uuids
from labml_app.logger import logger
from labml_app.db import project, user, run, session


def remove_corrupted_runs() -> None:
    user_keys = user.User.get_all()
    for user_key in user_keys:
        u = user_key.load()
        p = u.default_project

        delete_runs = []
        for run_uuid in p.runs:
            if not run.get_run(run_uuid):
                delete_runs.append(run_uuid)

        for run_uuid in delete_runs:
            p.runs.pop(run_uuid)

        p.save()


def clean_float_project() -> None:
    p = project.get_project(settings.FLOAT_PROJECT_TOKEN)

    logger.info('Cleaning runs started')

    delete_run_list = []
    for run_uuid, run_key in p.runs.items():
        try:
            r = run_key.load()
            s = r.status.load()

            if not r.is_claimed and (time.time() - 86400) > s.last_updated_time:
                run.delete(run_uuid)
                delete_run_list.append(run_uuid)
            elif (time.time() - 86400) > s.last_updated_time:
                delete_run_list.append(run_uuid)
        except TypeError:
            logger.error(f'error while deleting the session {run_uuid}')

    for run_uuid in delete_run_list:
        p.runs.pop(run_uuid)
    p.save()

    logger.info('......Done.........')
    logger.info('Cleaning sessions started')

    delete_session_list = []
    for session_uuid, session_key in p.sessions.items():
        try:
            ss = session_key.load()
            s = ss.status.load()

            if not ss.is_claimed and (time.time() - 86400) > s.last_updated_time:
                session.delete(session_uuid)
                delete_session_list.append(session_uuid)
            elif (time.time() - 86400) > s.last_updated_time:
                delete_session_list.append(session_uuid)
        except TypeError:
            logger.error(f'error while deleting the session {session_uuid}')

    for session_uuid in delete_session_list:
        p.sessions.pop(session_uuid)
    p.save()

    logger.info('......Done.........')


def move_to_samples():
    logger.info('Samples moving started')
    p = project.get_project(settings.SAMPLES_PROJECT_TOKEN)
    for run_uuid in block_uuids.delete_run_uuids:
        r = run.get_run(run_uuid)

        if r.owner == 'samples':
            continue

        if r and r.owner != 'samples':
            r.owner = 'samples'
            p.add_run(run_uuid)

            r.save()
            p.save()

    logger.info('......Done.........')


if __name__ == "__main__":
    move_to_samples()
    clean_float_project()
