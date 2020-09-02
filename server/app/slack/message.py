import re
import math

from typing import Dict

from labml.logger import inspect
from slack import WebClient
from slack.errors import SlackApiError

from app.runs import Run
from .. import settings

IS_DEBUG = False


def number_with_commas(x: str):
    parts = x.split('.')
    parts[0] = re.sub(r'/\B(?=(\d{3}) + (?!\d))/g', ',', parts[0])

    return '.'.join(parts)


def format_scalar(value: int):
    string = str(round(value, 2))

    return number_with_commas(string)


def format_int(value: int):
    string = str(value)

    return number_with_commas(string)


def format_value(value: any):
    if isinstance(value, bool):
        return str(value)
    elif isinstance(value, (int, float)):
        if value - math.floor(value) < 1e-9:
            return format_int(value)
        else:
            return format_scalar(value)
    elif isinstance(value, str):
        return value
    elif isinstance(value, list):
        s = '['
        for i in range(len(value)):
            if i > 0:
                s += ', '
            s += format_value(value[i])
        s += ']'
        return s
    else:
        return f'{value}'


def gen_key_value_mrkdwn(values: Dict[str, any]):
    lines = []

    keys = sorted(values.keys())
    for key in keys:
        lines.append(f'{key} = `{format_value(values[key])}`')

    return '\n'.join(lines)


def compile_iter_message(run: Run):
    text = ''
    text = f"*{format_int(run.step)}*\n"

    track = {k: s.last_value for k, s in run.tracking.items()}
    text += gen_key_value_mrkdwn(track)
    return [{
        'type': 'section',
        'text': {'type': 'mrkdwn', 'text': text}
    }]


def compile_init_message(run_uuid: str, name: str, comment: str):
    text = f':microscope: *{name}*\n'
    if comment.strip():
        text += f'_{comment}_\n'

    blocks = [{
        'type': 'section',
        'text': {'type': 'mrkdwn', 'text': text}
    }, {
        'type': 'context',
        'elements': [{'type': 'mrkdwn', 'text': f':pushpin: {run_uuid}'}]
    },
        {
            'type': 'context',
            'elements': [{'type': 'mrkdwn',
                          'text': f':chart_with_upwards_trend: view run at {settings.WEB_URL}/run/?run_uuid={run_uuid}'}]
        }]

    return blocks


def compile_status_message(status: str, details: str, end_date: str, end_time: str):
    if 'completed' == status:
        emoji = ':white_check_mark: :white_check_mark: :white_check_mark:'
    elif 'crashed' == status:
        emoji = ':x: :x: :x:'
    else:
        emoji = ':warning: :warning: :warning:'

    blocks = [{
        'type': 'section',
        'text': {'type': 'mrkdwn',
                 'text': f'* Experiment {status} on {end_date} {end_time}* {emoji}'}
    }] + ([{
        'type': 'context',
        'elements': [{'type': 'mrkdwn', 'text': f'{details}'}]
    }] if details else [])

    return blocks


SLACK_ERRORS = {
    'not_in_channel': 'The LabML bot is not added to the channel you provided. '
                      'Please add the bot to channel by entering the '
                      'command "/invite @LabML" in the slack channel'
}

_CLIENTS: Dict[str, WebClient] = {}


def _get_client(token):
    global _CLIENTS

    if token not in _CLIENTS:
        _CLIENTS[token] = WebClient(token=token)

    return _CLIENTS[token]


class SlackMessage:
    _client: WebClient

    def __init__(self, slack_token: str):
        self._client = _get_client(slack_token)

    def send_init_message(self, channel: str, run: Run):
        blocks = compile_init_message(run.run_uuid, run.name, run.comment)
        notification = f"Experiment {run.name} has started"

        return self.send_message(channel, run, notification, blocks)

    def send_status_message(self, channel: str, run: Run):
        status = run.status
        blocks = compile_status_message(status['status'], status['details'], status['date'], status['time'])
        notification = f"Status update from experiment {run.name}"

        return self.send_message(channel, run, notification, blocks)

    def send_message(self, channel: str, run: Run, notification, blocks):
        res = {'error': '', 'success': False, 'ts': ''}

        if IS_DEBUG:
            res['ts'] = '1'
            res['success'] = True
            inspect(blocks)
        else:
            try:
                ret = self._client.chat_postMessage(
                    channel=channel,
                    text=notification,
                    blocks=blocks,
                    thread_ts=run.slack_thread_ts
                )
                res['ts'] = ret['ts']
                res['success'] = True
            except SlackApiError as e:
                res['error'] = e.response["error"]

        return res

    def upload_file(self, channel: str, run: Run, file_path: str, title: str):
        res = {'error': '', 'success': False, 'ts': ''}

        try:
            ret = self._client.files_upload(
                channels=channel,
                file=file_path,
                filetype='png',
                title=title,
                thread_ts=run.slack_thread_ts
            )
            res['file_id'] = ret['file']['id']
            res['success'] = True
        except SlackApiError as e:
            res['error'] = e.response["error"]

        return res

    def delete_file(self, file_id: str):
        res = {'error': '', 'success': False, 'ts': ''}

        try:
            self._client.files_delete(
                file=file_id
            )
            res['success'] = True
        except SlackApiError as e:
            res['error'] = e.response["error"]

        return res

    @staticmethod
    def _collect_errors(res: Dict[str, str], run: Run):
        if not res['success']:
            err = res['err']
            run.errors.append({'error': err,
                               'message': SLACK_ERRORS.get(err, err)})

    def post_to_channel(self, channel: str, run: Run):
        if run.slack_thread_ts:
            progress_image = run.get_progress_image()
            if not progress_image:
                return
            res = self.upload_file(channel, run, progress_image, f'step: {run.step :,}')
            self._collect_errors(res, run)

            if run.file_id:
                del_res = self.delete_file(run.file_id)
                self._collect_errors(del_res, run)

            if run.status:
                res_status = self.send_status_message(channel, run)
                self._collect_errors(res_status, run)

            run.file_id = res.get('file_id', '')
        else:
            res = self.send_init_message(channel, run)
            self._collect_errors(res, run)
            if not res['success']:
                return

            run.slack_thread_ts = res['ts']
            run.save()

            intro_image = run.get_intro_image()
            if not intro_image:
                return

            self.upload_file(channel, run, intro_image, 'experiment configs')
