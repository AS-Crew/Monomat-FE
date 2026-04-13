import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // 추가
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // 선택 사항 (개발용)
import './index.css';
import App from './App.tsx';

// QueryClient 인스턴스 생성
// 포커스가 바뀔 때마다 데이터를 다시 가져오면 성능에 영향을 줄 수 있어 설정을 조정
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // oEmbed 캐싱 등을 위해 5분간 유지
            refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 새로고침 방지
            retry: 1, // 에러 발생 시 재시도 횟수
        },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        {/* TanStack Query Provider로 App 감싸기 */}
        <QueryClientProvider client={queryClient}>
            <App />
            {/* 서버 상태를 모니터링하기 위해 Devtools를 추가하면 유용*/}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </StrictMode>,
);