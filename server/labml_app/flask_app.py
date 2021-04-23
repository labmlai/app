import git
import logging
import time
import warnings
from pathlib import Path
from time import strftime

from flask import Flask, request, g, send_from_directory
from flask_cors import CORS
from flasgger import Swagger

from labml_app import handlers
from labml_app import settings
from labml_app.logger import logger
from labml_app.utils import mix_panel, slack
from labml_app import db

if settings.SENTRY_DSN:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.flask import FlaskIntegration

        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            integrations=[FlaskIntegration()],
            traces_sample_rate=1.0
        )
    except ImportError:
        warnings.warn("Sentry SDK not installed")


def get_static_path():
    package_path = Path(__file__).parent
    app_path = package_path.parent.parent

    static_path = app_path / 'static'
    if static_path.exists():
        return static_path

    static_path = package_path.parent / 'static'
    if not static_path.exists():
        static_path = package_path / 'static'
    if not static_path.exists():
        raise RuntimeError(f'Static folder not found. Package path: {str(package_path)}')

    return static_path


STATIC_PATH = get_static_path()


def create_app():
    # disable flask logger
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)

    _app = Flask(__name__, static_folder=str(STATIC_PATH), static_url_path='/static')

    with _app.app_context():
        db.init_db()

    def run_on_start():
        repo = git.Repo(search_parent_directories=True)
        sha = repo.head.object.hexsha

        if settings.IS_MIX_PANEL:
            mp_tread = mix_panel.MixPanelThread()
            mp_tread.start()

        logger.info('initializing labml_app')
        logger.error(f'THIS IS NOT AN ERROR: Server Deployed SHA : {sha}')

    run_on_start()

    return _app


app = create_app()

template = {
    "swagger": "2.0",
    "info": {
        "title": "labml.ai Server API",
        "description": "API to communicate with UI and computer",
        "version": "v1"
    },
    "schemes": [
        "http",
        "https"
    ]
}
swagger = Swagger(app, template=template)

cors = CORS(app, supports_credentials=True)
app.config['CORS_HEADERS'] = 'Content-Type'

handlers.add_handlers(app)


@app.route('/')
def root():
    return app.send_static_file('index.html')


@app.route('/<path:path>')
def send_js(path):
    # TODO: Fix this properly
    try:
        return send_from_directory(STATIC_PATH, path)
    except Exception as e:
        return app.send_static_file('index.html')


@app.before_request
def before_request():
    """Save time before each request"""
    timestamp = strftime('[%Y-%b-%d %H:%M]')
    g.request_start_time = time.time()
    content_size = request.content_length
    if content_size and content_size > (15 * 1000000):
        logger.error(f'large content size: {request.content_length / 1000000} MB')
    logger.debug(f'time: {timestamp} uri: {request.full_path}')


@app.after_request
def after_request(response):
    """Calculate and log execution time"""
    request_time = time.time() - g.request_start_time

    if not settings.IS_MIX_PANEL:
        time_limit = 0.4
    else:
        time_limit = 1.5

    if '/api' not in request.full_path:
        return response

    if request_time > time_limit:
        slack.client.send(f'PERF time: {"%.5fs" % request_time} uri: {request.full_path} method:{request.method}')
    else:
        logger.info(f'PERF time: {"%.5fs" % request_time} uri: {request.full_path} method:{request.method}')

    return response


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', threaded=False)
