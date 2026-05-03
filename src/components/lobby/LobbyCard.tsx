// 로비 데이터의 타입 정의를 가져온다.
// type-only import를 사용하여 빌드 시 자바스크립트 결과물에는 포함되지 않게 한다.
import type { Lobby } from '../../types/lobby';

// LobbyCard 컴포넌트가 부모로부터 전달받을 속성 (Props)들의 타입을 정의한다.
interface LobbyCardProps {
    lobby: Lobby;   // 로비의 세부 정보 (상태, 코드, 제목, 최대 인원, 맵 정보 등)
    onEnter: (code: string) => void;    // '입장' 버튼 클릭 시 호출될 콜백 함수, 방의 고유 코드 (code)를 인자로 넘긴다.
}

// StatusBadge 컴포넌트 : 로비의 현재 상태 (대기중/진행중)를 시각적인 배지 형태로 보여준다.
function StatusBadge({ status }: { status: Lobby['status'] }) {
    // 상태가 'WAITING (대기중)'인지 확인하는 불리언(boolean) 변수이다.
    const isWaiting = status === 'WAITING';
    return (
        <span
            // 공통 스타일 : 둥근 모서리, 상화좌우 패딩, 작은 글씨와 중간 긁기
            // 동적 스타일 : isWaiting 값에 따라 초록생 (대기중) 또는 노란색 (진행중) 테마를 적용
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                isWaiting
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
            }`}
        >
            {/* 상태에 따라 화면에 보여줄 텍스트를 결정한다. */}
            {isWaiting ? '대기중' : '진행중'}
        </span>
    );
}

// LobbyCard 컴포넌트 (메인 컴포넌트) : 각 로비의 요약 정보를 하나의 카드 UI로 렌더링한다.
export function LobbyCard({ lobby, onEnter }: LobbyCardProps) {
    // 코드의 가독성을 높이고 편리하게 사용하기 위해,
    // 객체 구조 분해 할당 (Destructuring)을 사용하여 lobby 객체에서 필요한 속성만 추출한다.
    const { code, title, status, maxPlayers, mapId } = lobby;

    return (
        // 카드 전체 컨테이너
        // flex & justify-between : 왼쪽 (정보)과 오른쪽 (버튼) 요소를 양쪽 끝으로 밀어낸다.
        // rounded-xl, border, shadow-sm : 모서리를 둥글게 하고 옅은 테두리와 그림자를 주어 카드 느낌을 낸다.
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">

            {/* 좌측 영역 : 로비 정보 (상태 배지, 방 제목, 인원, 맵)를 세로 (flex-col)로 배치한다. */}
            <div className="flex flex-col gap-1">

                {/* 상단 라인 : 상태 배지와 로비 제목을 가로로 배치한다. */}
                <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    {/* 방 제목 (진한 회색 텍스트) */}
                    <span className="font-semibold text-gray-900">{title}</span>
                </div>

                {/* 하단 라인 : 최대 인원수와 맵 정보를 가로로 배치한다. (옅은 회색 텍스트) */}
                <div className="flex gap-3 text-sm text-gray-500">
                    <span>최대 {maxPlayers}명</span>
                    {/* mapId가 null이 아니면 맵 번호를, null이면 '맵 미선택'을 출력 */}
                    <span>{mapId !== null ? `맵 #${mapId}` : '맵 미선택'}</span>
                </div>
            </div>

            {/* 우측 영역 : 방 입장 버튼 */}
            <button
                // 버튼 클릭 시 부모 컴포넌트에서 받은 onEnter 함수를 실행하며, 현재 방의 코드 (code)를 전달한다.
                onClick={() => onEnter(code)}

                // 방 상태가 'PLAYING (진행중)'이면 이미 시작된 방이므로 버튼을 비활성화 (disabled) 상태로 만든다.
                disabled={status === 'PLAYING'}

                // 버튼 스타일
                // 기본 상태 : 남색 계열 배경 및 흰색 텍스트
                // hover: 마우스를 올렸을 때 살짝 더 진한 색(hover:bg-indigo-600)으로 부드럽게 전환(transition)된다.
                // disabled: 비활성화 상태일 때는 클릭 금지 커서(disabled:cursor-not-allowed)와 회색 배경(disabled:bg-gray-300)으로 변경한다.
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
                입장
            </button>
        </div>
    );
}