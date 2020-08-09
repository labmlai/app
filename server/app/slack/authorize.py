import requests

from .. import settings

SERVER = 'https://slack.com'
SCOPE = 'chat:write,files:write,channels:join'


def gen_authorize_uri(state: str):
    client_id = settings.SLACK_CLIENT_ID
    redirect_uri = f"{settings.SERVER_URL}/api/v1/auth/redirect"

    return f'{SERVER}/oauth/v2/authorize?' \
           f'scope={SCOPE}&' \
           f'client_id={client_id}&' \
           f'redirect_uri={redirect_uri}&' \
           f'state={state}'


def get_access_token(code: str):
    client_id = settings.SLACK_CLIENT_ID
    client_secret = settings.SLACK_CLIENT_SECRET

    payload = {'code': code, 'client_id': client_id, 'client_secret': client_secret}
    res = requests.get(url=f'{SERVER}/api/oauth.v2.access', params=payload,
                       headers={'content-type': 'application/x-www-form-urlencoded;charset=utf-8'})

    return res.json()
