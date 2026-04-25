// 서버와 통신할 때 사용하는 주소 (URL)를 관리한다.
// 개발 환경과 실제 배포 환경의 주소가 다르기 때문에
// .env.development / .env.production 파일에 주소를 따로 저장해두고 여기서 불러온다.

// import.meta.env는 Vite가 제공하는 환경변수 접근 방법이다.
// VITE_WS_URL은 .env 파일에 정의된 WebSocket 서버 주소이다.
const rawWsUrl = import.meta.env.VITE_WS_URL as string | undefined;

// 환경변수가 설정되지 않은 채로 앱이 실행되면 즉시 에러를 발생시킨다.
// 소켓 연결을 시도한 후 실패하는 것보다, 앱 시작 시점에 바로 발견하는 것이 훨씬 좋다.
// 이를 Fail-Fast (빠른 실패) 원칙이라고 한다.
if (!rawWsUrl) {
    throw new Error(
        '[Endpoints] VITE_WS_URL 환경변수가 설정되지 않았습니다.\n' +
        '.env.development 또는 .env.production 파일을 확인해주세요.',
    );
}

// 검증을 통과한 안전한 값만 외부로 내보낸다.
export const WS_ENDPOINT = rawWsUrl;
