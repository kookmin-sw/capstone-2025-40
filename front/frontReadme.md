### 프로젝트 모듈 다운 명령어

npm install --legacy-peer-deps

### 로컬 프로젝트 실행

npm start

### 배포용 로컬 앱 실행

    1. npm run build
    2. serve -s build

### firebase 배포 (다른 사용자가 배포하려고 하면 권한 설정이 필요함, 나한테 문의)

    1. rm -rf build (빌드 폴더 삭제)
    2. npm run build (빌드 폴더 생성)
    3. firebase deploy (파이어베이스 배포)

### 테스트용 호스팅 url: https://greenday-8d0a5.web.app/

### App.js

    - 앱 최상단 컴포넌트
    - 각 화면들의 route 연결 및 path 생성

### 컴포넌트 설명 (/src/components/)

    * InstallPrompt: 앱 설치 화면
        - InstallPrompt.js
        - InstallPrompt.module.css

    * Login: 로그인 화면
        - Login.js
        - Login.module.css

    * Find: 아이디/비밀번호 찾기 화면
        - FindId.js (아이디 찾기)
        - FindPassword.js (비밀번호 찾기)
        - Find.module.css (아이디/비밀번호 찾기 css)

    * Signup: 회원가입 화면
        - Signup.js
        - Signup.module.css

    * Main: 메인 화면 (앱바, 하단 네비게이터, 네비게이터에 해당하는 화면 연결)
        - Main.js
        - Main.module.css

    * Home: 홈 화면
        - Home.js
        - Home.module.css

    * Challenge: 챌린지 화면
        - Challenge.js
        - Challenge.module.css
        - ChallengeModal.js (챌린지 팝업창 컴포넌트)
        - ChallengeModal.module.css (챌린지 팝업창 css)

    * Community: 커뮤니티 화면 (메인 리스트 화면)
        - Community.js
        - Community.module.css

    * PostDetail: 커뮤니티 글 상세 화면
        - PostDetail.js
        - PostDetail.module.css

    * MyPosts: 내 게시글 화면
        - MyPosts.js
        - MyPosts.module.css

    * PostCreate: 글 작성 화면
        - PostCreate.js
        - PostCreate.module.css

    * Profile: 프로필 화면
        - Profile.js
        - Profile.module.css
