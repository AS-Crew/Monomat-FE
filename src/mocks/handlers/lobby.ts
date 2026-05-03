/**
 * GET /api/lobbies 핸들러
 */

import { http, HttpResponse } from 'msw';
import { mockLobbies } from '../data/lobbies';

export const lobbyHandlers = [
    http.get('/api/lobbies', () => {
        return HttpResponse.json(mockLobbies);
    }),
];