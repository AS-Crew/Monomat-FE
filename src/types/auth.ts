// 인증 (로그인)과 관련된 타입 (데이터 구조)을 정의한다.
// TypeScript의 타입은 "이 데이터는 어떤 모양이어야 한다"는 약속이다.
// 타입을 미리 정의해두면 잘못된 구조의 데이터를 사용할 때 코드 작성 시점에 바로 에러가 난다.

// 사용자 종류를 정의한다.
// DB의 user 테이블 user_type 컬럼과 동일한 값을 사용한다.
// REGISTERED : 아이디/비밀번호로 가입한 정식 회원
// GUEST : 닉네임만 입력하고 바로 참여한 게스트
export type UserType = 'REGISTERED' | 'GUEST';

// 게스트 세션 데이터의 구조를 정의한다.
// 게스트가 브라우저를 닫았다가 다시 열어도 닉네임이 유지되도록 localStorge에 이 구조로 저장한다.
export interface GuestSession {
    // 게스트를 식별하는 고유 ID이다. (예: '550e8400-e29b-41d4-a716-446655440000')
    // UUID (Universally Unique Identifier) 형식으로, 전 세계에서 중복될 확률이 거의 없다.
    uuid: string;

    // 게임에서 표시되는 닉네임이다. (1~12자)
    nickname: string;

    // 세션이 처음 만들어진 시각이다. (밀리초 단위 Unix 타임스탬프)
    // 현재 시각과 비교해서 30일이 지나면 세션을 만료시키는 데 사용한다.
    createdAt: number;
}