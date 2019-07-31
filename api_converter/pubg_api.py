# This script is for Python 3

import os
import re
import json
import dateutil.parser
from pubg_python import PUBG, Shard
from lib.game_event import *


SHARDS = {
    "STEAM": Shard.STEAM,
    "KAKAO": Shard.KAKAO,
    "XBOX": Shard.XBOX,
    "PSN": Shard.PSN
}


MAP_SIZES = {
    "Erangel_Main": 816000,
    "Desert_Main": 816000,
    "Savage_Main": 408000,
    "DihorOtok_Main": 612000,
}


def ISODate2MicroTimestamp(datestring):
    return int(dateutil.parser.parse(datestring).timestamp() * 1000)


def relativeTimestamp(start_timestamp, datestring):
    return ISODate2MicroTimestamp(datestring) - start_timestamp


def adjustLocation(x, y, map_name):
    after_max_x, after_max_y = 800, 800
    x = x / MAP_SIZES[map_name] * after_max_x
    y = y / MAP_SIZES[map_name] * after_max_y
    return (x, y)


def start_convert(api_key, shard, match_id):
    print("변환을 시작합니다. 잠시 기다려주세요...")

    api = PUBG(api_key, shard)
    match = api.matches().get(match_id)
    telemetry = api.telemetry(match.assets[0].url)
    replay = dict()

    map_name = match.map_name
    # Erangel remake map (future update)
    if map_name == "Baltic_Main":
        map_name = "Erangel_Main"

    winners = []
    for roster in match.rosters:
        for player in roster.participants:
            if player.stats["winPlace"] == 1:
                winners.append(player.stats["name"])

    info = {
        "canRevive": False,
        "interpolation": True,
        "playerScale": 0.33,
        "speed": 10,
        "map": map_name,
        "win": ", ".join(winners),
        "sortPlayerList": True,
        "teamVS": False
    }
    replay["info"] = info

    player_kill_events = telemetry.events_from_type("LogPlayerKill")
    player_position_events = telemetry.events_from_type("LogPlayerPosition")
    player_creation_events = telemetry.events_from_type("LogPlayerCreate")
    package_events = telemetry.events_from_type("LogCarePackageLand")
    start_event = telemetry.events_from_type("LogMatchStart")[0]
    state_events = telemetry.events_from_type("LogGameStatePeriodic")
    gamestart_timestamp = ISODate2MicroTimestamp(start_event.timestamp)

    id_dict = dict()
    players = []
    for ev in player_creation_events:
        user = ev.character
        id_dict[user.account_id] = str(len(id_dict) + 1)
        players.append({
            "name": re.sub("\\s\\s+", " ", user.name),
            "team": user.team_id,
            "id": id_dict[user.account_id]
        })
    info["players"] = players

    events = []

    for i in state_events:
        state = i.game_state
        timestamp = relativeTimestamp(gamestart_timestamp, i.timestamp)

        if state.safety_zone_radius > 0:
            location = adjustLocation(state.safety_zone_position["x"], state.safety_zone_position["y"], map_name)
            events.append(GameEvent("CIRCLE_ON", timestamp, {
                    "id": "S_ZONE",
                    "x": location[0],
                    "y": location[1],
                    "radius": adjustLocation(state.safety_zone_radius, 0, map_name)[0],
                    "color": "0x0055FF"
            }))

        if state.poison_gas_warning_radius > 0:
            location = adjustLocation(state.poison_gas_warning_position["x"], state.poison_gas_warning_position["y"], map_name)
            events.append(GameEvent("CIRCLE_ON", timestamp, {
                    "id": "W_ZONE",
                    "x": location[0],
                    "y": location[1],
                    "radius": adjustLocation(state.poison_gas_warning_radius, 0, map_name)[0],
                    "color": "0xFFFFFF"
            }))

    for n, i in enumerate(package_events):
        location = adjustLocation(i.item_package.location.x, i.item_package.location.y, map_name)
        timestamp = relativeTimestamp(gamestart_timestamp, i.timestamp)
        events.append(GameEvent("CREATE", timestamp, {
                "id": "PACKAGE_%d" % (n + 1),
                "x": location[0],
                "y": location[1],
                "sprite": "package",
        }))

    for i in player_position_events:
        user = i.character
        location = adjustLocation(user.location.x, user.location.y, map_name)
        timestamp = relativeTimestamp(gamestart_timestamp, i.timestamp)
        if timestamp < 0:
            continue

        events.append(GameEvent("MOVE", timestamp, {
            "id": id_dict[user.account_id],
            "x": location[0],
            "y": location[1],
            "rank": user.ranking,
        }))

    for i in player_kill_events:
        try:
            timestamp = relativeTimestamp(gamestart_timestamp, i.timestamp)
            killer = id_dict.get(i.killer.account_id, None)
            try:
                assists = [id_dict[i._data.store["assistant"]["accountId"]]] if "assistant" in i._data.store else []
            except:
                assists = []

            gev = GameEvent("KILL", timestamp, {
                "victimId": id_dict[i.victim.account_id]
            })
            if killer is not None:
                gev.data["killerId"] = killer
                if assists == [killer]:
                    assists = []
            gev.data["assistIds"] = assists
            events.append(gev)
        except: pass

    events.sort()
    replay["timeline"] = events
    result = json.dumps(replay, cls=GameEventJSONEncoder)
    output_file = "pubg_output.json"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(result)
    print("===========================================")
    print("Complete!", os.path.abspath(output_file), "에 저장되었습니다.")
