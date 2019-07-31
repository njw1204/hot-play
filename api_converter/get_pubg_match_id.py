from pubg_python import PUBG, Shard


SHARDS = {
    "STEAM": Shard.STEAM,
    "KAKAO": Shard.KAKAO,
    "XBOX": Shard.XBOX,
    "PSN": Shard.PSN
}


if __name__ == "__main__":
    api = PUBG(
        input("API KEY : "),
        SHARDS[input("platform [" + ", ".join(SHARDS.keys()) + "] : ").upper()]
    )

    sel = input("\n[menu]\n1. get random sample matches\n2. get matches by player name\n>>> ")
    if sel == "1":
        sample = api.samples().get()
        print("===================")
        for match in sample.matches:
            print(match.id)
        print("===================")
        print("match id list. pick the one you want!")
    elif sel == "2":
        players = api.players().filter(player_names=[input("player name : ")])
        print("===================")
        for player in players:
            for match in player.matches:
                print(match.id)
        print("===================")
        print("match id list. pick the one you want!")
