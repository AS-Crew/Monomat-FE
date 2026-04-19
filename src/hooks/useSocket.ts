import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';

// 소켓의 생명주기(연결/해제)를 관리하는 커스텀 훅입니다.
// App.tsx처럼 인증된 사용자가 접근하는 최상위 컴포넌트에서 딱 한 번만 호출합니다.
// 하위 컴포넌트들은 이 훅을 직접 쓰지 않고,
// useSocketStore()로 필요한 상태나 액션만 가져다 씁니다.
export function useSocket() {
    const uuid = useAuthStore((state) => state.uuid);
    const connect = useSocketStore((state) => state.connect);
    const disconnect = useSocketStore((state) => state.disconnect);

    useEffect(() => {
        // uuid가 없으면(비인증 상태) 소켓 연결을 시도하지 않습니다.
        if (!uuid) return;

        connect(uuid);

        // [cleanup 함수]
        // 아래 두 가지 시점에 자동으로 실행됩니다.
        // 1. 컴포넌트가 화면에서 사라질 때 (로그아웃, 페이지 이탈)
        // 2. uuid가 바뀔 때 (기존 소켓 끊고 새 uuid로 재연결)
        return () => {
            // disconnect()는 async 함수라 Promise를 반환합니다.
            // useEffect cleanup은 void만 반환할 수 있으므로
            // 화살표 함수로 감싸서 Promise가 외부로 노출되지 않게 합니다.
            void disconnect();
        };
    }, [uuid, connect, disconnect]);
}