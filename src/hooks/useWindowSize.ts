import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../constants/layout';

// 훅을 반환하는 타입 정의
interface WindowSize {
    width: number;
    height: number;
    // 컴포넌트에서 width <= 768 같은 판단을 하지 않아도 되도록 훅이 직접 의미 있는 값을 계산해서 반환한다.
    isMobile: boolean;
}

/**
 * 브라우저 창의 현재 크기와 모바일 여부를 실시간으로 반환하는 커스텀 훅
 * - resize 이벤트를 구독하여 창 크기가 바뀔 때마다 상태를 업데이트한다.
 * - 모바일 여부 판단 기준은 layout.ts의 BREAKPOINTS.MOBILE 상수를 따른다.
 * - 컴포넌트 언마운트 시 이벤트 리스너를 제거하여 메모리 누수를 방지한다.
 */
export function useWindowSize(): WindowSize {
    const [windowSize, setWindowSize] = useState<WindowSize>(() => {
        // 초기값을 함수로 전달 (lazy initialization)
        // useState(() => ...) 형태로 작성하면 컴포넌트 랜더링마다 실행되지 않고, 최초 마운트 시 딱 한 번만 실행된다.
        const width = typeof window !== 'undefined' ? window.innerWidth : 0;
        const height = typeof window !== 'undefined' ? window.innerHeight : 0;
        return {
            width,
            height,
            isMobile: width <= BREAKPOINTS.MOBILE,
        };
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setWindowSize({
                width,
                height,
                // BREAKPOINTS.MOBILE 상수를 참조하므로 기준이 바뀌어도 이 코드는 수정할 필요 X
                isMobile: width <= BREAKPOINTS.MOBILE,
            });
        };

        window.addEventListener('resize', handleResize);

        // 클린업 : 컴포넌트 언마운트 시 리스너 제거 (메모리 누수 방지)
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return windowSize;
}