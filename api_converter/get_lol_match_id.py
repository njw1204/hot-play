from riotwatcher import RiotWatcher

REGIONS = ["KR", "RU", "BR1", "OC1", "JP1", "NA1", "EUN1", "EUW1", "TR1", "LA1", "LA2"]


if __name__ == "__main__":
    watcher = RiotWatcher(input("API KEY : "))
    region = input("region [" + ", ".join(REGIONS) + "] : ")
    summoner = input("summoner name (소환사 이름, 닉네임) : ")
    me = watcher.summoner.by_name(region, summoner)
    print("===================")
    for n, item in enumerate(watcher.match.matchlist_by_account(region, me["accountId"])["matches"]):
        print(item["gameId"])
    print("===================")
    print("match id list. pick the one you want!")
