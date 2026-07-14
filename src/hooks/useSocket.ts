import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';

// 소켓의 생명주기(연결/해제)를 관리하는 커스텀 훅입니다.
// App.tsx처럼 인증된 사용자가 접근하는 최상위 컴포넌트에서 한 번만 호출합니다.
// WebSocket CONNECT 인증은 BE가 발급한 Access Token을 사용합니다.
export function useSocket() {
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const accessToken = useAuthStore((state) => state.accessToken);
    const connect = useSocketStore((state) => state.connect);
    const disconnect = useSocketStore((state) => state.disconnect);

    useEffect(() => {
        if (!isHydrated) {
            return;
        }

        if (!accessToken) {
            void disconnect();
            return;
        }

        void connect(accessToken);
    }, [isHydrated, accessToken, connect, disconnect]);

    useEffect(() => {
        return () => {
            void disconnect();
        };
    }, [disconnect]);
}
