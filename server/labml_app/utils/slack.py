from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from labml_app import settings


class SlackMessage:
    _client: WebClient

    def __init__(self):
        self._client = WebClient(settings.SLACK_BOT_TOKEN)

    def send(self, text):
        res = {'error': '', 'success': False, 'ts': ''}

        if settings.SLACK_BOT_TOKEN and settings.SLACK_CHANNEL:
            try:
                ret = self._client.chat_postMessage(
                    channel=settings.SLACK_CHANNEL,
                    text=text,
                )
                res['ts'] = ret['ts']
                res['success'] = True
            except SlackApiError as e:
                res['error'] = e.response["error"]

        return res


client = SlackMessage()
