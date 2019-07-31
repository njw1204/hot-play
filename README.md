# HotPlay
https://hotplay.njw.kr

HotPlay는 LOL, PUBG 등 각종 게임의 replay를 통합 포맷으로 컨버팅하여 브라우저에서 감상할 수 있게 하는 프로젝트입니다. 어느 게임이든지 상관없이 저희 통합 포맷으로 변환만 하고 저희 API 호출을 하면 리플레이를 볼 수 있는 웹 페이지를 내려줍니다. 프론트엔드에는 Vue, pixi.js 등의 기술이 쓰였고 백엔드에는 node.js, express, swagger 등의 기술이 쓰였습니다.

## 시작하기
설치할 필요 없이 https://hotplay.njw.kr 을 이용하셔도 됩니다.
1. `npm install`
2. `npm start`
3. `http://127.0.0.1:3000`으로 접속
4. 메인에서 Watch Replay 버튼을 클릭하고 HotPlay 통합 포맷(JSON 파일)을 올리면 리플레이를 볼 수 있습니다.
5. 메인에서 API 메뉴를 선택한다면 Swagger UI를 통해 API 형식을 파악하고 테스트할 수 있습니다.

## 디렉토리별 설명
### 1. api_converter
LOL과 PUBG의 리플레이 API 호출 결과를 HotPlay 통합 포맷으로 변환하는 파이썬 스크립트가 담겨있습니다. 원래 컨버팅은 사용자의 몫이지만, 테스트를 돕기 위해 간단히 스크립트를 작성했습니다. `Python 3` 및 `requirements.txt` 설치 후 사용해주세요.

**사용법** : `api-converter/api_convert_tool.py`를 Python 3으로 실행한 후 요구하는 입력값을 넣으면 HotPlay 통합 JSON 파일이 생성됩니다.

### 2. public
HotPlay 웹 페이지에서 이용하는 정적 파일(assets, css, js)이 담겨있습니다.

### 3. sample_dataset
이곳에는 이미 HotPlay 통합 포맷으로 변환된 샘플 데이터들이 포함되어 있습니다. 샘플 데이터들로 리플레이가 잘 나오는지 테스트해봐도 좋습니다. `sample_dataset/error_testset`에는 형식이 잘못된 데이터들이 있습니다. 서버가 오류 처리를 제대로 하는지 테스트해볼 수 있습니다.

### 4. swagger
HotPlay API를 Swagger(OpenAPI) 형식으로 작성한 파일이 포함되어 있습니다. 이 파일을 이용해 Swagger UI가 구성되고 데이터 검증 및 오류 처리에 사용됩니다.

### 5. tools
프로젝트 개발 과정에서 사용하기 위해 제작한 간단한 툴이 포함되어 있습니다.

### 6. views
웹 페이지 템플릿 파일(ejs 형식)이 포함되어 있습니다.
