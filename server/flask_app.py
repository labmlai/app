import warnings
import logging

from time import strftime
from flask import Flask, request, make_response, redirect
from flask_cors import CORS, cross_origin

from app import handlers
from app import settings
from app.logs.logger import LOGGER

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
        LOGGER.info('initializing app')

    run_on_start()

    return _app


app = create_app()

cors = CORS(app, supports_credentials=True)
app.config['CORS_HEADERS'] = 'Content-Type'

handlers.add_handlers(app)


@cross_origin()
@app.route('/', defaults={'path': '', 'handler': ''})
@app.route('/<handler>/<path:path>')
def rest(handler, path):
    return make_response(redirect(settings.WEB_URL))


@app.before_request
def before_request():
    timestamp = strftime('[%Y-%b-%d %H:%M]')
    LOGGER.debug(f'time: {timestamp}, uri: {request.full_path} body: {request.get_data()}')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
