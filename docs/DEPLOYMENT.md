# Monomat-FE 개발 배포 가이드

## 1. 목적

이 문서는 Monomat-FE를 개발 및 QA 용도로 배포하기 위한 기준을 정리합니다.

이번 배포는 정식 운영 배포가 아니라, 팀원이 동일한 프론트엔드 주소에서 다음 기능을 실제 백엔드 환경과 연동해 확인하기 위한 개발 배포입니다.

- 회원가입
- 회원 로그인
- 게스트 로그인
- 로비 목록 조회
- WebSocket 연결
- SPA 라우팅
- CORS / Mixed Content 확인

## 2. 배포 방식

개발 배포는 Vercel을 기준으로 진행합니다.

선택 이유는 다음과 같습니다.

- React + Vite 정적 배포가 간단합니다.
- develop 브랜치 기준 Preview/Development 배포를 구성하기 쉽습니다.
- 팀원에게 QA 주소를 공유하기 쉽습니다.
- React Router SPA fallback 설정을 `vercel.json`으로 관리할 수 있습니다.

## 3. 브랜치 기준

개발 배포 기준 브랜치는 `develop`입니다.

```text
main    : 운영 배포 기준 브랜치
develop : 개발/QA 배포 기준 브랜치
feature : 기능 개발 브랜치
```

이슈 작업은 `develop`에서 분기한 뒤 PR을 통해 `develop`으로 병합합니다.

예시:

```bash
git checkout develop
git pull origin develop
git checkout -b deploy/47/frontend-dev-deployment
```

## 4. 필수 환경변수

Vite에서 클라이언트 코드로 노출해야 하는 환경변수는 반드시 `VITE_` prefix를 사용해야 합니다.

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 선택 | REST API 서버 base URL |
| `VITE_WS_URL` | 필수 | SockJS WebSocket endpoint |
| `VITE_ENABLE_MSW` | 선택 | MSW 활성화 여부 |

## 5. 로컬 개발 환경변수 예시

로컬에서 Vite proxy를 사용할 경우 다음처럼 설정합니다.

```dotenv
VITE_API_BASE_URL=
VITE_WS_URL=/ws
VITE_ENABLE_MSW=false
```

이 경우 REST 요청은 같은 origin의 `/api`로 나가고, Vite 개발 서버가 `vite.config.ts`의 proxy 설정에 따라 백엔드 서버로 전달합니다.

현재 로컬 개발 proxy target은 다음과 같습니다.

```text
http://localhost:8080
```

## 6. 개발 배포 환경변수 예시

개발 배포 환경에서는 실제 백엔드 주소를 사용합니다.

```dotenv
VITE_API_BASE_URL=https://개발용-BE-도메인
VITE_WS_URL=https://개발용-BE-도메인/ws
VITE_ENABLE_MSW=false
```

주의사항:

- 실제 서버 IP, 도메인, 인증 정보는 문서나 코드에 직접 커밋하지 않습니다.
- 배포 플랫폼의 Environment Variables에 등록합니다.
- 프론트엔드가 `https`로 배포되면 WebSocket/SockJS endpoint도 `https` 또는 `wss` 계열로 접근 가능해야 합니다.
- `http` 백엔드를 `https` 프론트에서 호출하면 Mixed Content 오류가 발생할 수 있습니다.

## 7. Vercel 설정

### 7.1 Build 설정

Vercel 프로젝트 설정에서 다음 값을 사용합니다.

| 항목 | 값 |
| --- | --- |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 7.2 Environment Variables

Vercel 프로젝트의 Environment Variables에 다음 값을 등록합니다.

```text
VITE_API_BASE_URL
VITE_WS_URL
VITE_ENABLE_MSW
```

개발 배포에서는 `VITE_ENABLE_MSW=false`를 권장합니다.

### 7.3 SPA fallback

React Router를 사용하므로 직접 URL 접근 시 404가 발생하지 않아야 합니다.

이를 위해 루트에 `vercel.json`을 추가합니다.

```json
{
  "rewrites": [
    {
      "source": "/((?!api|ws).*)",
      "destination": "/index.html"
    }
  ]
}
```

확인해야 하는 경로:

```text
/
/lobbies
/lobby/{inviteCode}
```

## 8. 빌드 검증

배포 전 로컬에서 다음 명령어를 실행합니다.

```bash
npm install
npm run lint
npm run build
npm run preview
```

확인 기준:

```text
- npm run lint 통과
- npm run build 통과
- npm run preview 실행 후 화면 진입 가능
- 콘솔에 환경변수 누락 에러 없음
```

## 9. 배포 후 테스트 체크리스트

배포 후 다음 항목을 확인합니다.

### 9.1 기본 화면

- [ ] `/` 접속 확인
- [ ] 새로고침 시 정상 표시 확인
- [ ] 브라우저 콘솔 오류 확인

### 9.2 인증

- [ ] 회원가입 확인
- [ ] 회원가입 성공 후 로그인 화면 이동 확인
- [ ] 회원 로그인 확인
- [ ] 게스트 로그인 확인
- [ ] 로그인 성공 후 `/lobbies` 이동 확인
- [ ] 새로고침 후 세션 유지 확인

### 9.3 로비 목록

- [ ] `/lobbies` 직접 접근 확인
- [ ] 로비 목록 API 호출 확인
- [ ] 검색 조건 변경 시 API 호출 확인
- [ ] 카테고리 변경 시 API 호출 확인
- [ ] 정렬 변경 시 API 호출 확인

### 9.4 WebSocket

- [ ] STOMP WebSocket 연결 확인
- [ ] CONNECT 헤더에 `userIdentifier`가 포함되는지 확인
- [ ] 전체 채팅 구독 확인
- [ ] 연결 실패 시 콘솔 오류 확인

### 9.5 배포 환경 오류

- [ ] CORS 오류 없음
- [ ] Mixed Content 오류 없음
- [ ] `/lobbies` 새로고침 시 404 없음
- [ ] `/lobby/{inviteCode}` 새로고침 시 404 없음

## 10. 제외 범위

이번 이슈에서는 다음 작업을 하지 않습니다.

- 로비 목록 UI 신규 구현
- 로비 생성 기능 구현
- 맵 선택 기능 구현
- 인게임 화면 구현
- 인증/회원가입/로그인 기능 로직 변경
- 백엔드 API 변경
- 운영 배포 자동화 확정

## 11. 문제 발생 시 확인 순서

### 11.1 환경변수 누락

`VITE_WS_URL`이 없으면 앱이 시작 단계에서 에러를 발생시킵니다.

확인할 것:

```text
- Vercel Environment Variables에 VITE_WS_URL 등록 여부
- 로컬 .env.development에 VITE_WS_URL 등록 여부
```

### 11.2 API 호출 실패

확인할 것:

```text
- VITE_API_BASE_URL 값
- 백엔드 서버 실행 상태
- CORS 허용 origin
- Authorization 헤더 포함 여부
```

### 11.3 WebSocket 연결 실패

확인할 것:

```text
- VITE_WS_URL 값
- 백엔드 WebSocket endpoint `/ws`
- HTTPS 환경에서 Mixed Content 발생 여부
- STOMP CONNECT 헤더의 userIdentifier 포함 여부
```

### 11.4 직접 접근 404

확인할 것:

```text
- vercel.json 존재 여부
- /lobbies 직접 접근
- /lobby/{inviteCode} 직접 접근
- Vercel 배포 로그
```
