import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';

// 소켓의 생명주기(연결/해제)를 관리하는 커스텀 훅입니다.
// App.tsx처럼 인증된 사용자가 접근하는 최상위 컴포넌트에서 한 번만 호출합니다.
// WebSocket 식별자는 FE가 직접 만든 UUID가 아니라 BE가 발급한 userIdentifier를 사용합니다.
export function useSocket() {
    const userIdentifier = useAuthStore((state) => state.userIdentifier);
    const connect = useSocketStore((state) => state.connect);
    const disconnect = useSocketStore((state) => state.disconnect);

    useEffect(() => {
        if (!userIdentifier) return;

        connect(userIdentifier);

        return () => {
            void disconnect();
        };
    }, [userIdentifier, connect, disconnect]);
}