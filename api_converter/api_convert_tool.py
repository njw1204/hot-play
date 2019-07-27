import lol_api
import pubg_api


def lol_api_menu():
    ERR_MSG = "잘못된 값입니다."
    print("\n[LOL API]")

    print("1. API KEY : 라이엇 개발자 홈페이지에서 발급 받은 API 키를 입력하세요.")
    while True:
        api_key = input(">>> ")
        if not api_key:
            print(ERR_MSG)
            continue
        break

    print("2. region : 변환할 대상 경기가 발생했던 서버의 지역명을 입력하세요.")
    print("지역 목록 :", ", ".join(lol_api.REGIONS), "(kr이 한국 서버)")
    while True:
        region = input(">>> ").lower()
        if region not in lol_api.REGIONS:
            print(ERR_MSG)
            continue
        break

    print("3. match_id : 변환할 대상 경기의 id 값을 입력하세요.")
    while True:
        match_id = input(">>> ")
        if not match_id:
            print(ERR_MSG)
            continue
        break


def pubg_api_menu():
    ERR_MSG = "잘못된 값입니다."
    print("\n[PUBG API]")

    print("1. API KEY : PUBG 개발자 홈페이지에서 발급 받은 API 키를 입력하세요.")
    while True:
        api_key = input(">>> ")
        if not api_key:
            print(ERR_MSG)
            continue
        break

    print("2. shard : 변환할 대상 경기가 발생했던 서버의 플랫폼명을 입력하세요.")
    print("플랫폼 목록 :", ", ".join(pubg_api.SHARDS))
    while True:
        shard = input(">>> ").lower()
        if shard not in pubg_api.SHARDS:
            print(ERR_MSG)
            continue
        break

    print("3. match_id : 변환할 대상 경기의 id 값을 입력하세요.")
    while True:
        match_id = input(">>> ")
        if not match_id:
            print(ERR_MSG)
            continue
        break


if __name__ == "__main__":
    print("[API 통합 컨버터 for HotPlay]")
    print("기존 게임의 API 호출 결과를 HotPlay가 지원하는 형식으로 변환하는 스크립트입니다.")
    print("테스트 용도의 스크립트이며 LOL과 PUBG 변환을 지원합니다.")
    print("이 스크립트는 테스트, 개발 용도로써 사용상 제약이 있을 수 있습니다.")
    print("이 스크립트는 2019-07-31 기준의 API에 맞춰 제작되었습니다.")
    print("LOL, PUBG 이외의 게임은 직접 컨버터를 제작해 사용하셔야 합니다.")

    while True:
        print("\n[메인 메뉴]")
        print("1. LOL")
        print("2. PUBG\n")
        x = input("선택 : ")
        if x == "1" or x.upper() == "LOL":
            lol_api_menu()
        elif x == "2" or x.upper() == "PUBG":
            pubg_api_menu()
