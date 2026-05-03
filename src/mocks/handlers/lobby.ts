/**
 * GET /api/lobbies 요청을 가로채서 Mock 응답을 반환하는 MSW 핸들러
 */

// MSW 라이브러리에서 HTTP 요청을 처리할 'http' 객체와 응답을 생성한 'HttpResponse' 객체를 불러온다.
import { http, HttpResponse } from 'msw';
// API 응답으로 내려줄 Mock 로비 데이터 배열을 로컬 경로에서 불러온다.
import { mockLobbies } from '../data/lobbies';

// worker.ts나 server.ts에서 등록할 수 있도록 핸들러들을 배열 형태로 내보낸다. (export)
export const lobbyHandlers = [
    // 클라이언트가 GET 메서드로 '/api/lobbies' 엔드포인트에 요청을 보낼 때 이를 가로챈다.
    http.get('/api/lobbies', () => {
        // HTTP 200 (성공) 상태 코드와 함께 불러온 mockLobbies 데이터를 JSON 형태로 반환한다.
        return HttpResponse.json(mockLobbies);
    }),
];