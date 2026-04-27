// 게임 로비 (대기방)와 관련된 타입을 정의한다.
// DB의 GAME_LOBBY 테이블 구조를 기반으로 한다.

// 로비의 현재 상태를 정의한다.
// DBD의 GAME_LOBBY 테이블 status 컬럼과 동일한 값을 사용한다.
export type LobbyStatus =
    | 'WAITING'  // 게임 시작 전 대기 중인 상태
    | 'PLAYING'  // 게임이 진행 중인 상태
    | 'RESULT';  // 게임이 끝나고 결과를 보여주는 상태
                 // (기능명세서: 게임 종료 후 로비로 복귀 시 RESULT 상태로 UI 렌더링)

// 로비 하나의 구조를 정의한다.
// 로비 목록 조회 및 로비 입장 시 서버로부터 이 구조의 데이터를 받는다.
export interface Lobby {
    // 로비 고유 번호
    id: number;

    // 로비 이름 : 방장이 로비를 만들 때 설정
    name: string;

    // 방장의 닉네임
    hostNickname: string;

    // 현재 로비에 참여 중인 인원 수
    currentPlayers: number;

    // 로비에 참여할 수 있는 최대 인원 수
    maxPlayers: number;

    // 로비의 현재 상태
    status: LobbyStatus;

    // 비공개 여부
    // true이면 로비 목록에 표시되지 않고, 초대 코드로만 입장할 수 있다.
    isPrivate: boolean;

    // 로비 입장에 사용하는 6자리 고유 초대 코드
    // 예: 'ABC123' → 입장 URL: /lobby/ABC123
    inviteCode: string;

    // 선택된 퀴즈 맵의 이름
    // 방장이 아직 맵을 선택하지 않은 경우 null
    mapTitle: string | null;
}