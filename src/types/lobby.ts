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
// BE API 응답 스키마 기준 (GET /api/lobbies)
export interface Lobby {
    code: string;       // 로비 초대 코드 (6자리)
    hostId: string;     // 방장 사용자 식별자
    title: string;      // 로비 제목
    mapId: number | null; // 선택된 맵 ID (미선택 시 null)
    maxPlayers: number; // 최대 참여 인원
    isPrivate: boolean; // 비공개 여부
    status: 'WAITING' | 'PLAYING'; // 로비 상태
}