import React, { useState } from 'react';
import { Scroll, Sparkles, BookOpen, UserCheck } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function LoginModal({ onLogin, initialNickname = '' }) {
  const [nickname, setNickname] = useState(initialNickname);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('집현전에 등록할 닉네임이나 학번을 입력해주세요!');
      return;
    }
    if (nickname.trim().length < 2) {
      setError('닉네임은 최소 2자 이상이어야 합니다.');
      return;
    }

    sounds.playClick();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() })
      });
      const data = await res.json();
      if (data.success && data.user) {
        sounds.playCorrect();
        onLogin(data.user);
      } else {
        setError(data.error || '입장에 실패했습니다.');
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError('서버 연결 실패. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="scroll-panel w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-2xl animate-float">
        {/* Header Decor */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#8b261b] text-amber-300 text-3xl mb-3 shadow-lg border-2 border-[#d99b26]">
            🖊️
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#8b261b]">
            집현전 입학 서약
          </h2>
          <p className="text-sm text-[#5c3d2e] mt-1 font-semibold">
            조선 최고의 맞춤법 학사에 도전하세요!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#2c221e] mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#8b261b]" />
              학사 닉네임 (또는 학번)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 한글왕6학년3반 / 집현전꿈나무"
              className="w-full px-4 py-3 bg-[#fbf7ee] border-2 border-[#c7b38d] rounded-xl text-[#2c221e] placeholder-gray-400 focus:outline-none focus:border-[#8b261b] focus:ring-2 focus:ring-[#8b261b]/20 font-bold transition-all"
              maxLength={15}
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-600 font-bold mt-1.5 animate-bounce">
                ⚠️ {error}
              </p>
            )}
          </div>

          <div className="bg-[#ede1c9]/70 p-3.5 rounded-xl border border-[#d4c29d] text-xs text-[#5c3d2e] leading-relaxed">
            💡 비밀번호 없이 닉네임만으로 간편하게 시작할 수 있습니다.<br />
            다른 기기에서도 <strong>동일한 닉네임</strong>을 입력하면 기록이 유지됩니다!
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-joseon-primary py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>집현전 입장 중...</span>
            ) : (
              <>
                <UserCheck className="w-5 h-5" />
                <span>집현전 학사로 입장하기</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-[#8b261b]/80 font-bold">
            세종대왕님의 훈민정음 어제 서문 인가 완료 📜
          </p>
        </div>
      </div>
    </div>
  );
}
