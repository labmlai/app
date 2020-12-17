import logging
import git
import time
import warnings
from time import strftime

from flask import Flask, request, make_response, redirect, g
from flask_cors import CORS, cross_origin

from app import handlers
from app import settings
from app.logging import logger
from app.utils.mix_panel import MixPanelThread

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


def create_app():
    # disable flask logger
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)

    _app = Flask(__name__)

    def run_on_start():
        repo = git.Repo(search_parent_directories=True)
        sha = repo.head.object.hexsha

        if settings.IS_MIX_PANEL:
            mp_tread = MixPanelThread()
            mp_tread.start()

        logger.info('initializing app')
        logger.error(f'THIS IS NOT AN ERROR: Server Deployed SHA : {sha}')

    run_on_start()

    return _app


app = create_app()

cors = CORS(app, supports_credentials=True)
app.config['CORS_HEADERS'] = 'Content-Type'

handlers.add_handlers(app)


@cross_origin()
@app.route('/<path:path>')
def not_found(path):
    return make_response(redirect(settings.WEB_URL))


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

    if request_time > time_limit:
        logger.error(f'method:{request.method} uri: {request.full_path} request_time: {"%.5fs" % request_time}')
    else:
        logger.info(f'method:{request.method} uri: {request.full_path} request_time: {"%.5fs" % request_time}')

    return response


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', threaded=False)
