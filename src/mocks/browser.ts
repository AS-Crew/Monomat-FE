/**
 * MSW 브라우저 워커 설정
 */

import { setupWorker } from 'msw/browser';
import { lobbyHandlers } from './handlers/lobby';
import { mapHandlers } from './handlers/map';

export const worker = setupWorker(...lobbyHandlers, ...mapHandlers);
