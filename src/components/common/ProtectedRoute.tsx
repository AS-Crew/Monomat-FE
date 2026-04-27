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
    // Zustand에서 인증 여부를 구독
    // isGuest가 true = 게스트 또는 정식 회원 세션이 존재하는 상태
    const isGuest = useAuthStore((state) => state.isGuest);

    // 세션이 없으면 홈으로 강제 이동한다.
    // replace: true → 브라우저 히스토리에 현재 경로를 남기지 않아
    // 뒤로가기를 눌렀을 때 보호된 페이지로 돌아오는 것을 방지한다.
    if (!isGuest) {
        return <Navigate to="/" replace />;
    }

    // 인증된 사용자는 자식 컴포넌트를 그대로 렌더링한다.
    return <>{children}</>;
}