// 게임 진입점 페이지
// 닉네임 입력 UI를 렌더링하고, useGuestSession 훅을 통해 세션 생성을 위임한다.

import { useRef } from 'react';
import { MonomatInput } from '../components/common/MonomatInput';
import { useGuestSession } from '../hooks/useGuestSession';

export const Home = () => {
    const inputRef = useRef<HTMLInputElement>(null);

    // 세션 생성과 관련된 모든 비즈니스 로직은 훅 내부에 캡슐화되어 있다.
    // Home.tsx는 createGuestSession을 호출하는 방법만 알면 된다.
    const { createGuestSession } = useGuestSession();

    // 버튼 클릭 시 input의 현재 값을 읽어 세션 생성을 요청한다.
    const handleButtonClick = () => {
        if (inputRef.current) {
            createGuestSession(inputRef.current.value);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
            <div className="text-center mb-10">
                <h1 className="text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    MONOMAT
                </h1>
                <p className="text-gray-400 text-lg">YouTube 음악 퀴즈를 실시간으로 즐기세요.</p>
            </div>

            <div className="w-full max-w-md flex flex-col gap-3">
                <div className="relative group">
                    {/*
                     * MonomatInput은 onEnter 콜백을 통해
                     * 한글 조합 중 엔터 2중 제출(Double Fire) 문제를 내부적으로 방지한다.
                     * (isComposing 처리가 MonomatInput 내부에 캡슐화되어 있다.)
                     */}
                    <MonomatInput
                        ref={inputRef}
                        type="text"
                        placeholder="닉네임을 입력하세요"
                        maxLength={12}
                        autoFocus
                        onEnter={createGuestSession}
                        className="w-full px-5 py-4 text-xl bg-gray-900 border-2 border-gray-800 rounded-2xl outline-none focus:border-blue-500 transition-all text-white placeholder-gray-600"
                    />

                    <button
                        onClick={handleButtonClick}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl font-bold transition-all"
                        aria-label="게임 입장"
                    >
                        입장
                    </button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-2">
                    별도의 회원가입 없이 즉시 플레이가 가능합니다.
                </p>
            </div>
        </div>
    );
};