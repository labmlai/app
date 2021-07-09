import subprocess


def start_server():
    try:
        subprocess.run(["pipenv install --ignore-pipfile"], shell=True, capture_output=True)
        subprocess.run(
            ["pipenv run gunicorn --bind 0.0.0.0:5000 -w 2 -k uvicorn.workers.UvicornWorker labml_app.flask_app:app"],
            shell=True,
            capture_output=True)
    except KeyboardInterrupt:
        pass
