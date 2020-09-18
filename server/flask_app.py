import warnings

from time import strftime
from flask import Flask, request
from flask_cors import CORS, cross_origin

from app import handlers
from app import settings
from logs.logger import LOGGER

if settings.SENTRY_DSN:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.flask import FlaskIntegration

        sentry_sdk.init(
            dsn=settings.DSN,
            integrations=[FlaskIntegration()],
            traces_sample_rate=1.0
        )
    except ImportError:
        warnings.warn("Sentry SDK not installed")


def create_app():
    _app = Flask(__name__)

    def run_on_start():
        print('initializing')

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
    pass


@app.before_request
def before_request():
    timestamp = strftime('[%Y-%b-%d %H:%M]')
    LOGGER.info(f'time: {timestamp}, uri: {request.full_path} body: {request.get_data()}')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
