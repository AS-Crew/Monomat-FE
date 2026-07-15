import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import './index.css';
import App from './App.tsx';
import { queryClient } from './services/queryClient';

const ENABLE_MSW = import.meta.env.VITE_ENABLE_MSW === 'true';

/**
 * MSW는 개발 환경에서 명시적으로 활성화한 경우에만 실행한다.
 *
 * 실제 BE API 연동 중에는 Service Worker가 요청을 가로채면
 * CORS, passthrough 실패, stale mock 문제를 만들 수 있으므로 기본값은 비활성화한다.
 */
async function enableMocking() {
    if (!import.meta.env.DEV || !ENABLE_MSW) {
        return;
    }

    const { worker } = await import('./mocks/browser');

    return worker.start({
        onUnhandledRequest: 'bypass',
    });
}

enableMocking().then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <App />
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </StrictMode>,
    );
});
