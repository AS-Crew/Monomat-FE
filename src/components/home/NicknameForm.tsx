// 홈 화면의 닉네임 입력 UI를 담당하고, useGuestSession 훅과 연결하여 세션 생성을 트리거하는 컴포넌트

import { useRef } from 'react';
import { MonomatInput } from '../common/MonomatInput';
import { useGuestSession } from '../../hooks/useGuestSession';

/**
 * [닉네임 입력 폼 컴포넌트]
 *
 * 이 컴포넌트의 책임 범위:
 *   - 닉네임 입력창(MonomatInput)과 입장 버튼 렌더링
 *   - 버튼 클릭 또는 엔터 입력 시 useGuestSession 훅으로 값 전달
 *
 * 이 컴포넌트가 하지 않는 것:
 *   - UUID 생성, localStorage 저장, Zustand 상태 업데이트
 *     → 모두 useGuestSession 훅 내부에서 처리
 */

export function NicknameForm() {
    // 입력 요소에 직접 접근하기 위해 ref를 사용
    // 버튼 클릭 시 input의 현재 값을 읽어야 하기 때문이다.
    const inputRef = useRef<HTMLInputElement>(null);

    // 세션 생성 로직은 훅에 캡슐화되어 있으며,
    // 이 컴포넌트는 createGuestSession 함수만 받아서 호출한다.
    const { createGuestSession } = useGuestSession();

    // 버튼 클릭 핸들러
    // ref로 input의 현재 값을 읽어 훅에 전달한다.
    // (onEnter는 MonomatInput 내부에서 value를 직접 파라미터로 넘겨주므로
    //  ref가 필요 없지만, 버튼 클릭 경로에서는 ref를 통해 값을 읽는다.)
    const handleButtonClick = () => {
        if (inputRef.current) {
            createGuestSession(inputRef.current.value);
        }
    };

    return (
        <div className="w-full max-w-md flex flex-col gap-3">
            <div className="relative group">
                {/*
                 * MonomatInput: 프로젝트 전용 커스텀 인풋 컴포넌트 (#15에서 생성)
                 *
                 * onEnter 콜백을 사용하는 이유:
                 *   일반 onKeyDown에서 엔터를 감지하면 한글 조합 완료 시점에
                 *   이벤트가 2번 발생하는 'Double Fire' 문제가 생긴다.
                 *   MonomatInput은 내부적으로 isComposing 상태를 체크하여
                 *   한글 조합이 끝난 후 엔터가 눌렸을 때만 onEnter를 호출한다.
                 */}
                <MonomatInput
                    ref={inputRef}
                    type="text"
                    placeholder="닉네임을 입력하세요"
                    maxLength={12}
                    autoFocus
                    onEnter={createGuestSession}  // 엔터 입력 시 세션 생성 요청
                    className="w-full px-5 py-4 text-xl bg-gray-900 border-2 border-gray-800 rounded-2xl outline-none focus:border-blue-500 transition-all text-white placeholder-gray-600"
                />

                {/* 입장 버튼: 클릭 시 ref로 현재 input 값을 읽어 세션 생성 요청 */}
                <button
                    onClick={handleButtonClick}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl font-bold transition-all"
                    aria-label="게임 입장"
                >
                    입장
                </button>
            </div>

            {/* 게스트 진입 안내 문구 */}
            <p className="text-center text-xs text-gray-500 mt-2">
                별도의 회원가입 없이 즉시 플레이가 가능합니다.
            </p>
        </div>
    );
}