import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { joinLobbyByInviteCode } from '../../api/lobbyApi';
import { INVITE_CODE_POLICY } from '../../constants/lobby';
import type { JoinLobbyResponse } from '../../types/lobby';
import {
    normalizeInviteCode,
    validateInviteCode,
} from '../../utils/inviteCode';
import { MonomatInput } from '../common/MonomatInput';

interface InviteCodeJoinModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function getJoinBlockedMessage(response: JoinLobbyResponse): string | null {
    if (response.status === 'PLAYING') {
        return '이미 진행 중인 로비에는 입장할 수 없습니다.';
    }

    if (response.currentPlayers >= response.maxPlayers) {
        return '최대 인원을 초과하여 입장할 수 없습니다.';
    }

    return null;
}

export function InviteCodeJoinModal({
                                        isOpen,
                                        onClose,
                                    }: InviteCodeJoinModalProps) {
    const navigate = useNavigate();

    const [inviteCodeInput, setInviteCodeInput] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [joinedLobby, setJoinedLobby] = useState<JoinLobbyResponse | null>(
        null,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setInviteCodeInput('');
        setErrorMessage(null);
        setJoinedLobby(null);
        setIsSubmitting(false);
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleClose = () => {
        if (isSubmitting) {
            return;
        }

        onClose();
    };

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const normalizedValue = normalizeInviteCode(event.target.value);

        setInviteCodeInput(normalizedValue);
        setErrorMessage(null);
        setJoinedLobby(null);
    };

    const handleJoinCheck = async (value: string) => {
        const normalizedInviteCode = normalizeInviteCode(value);
        const validationMessage = validateInviteCode(normalizedInviteCode);

        if (validationMessage) {
            setErrorMessage(validationMessage);
            setJoinedLobby(null);
            return;
        }

        if (isSubmitting) {
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            setJoinedLobby(null);

            const response = await joinLobbyByInviteCode({
                inviteCode: normalizedInviteCode,
            });

            const blockedMessage = getJoinBlockedMessage(response);

            if (blockedMessage) {
                setErrorMessage(blockedMessage);
                return;
            }

            setJoinedLobby(response);
        } catch (error) {
            if (error instanceof Error && error.message) {
                setErrorMessage(error.message);
                return;
            }

            setErrorMessage('로비 입장에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmEnter = () => {
        if (!joinedLobby) {
            return;
        }

        onClose();
        navigate(`/lobby/${joinedLobby.inviteCode}`);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-code-join-modal-title"
        >
            <div className="relative w-[460px] rounded-2xl bg-white px-9 py-8 text-[#333338] shadow-xl">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="absolute right-6 top-6 text-3xl leading-none text-[#808085] hover:text-[#333338] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="초대 코드 입장 모달 닫기"
                >
                    ×
                </button>

                <h2
                    id="invite-code-join-modal-title"
                    className="mb-3 text-center text-2xl font-bold text-[#333338]"
                >
                    초대 코드로 입장
                </h2>

                <p className="mb-8 text-center text-sm text-[#808085]">
                    전달받은 6자리 초대 코드를 입력해주세요.
                </p>

                <section className="mb-5">
                    <label
                        htmlFor="invite-code-input"
                        className="mb-3 block text-sm font-bold text-[#333338]"
                    >
                        초대 코드
                    </label>

                    <MonomatInput
                        id="invite-code-input"
                        type="text"
                        value={inviteCodeInput}
                        maxLength={INVITE_CODE_POLICY.LENGTH}
                        autoFocus
                        disabled={isSubmitting}
                        onChange={handleInputChange}
                        onEnter={handleJoinCheck}
                        placeholder="ABC123"
                        className="h-13 w-full rounded-lg border border-[#CCCCD1] bg-[#F5F5F7] px-4 text-center font-mono text-2xl font-bold tracking-[0.35em] text-[#333338] outline-none transition placeholder:text-[#B5B5BA] focus:border-[#3873E6] disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <p className="mt-2 text-xs text-[#808085]">
                        영문 대문자와 숫자 조합 6자리만 입력할 수 있습니다.
                    </p>
                </section>

                {errorMessage && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-500"
                    >
                        {errorMessage}
                    </div>
                )}

                {joinedLobby && (
                    <section className="mb-5 rounded-xl bg-[#F5F5F7] px-4 py-4">
                        <p className="mb-2 text-sm font-bold text-[#333338]">
                            입장 가능한 로비입니다.
                        </p>

                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-[#808085]">로비 이름</dt>
                                <dd className="max-w-[240px] truncate font-semibold text-[#333338]">
                                    {joinedLobby.title}
                                </dd>
                            </div>

                            <div className="flex justify-between gap-4">
                                <dt className="text-[#808085]">현재 인원</dt>
                                <dd className="font-semibold text-[#333338]">
                                    {joinedLobby.currentPlayers}/
                                    {joinedLobby.maxPlayers}명
                                </dd>
                            </div>
                        </dl>
                    </section>
                )}

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="h-12 flex-1 rounded-lg border border-[#CCCCD1] font-bold text-[#333338] hover:bg-[#F5F5F7] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        취소
                    </button>

                    {joinedLobby ? (
                        <button
                            type="button"
                            onClick={handleConfirmEnter}
                            className="h-12 flex-1 rounded-lg bg-[#3873E6] font-bold text-white hover:bg-blue-600"
                        >
                            입장하기
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleJoinCheck(inviteCodeInput)}
                            disabled={isSubmitting}
                            className="h-12 flex-1 rounded-lg bg-[#3873E6] font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                            {isSubmitting ? '확인 중...' : '입장 확인'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}