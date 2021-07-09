import subprocess


def install_pipenv_packages():
    try:
        subprocess.run(["pipenv install --ignore-pipfile"], shell=True)
    except KeyboardInterrupt:
        pass


def start_server():
    try:
        subprocess.run(
            ["pipenv run gunicorn --bind 0.0.0.0:5000 -w 2 -k uvicorn.workers.UvicornWorker labml_app.flask_app:app"],
            shell=True,
        )
    except KeyboardInterrupt:
        pass
