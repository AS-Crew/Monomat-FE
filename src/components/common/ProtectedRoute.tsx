// 인증된 사용자 (게스트 포함)만 특정 라우트에 접근할 수 있도록 제어하는 라우트 가드 컴포넌트

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * [라우트 가드 컴포넌트]
 *
 * Zustand의 useAuthStore에서 isGuest 상태를 읽어
 * 세션이 있으면 자식을 렌더링하고, 없으면 홈('/')으로 리다이렉트한다.
 *
 * 사용 예시:
 *   <ProtectedRoute>
 *     <Lobbies />
 *   </ProtectedRoute>
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const isGuest = useAuthStore((state) => state.isGuest);
    const isHydrated = useAuthStore((state) => state.isHydrated);

    // 아직 localStorage를 읽어오는 중이면 아무것도 렌더링하지 않는다.
    if (!isHydrated) {
        return null;
    }

    if (!isGuest) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}