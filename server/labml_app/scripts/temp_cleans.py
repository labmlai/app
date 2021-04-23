from labml_app.logger import logger
from labml_app.db import project, run, session, computer

from labml_db.serializer.json import JsonSerializer


def clean_sessions():
    logger.info('clean_sessions....')
    session_keys = session.Session.get_all()

    for session_key in session_keys:
        s = session_key.read()
        if 'session_id' in s and 'expiration' in s:
            session_key.delete()
            try:
                session.SessionIndex.delete(s['session_id'])
            except KeyError:
                logger.error(f'session_id not found in {s}')


def clean_computers():
    logger.info('clean_computers....')
    computer_keys = computer.Computer.get_all()

    for computer_key in computer_keys:
        c = computer_key.read()
        if 'start_time' in c:
            computer_key.delete()
            try:
                computer.ComputerIndex.delete(c['session_uuid'])
            except KeyError:
                logger.error(f'session_uuid not found in {c}')


def clean_runs():
    logger.info('clean_runs....')
    run_keys = run.Run.get_all()

    for run_key in run_keys:
        r = run_key.read()
        if 'dynamic' in r:
            r.pop('dynamic')
            run_key.save(r)


def clean_projects():
    logger.info('clean_projects....')
    project_keys = project.Project.get_all()

    for project_key in project_keys:
        p = project_key.read()
        if 'computers' in p:
            p.pop('computers')
            project_key.save(p)


def move_computers():
    computer_keys = computer.Computer.get_all()

    for computer_key in computer_keys:
        data = computer_key.read_from_serializer(JsonSerializer())

        c = computer.Computer(computer_uuid=data['computer_uuid'],
                              sessions=data.get('sessions', []))
        c.save()
        computer.ComputerIndex.set(c.computer_uuid, c.key)

        computer_key.delete()


if __name__ == "__main__":
    # clean_sessions()
    # clean_computers()
    # clean_runs()
    # clean_projects()
    move_computers()
