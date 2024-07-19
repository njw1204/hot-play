# HotPlay - Universal Game Replay Module
![HotPlay](https://user-images.githubusercontent.com/38099251/63399491-a85f1a00-c40b-11e9-8928-ff53e692dc2a.png)

HotPlay는 LOL, PUBG 등 각종 게임의 replay를 브라우저에서 감상할 수 있게 만드는 프로젝트입니다. 어느 게임이든지 상관없이 저희의 통합 파일으로 변환만 하고 API 호출을 하면 리플레이를 볼 수 있는 웹 페이지를 내려줍니다. 범용성 있는 게임 지원에 중점을 두어 개발했습니다.

## 시작하기
1. `npm install` 명령어로 패키지를 설치하세요.
2. `npm start` 명령어로 서버를 실행하세요.
3. `http://127.0.0.1:3000`으로 브라우저에서 접속하세요.
   - Watch Replay 버튼을 클릭하고 HotPlay 전용 replay 파일(JSON 확장자)을 업로드 하면 리플레이를 볼 수 있습니다.
   - 리플레이 테스트 용도로는 `sample_dataset` 폴더에 있는 파일을 업로드하면 괜찮습니다.
   - API 메뉴를 선택하면 Swagger UI를 통해 API 형식을 파악하고 테스트할 수 있습니다.

## 스크린샷
### 1) PUBG
![screenshot 1](https://user-images.githubusercontent.com/38099251/63531753-28889b00-c544-11e9-878f-a13d028339cb.png)
### 2) LOL
![screenshot 2](https://user-images.githubusercontent.com/38099251/63531605-d2b3f300-c543-11e9-9531-49158e0667ba.png)

## HotPlay 전용 replay 파일에 대해
HotPlay는 범용성 있는 replay 지원을 위해 HotPlay 전용 replay 파일(JSON 확장자)을 사용합니다. 기존 게임의 replay를 HotPlay 전용 파일로 변환해서 사용하면 됩니다. 어느 게임이든지 쉽게 변환할 수 있도록 스키마를 설계했습니다.

- `api-converter/api_convert_tool.py`를 통해 LOL과 PUBG의 replay를 HotPlay 전용 파일로 변환할 수 있습니다.
- 그 외의 게임은 리플레이 스키마에 맞춰 변환기를 제작해서 사용하시면 됩니다.
- HotPlay 전용 replay 파일의 스키마는 Swagger UI를 통해 제공하고 있습니다.

## 디렉토리별 설명
### 1. api_converter
LOL과 PUBG의 리플레이 API 호출 결과를 HotPlay 전용 replay 파일으로 변환하는 파이썬 스크립트가 담겨있습니다. 설계 목적상으로는 컨버팅은 사용자의 몫이지만, 테스트를 돕기 위해 간단히 스크립트를 작성했습니다. `requirements.txt` 설치 후 사용해주세요.

**사용법** : `api-converter/api_convert_tool.py`를 Python 3으로 실행한 후 요구하는 입력값을 넣으면 HotPlay 통합 JSON 파일이 생성됩니다.

### 2. public
HotPlay 웹 페이지에서 이용하는 정적 파일(assets, css, js)이 담겨있습니다.

### 3. sample_dataset
이곳에는 샘플 목적인 HotPlay 전용 replay 파일들이 포함되어 있습니다. 샘플 데이터들로 리플레이가 잘 나오는지 테스트할 수 있습니다. `sample_dataset/error_testset`에는 형식이 잘못된 데이터들이 있습니다. 서버가 오류 처리를 제대로 하는지 테스트해볼 수 있습니다.

### 4. swagger
HotPlay API를 Swagger(OpenAPI) 형식으로 작성한 파일이 포함되어 있습니다. 이 파일을 이용해 Swagger UI가 구성되고 데이터 검증 및 오류 처리에 사용됩니다.

### 5. tools
프로젝트 개발 과정에서 사용하기 위해 제작한 간단한 툴이 포함되어 있습니다.

### 6. views
웹 페이지 템플릿 파일(ejs 형식)이 포함되어 있습니다.

## 사용한 오픈소스
- 프론트엔드 : vue, vue-slider-component, pixi.js, pixi-filters, howler, purecss, particles.js, font-awesome
- 백엔드 : node.js, express, ejs, api-schema-builder, compression, cors, helmet, http-status, morgan, swagger-ui-express
- 스크립트 : pubg-python, riotwatcher, beautifulsoup

## 지적재산권
이 프로젝트에서는 LOL과 PUBG의 지적재산권(Intellectual Property)을 사용하고 있습니다. Riot Games의 [Legal Jibber Jabber](https://www.riotgames.com/en/legal), PUBG의 [Player-created Content](https://www.pubg.com/player-created-content/) 약관을 따르고 있으며, 비상업적 목적으로 사용하고 있습니다.
