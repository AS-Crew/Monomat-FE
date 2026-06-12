import React, { type InputHTMLAttributes, forwardRef } from 'react';

export interface MonomatInputProps extends InputHTMLAttributes<HTMLInputElement> {
    /**
     * 엔터 키가 눌렸을 때 실행될 콜백 함수입니다.
     * isComposing(한글 조합 중) 상태가 아닐 때만 안전하게 호출됩니다.
     */
    onEnter?: (value: string) => void;

    /**
     * 엔터 키 입력 시 HTML Form의 기본 제출(submit) 동작 및
     * 화면 새로고침을 방지할지 여부를 결정합니다.
     * 실시간 게임(WebSocket 유지) 환경을 위해 기본값은 true로 설정합니다.
     */
    preventEnterSubmit?: boolean;
}

export const MonomatInput = forwardRef<HTMLInputElement, MonomatInputProps>(
    ({ onKeyDown, onEnter, preventEnterSubmit = true, ...props }, ref) => {

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            // 한글 IME 조합 중(예: ㄱ+ㅏ=가) 발생한 이벤트는 무시하여 2중 제출 방지
            if (e.nativeEvent.isComposing) {
                return;
            }

            // 엔터 키 입력 처리
            if (e.key === 'Enter') {
                // 부모의 설정에 따라 폼 기본 제출 방지 동작 제어
                if (preventEnterSubmit) {
                    e.preventDefault();
                }

                // onEnter 콜백이 전달된 경우 현재 입력값을 파라미터로 실행
                if (onEnter) {
                    onEnter(e.currentTarget.value);
                }
            }

            // 외부에서 전달된 기존 onKeyDown 이벤트가 있다면 유지하여 확장성 보장
            if (onKeyDown) {
                onKeyDown(e);
            }
        };

        return (
            <input
                ref={ref}
                onKeyDown={handleKeyDown}
                className="monomat-default-input" // 필요에 따라 Tailwind 등 디자인 클래스 적용
                {...props}
            />
        );
    }
);

// 디버깅 용이성을 위해 컴포넌트 표시 이름 설정
MonomatInput.displayName = 'MonomatInput';