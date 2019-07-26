# This script is for Python 3

import re
import json
import requests
from riotwatcher import RiotWatcher
from lib.game_event import *


def adjustLocation(x, y, mapId):
    after_max_x, after_max_y = 800, 800

    if mapId == 10:
        min_x, min_y = 0, 0
        max_x, max_y = 15398, 15398
    elif mapId == 11:
        min_x, min_y = -120, -120
        max_x, max_y = 14870, 14980
    elif mapId == 12:
        min_x, min_y = -28, -19
        max_x, max_y = 12849, 12858
    else:
        return (x, y)

    x = (x - min_x) / (max_x - min_x) * after_max_x
    y = (y - min_y) / (max_y - min_y) * after_max_y
    return (x, after_max_y - y)


def placeTowers(eventsList):
    global lane_consts, tower_type_consts
    lane_consts = ["TOP_LANE", "MID_LANE", "BOT_LANE"]
    tower_type_consts = ["OUTER_TURRET", "INNER_TURRET", "BASE_TURRET", "NEXUS_TURRET"]

    blue = [(45, 240), (79, 437), (61, 566), (312, 451), (273, 547), (184, 607), (565, 745), (357, 715), (228, 730), (91, 661), (133, 703), (72, 715)]
    red = [(225, 50), (435, 75), (568, 67), (487, 341), (528, 251), (612, 191), (750, 539), (722, 363), (732, 230), (670, 86), (708, 118), (721, 76)]
    total = blue[:-3] + red[:-3]

    for n, tower in enumerate(total):
        lane = lane_consts[n // 3 % 3]
        tower_type = tower_type_consts[n % 3]
        color = "BLUE" if n < len(blue[:-3]) else "RED"
        tint = "0x0088FF" if color == "BLUE" else "0xFF0000"
        eventsList.append(GameEvent("CREATE", 0, {
            "id": color + "_" + lane + "_" + tower_type,
            "x": total[n][0],
            "y": total[n][1],
            "sprite": "tower",
            "tint": tint
        }))

    total = blue[-3:-1] + red[-3:-1]
    for n, tower in enumerate(total):
        lane = lane_consts[1]
        tower_type = tower_type_consts[3]
        color = "BLUE" if n < len(blue[-3:-1]) else "RED"
        tint = "0x0088FF" if color == "BLUE" else "0xFF0000"
        eventsList.append(GameEvent("CREATE", 0, {
            "id": color + "_" + lane + "_" + tower_type + "_%d" % (n % 2 + 1),
            "x": total[n][0],
            "y": total[n][1],
            "sprite": "tower",
            "tint": tint
        }))


def getChampionIdDict():
    # 2019-07-25 기준 챔피언 데이터 사용
    response = requests.get("http://ddragon.leagueoflegends.com/cdn/9.14.1/data/en_US/champion.json")
    json = response.json()
    result = dict()
    for i in json["data"].values():
        result[int(i["key"])] = i["name"]
    return result


def parseBasicGameInfo(match):
    # RIOT Match API 호출
    champion = getChampionIdDict()

    info = dict()
    info["canRevive"] = True
    info["interpolation"] = False
    info["playerScale"] = 0.23
    info["msPerFrame"] = 333

    mapId = match["mapId"]
    if mapId == 10:
        mapName = "Twisted Treeline"
    elif mapId == 11:
        mapName = "Summoner's Rift"
    elif mapId == 12:
        mapName = "Howling Abyss"
    else:
        print("해당 게임에서 사용된 맵은 변환을 지원하지 않습니다.")
        print("이 스크립트는 테스트 용도이므로 지원되지 않는 맵이 존재할 수 있습니다.")
        print("직접 API 형식에 맞춰 컨버팅해주세요.")
        exit()

    info["map"] = mapName

    for i in match["teams"]:
        if i["win"] == "Win":
            info["win"] = ("Blue" if i["teamId"] == 100 else "Red")

    players = dict()

    for i in match["participantIdentities"]:
        players[str(i["participantId"])] = {"name": re.sub("\\s\\s+", " ", i["player"]["summonerName"])}

    for i in match["participants"]:
        p_id = str(i["participantId"])
        players[p_id]["team"] = i["teamId"] // 100
        players[p_id]["character"] = champion[i["championId"]]
        players[p_id]["role"] = i["timeline"]["lane"]

    info["players"] = []
    for k, v in players.items():
        v["id"] = k
        info["players"].append(v)
    return info


def parseTimeline(timeline, mapId):
    events = []
    if mapId == 11:
        placeTowers(events)

    blue_nexus_tower_count = red_nexus_tower_count = 0

    for frame in timeline["frames"]:
        for e in frame["participantFrames"].values():
            try:
                x, y = adjustLocation(e["position"]["x"], e["position"]["y"], mapId)
            except:
                continue
            events.append(GameEvent("MOVE", frame["timestamp"], {
                "id": str(e["participantId"]),
                "x": x,
                "y": y,
                "rank": None,
                "level": e["level"]
            }))
        for e in frame["events"]:
            if e["type"] == "CHAMPION_KILL":
                events.append(GameEvent("KILL", e["timestamp"], {
                    "killerId": str(e["killerId"]),
                    "victimId": str(e["victimId"]),
                    "assistIds": list(map(str, e["assistingParticipantIds"]))
                }))
            elif e["type"] == "BUILDING_KILL" and e["buildingType"] == "TOWER_BUILDING" and e["towerType"] in tower_type_consts and mapId == 11:
                color = "BLUE" if e["teamId"] == 100 else "RED"
                towerType = e["towerType"]

                if towerType == tower_type_consts[3]:
                    if color == "BLUE":
                        blue_nexus_tower_count += 1
                        towerType += "_" + str(blue_nexus_tower_count)
                    else:
                        red_nexus_tower_count += 1
                        towerType += "_" + str(red_nexus_tower_count)

                events.append(GameEvent("REMOVE", e["timestamp"], {
                    "id": color + "_" + e["laneType"] + "_" + towerType
                }))

    events.sort()
    return events


if __name__ == "__main__":
    placeTowers([])
    watcher = RiotWatcher("RGAPI-0dada0be-ba4a-4b5e-b550-d65feb1c7cba")
    region = "kr"
    # match_id = "3771161918"
    match_id = "3749533516"
    match = watcher.match.by_id(region, match_id)
    timeline = watcher.match.timeline_by_match(region, match_id)
    replay = {"info": parseBasicGameInfo(match), "timeline": parseTimeline(timeline, match["mapId"])}
    result = json.dumps(replay, cls=GameEventJSONEncoder)
    with open("lol_output.json", "w", encoding="utf-8") as f:
        f.write(result)
    print("Complete!")
