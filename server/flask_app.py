from flask import Flask
from flask_cors import CORS, cross_origin

from app import handlers


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


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
