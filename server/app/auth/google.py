from google.oauth2 import id_token
from google.auth.transport import requests

from .. import users
from .. import settings


def sign_in(token: str):
    try:
        id_info = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)

        sub = id_info.get('sub', '')
        name = id_info.get('name', '')
        email = id_info.get('email', '')

        google_info = users.GoogleInfo(sub=sub, email=email, name=name)
        user = users.get_or_create_google_user(google_info)

        return user
    except ValueError:
        pass
