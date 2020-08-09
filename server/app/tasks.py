from concurrent.futures.thread import ThreadPoolExecutor

from app.runs import Run
from app.slack.message import SlackMessage

EXECUTOR = ThreadPoolExecutor(5)


def task_post_slack_message(msg: SlackMessage, channel: str, run: Run):
    msg.post_to_channel(channel, run)


def post_slack_message(msg: SlackMessage, channel: str, run: Run):
    global EXECUTOR
    future = EXECUTOR.submit(task_post_slack_message, msg, channel, run)
