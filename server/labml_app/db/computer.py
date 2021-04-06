from typing import List

from labml_db import Model, Index


class Computer(Model['Computer']):
    computer_uuid: str
    sessions: List[str]

    @classmethod
    def defaults(cls):
        return dict(computer_uuid='',
                    sessions=[],
                    )

    def get_sessions(self) -> List[str]:
        return self.sessions

    def get_data(self):
        return {
            'computer_uuid': self.computer_uuid,
            'sessions': self.sessions
        }


class ComputerIndex(Index['Computer']):
    pass


def get_or_create(computer_uuid: str) -> Computer:
    computer_key = ComputerIndex.get(computer_uuid)

    if not computer_key:
        computer = Computer(computer_uuid=computer_uuid,
                            )
        computer.save()
        ComputerIndex.set(computer_uuid, computer.key)

        return computer

    return computer_key.load()


def add_session(computer_uuid: str, session_uuid: str) -> None:
    c = get_or_create(computer_uuid)

    c.sessions.append(session_uuid)
    c.save()
