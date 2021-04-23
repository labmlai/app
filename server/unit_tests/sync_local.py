from labml_app.db import computer, job

c = computer.get_or_create('test_comp_2')


def create_com():
    for i in range(20):
        run_uuid = f'run_uuid{i}'
        computer.add_run(c.computer_uuid, run_uuid)

    for i in range(10, 15):
        run_uuid = f'run_uuid{i}'
        computer.remove_run(c.computer_uuid, run_uuid)

    print(c.get_active_runs())
    print(c.get_deleted_runs())


def sync_computer():
    runs = ['run_uuid15', 'run_uuid19', 'run_uuid11', 'run_uuid13', 'run_uuid4', 'unknown_run_1''unknown_run_2']

    res = c.sync_runs(runs)
    print(res)


def create_jobs():
    c.create_jobs(['delete_runs', 'start_tb', 'start_tb', 'delete_runs'])
    print(c.active_jobs)


def get_active_jobs():
    res = c.get_active_jobs()
    print(res)


def get_jobs():
    res = c.get_jobs(['e9771c01fbb34c4d9b67c59eddfa1544'])
    print(res)


def sync_computer():
    c.sync_jobs([{
        "job_uuid": "e9771c01fbb34c4d9b67c59eddfa1544",
        "status": "completed"
    }])


if __name__ == "__main__":
    # create_com()
    # sync_computer()
    # create_jobs()
    # get_active_jobs()
    get_jobs()
    # sync_computer()
