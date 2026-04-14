import { useRef } from 'react';
import { MonomatInput } from '../components/common/MonomatInput';
import { useAuthStore } from '../store/useAuthStore'; // ✅ 1. Zustand 스토어 import

/**
 * 보안 컨텍스트가 없는 환경(HTTP 등)을 위한 UUID Fallback 함수
 */
const generateFallbackUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const Home = () => {
    const inputRef = useRef<HTMLInputElement>(null);

    // ✅ 2. Zustand 상태 업데이트 함수(Action) 가져오기
    const setSession = useAuthStore((state) => state.setSession);

    const handleNicknameSubmit = (nickname: string) => {
        const trimmedName = nickname.trim();

        if (!trimmedName) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        // 1️⃣ UUID 발급 (Secure Context 체크 및 Fallback 적용)
        const guestUuid =
            typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : generateFallbackUUID();

        // 2️⃣ localStorage 세션 저장
        const sessionData = {
            uuid: guestUuid,
            nickname: trimmedName,
            createdAt: Date.now(),
        };

        localStorage.setItem('monomat_guest_session', JSON.stringify(sessionData));
        console.log('게스트 세션 생성 완료:', sessionData);

        // 3️⃣ Zustand 스토어 업데이트
        // ✅ 이 함수가 호출되는 순간 isGuest 상태가 true로 바뀌며,
        // App.tsx의 라우팅 로직에 의해 즉시 로비 대기실 화면으로 자동 전환됩니다.
        setSession(guestUuid, trimmedName);
    };

    // 버튼 클릭 시 Input의 현재 값을 가져와 제출 처리
    const onButtonClick = () => {
        if (inputRef.current) {
            handleNicknameSubmit(inputRef.current.value);
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
                    <MonomatInput
                        ref={inputRef}
                        type="text"
                        placeholder="닉네임을 입력하세요"
                        maxLength={12}
                        autoFocus
                        onEnter={handleNicknameSubmit}
                        className="w-full px-5 py-4 text-xl bg-gray-900 border-2 border-gray-800 rounded-2xl outline-none focus:border-blue-500 transition-all text-white placeholder-gray-600"
                    />

                    {/* 모바일 접근성을 위한 '입장' 버튼 (데스크톱에서는 엔터로, 모바일에서는 터치로) */}
                    <button
                        onClick={onButtonClick}
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