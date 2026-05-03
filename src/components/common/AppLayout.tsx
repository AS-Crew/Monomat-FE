import { type ReactNode } from 'react';
import { BREAKPOINTS } from '../../constants/layout';

interface AppLayoutProps {
    /** 레이아웃 내부에 렌더링될 하위 페이지 컴포넌트 또는 요소 */
    children: ReactNode;
}

/**
 * 앱 전체 페이지에 공통으로 적용되는 레이아웃 래퍼 컴포넌트.
 *
 * [레이아웃 기준]
 * - 최소 너비: BREAKPOINTS.MIN_PC (소형 노트북)
 * - 최대 너비: BREAKPOINTS.MAX_CONTENT — 초과 시 중앙 정렬로 공백 처리
 * - 그 사이 구간: w-full로 꽉 채워서 자연스럽게 늘어났다 줄어듦
 * - 기준값 변경 시 layout.ts의 BREAKPOINTS 상수만 수정하면 된다.
 */
export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div
            className="min-h-screen w-full mx-auto px-6 bg-black text-white"
            style={{
                // Tailwind는 동적 값을 클래스로 쓸 수 없으므로
                // 상수 기반의 maxWidth는 인라인 style로 적용한다.
                maxWidth: `${BREAKPOINTS.MAX_CONTENT}px`,
                minWidth: `${BREAKPOINTS.MIN_PC}px`,
            }}
        >
            {children}
        </div>
    );
}
