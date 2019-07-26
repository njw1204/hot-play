# This script is for Python 3

import json


class GameEvent(object):
    def __init__(self, event, timestamp, data=None):
        self.event = event
        self.timestamp = timestamp
        self.data = data

    def toDict(self):
        return {
            "type": self.event,
            "data": self.data,
            "time": self.timestamp
        }

    def __repr__(self):
        return str(self.toDict())

    def __lt__(self, other):
        return (self.timestamp < other.timestamp)


class GameEventJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, GameEvent):
            return o.toDict()
        else:
            return super.default()
