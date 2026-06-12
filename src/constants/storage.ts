// 브라우저의 로컬 저장소 (localStorage)와 관련된 고정값들을 모아둔 파일이다.
// 고정값을 한 곳에서 관리하면, 나중에 값을 바꿀 때 이 파일 하나만 수정하면 된다.

// localStorage 키
// localStorage는 브라우저에 데이터를 저장할 때 이름표 (key)와 값 (value)을 쌍으로 저장한다.
// 예 : localStorage.setItem('monomat_guest_session', {"nickname":"홍길동"}')
// 이 이름표 문자열을 코드 여러 곳에 직접 쓰면, 오타가 나도 에러가 발생하지 않아 찾기 어렵다.
// 상수로 정의해두면 오타 시 TypeScript가 즉시 에러를 알려준다.
export const STORAGE_KEYS = {
    GUEST_SESSION: 'monomat_guest_session', // 게스트 세션 정보 저장 키
} as const;

// 세션 만료 기간
// 게스트 유저가 30일 동안 접속하지 않으면 세션을 만료시킨다.
// 밀리초 (ms) 단위로 계산한다. (30일 × 24시간 × 60분 × 60초 × 1000밀리초)
export const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;