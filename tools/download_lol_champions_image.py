import os
import urllib.request
from urllib.parse import unquote
from bs4 import BeautifulSoup

print("이 스크립트는 크롤링을 통해 롤 챔피언 이미지를 모두 다운로드합니다.")
print("2019-07-25 기준의 웹 페이지에 맞춰 스크립트가 작성되어 있습니다.")
print("\nConnecting to wiki..")
res = urllib.request.urlopen("https://leagueoflegends.fandom.com/wiki/Champion")
soup = BeautifulSoup(res.read().decode(), "html.parser")

download_dir = "champions"
if not os.path.exists(download_dir):
    os.mkdir(download_dir)

ol = soup.select_one(".champion_roster")
imgs = list(filter(lambda x: ".png" in x["src"], ol.select("img")))
for n, img in enumerate(imgs):
    url = img["src"].split(".png")[0] + ".png"
    image_name = unquote(url.split("/")[-1].replace("_OriginalCircle", "").replace("_", " "))
    urllib.request.urlretrieve(url, os.path.join(download_dir, image_name))
    print(img["src"].split(".png")[0] + ".png", "==>", image_name, "(%d/%d)" % (n + 1, len(imgs)))

print("\n[NOTICE]")
print("THE IMAGES ARE COPYRIGHTED TO RIOT GAMES INC.")
print("HOWEVER: Riot Games allows use of their League of Legends intellectual property when meeting the conditions lined in their Legal Jibber-Jabber policy.")
print("\nComplete!")
print(download_dir, "폴더(경로)에 저장되었습니다.")
