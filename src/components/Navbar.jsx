import React from 'react';
import { Coins, Volume2, VolumeX, User, Crown, Scroll } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Navbar({ user, onOpenRanking, onSwitchUser, muted, setMuted, onGoHome }) {
  const handleToggleSound = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
  };

  const getTitleRank = () => {
    if (!user) return "집현전 학사";
    if (user.boss_high_score >= 10) return "정삼품 수석 학사 👑";
    if (user.boss_high_score >= 7) return "집현전 우수 학사 📜";
    if (user.boss_high_score > 0) return "참봉 학사 🎖️";
    return "신입 학사 🖊️";
  };

  return (
    <header className="sticky top-0 z-40 bg-[#2c221e] text-[#f5edd6] shadow-lg border-b-4 border-[#8b261b]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Title / Logo */}
        <div 
          onClick={onGoHome} 
          className="flex items-center gap-3 cursor-pointer group hover:opacity-95 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b261b] to-[#5c160e] flex items-center justify-center text-2xl shadow-md border border-[#d99b26]">
            📜
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide text-[#f3b61f] group-hover:text-amber-300 transition-colors">
              집현전 맞춤법 대결
            </h1>
            <p className="text-xs text-amber-200/70 hidden sm:block">
              세종대왕의 학사가 되다!
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        {user && (
          <div className="flex items-center gap-3 flex-wrap">
            {/* Student Profile Badge */}
            <div className="flex items-center gap-2 bg-[#42322c] px-3 py-1.5 rounded-lg border border-[#6b5247]">
              <User className="w-4 h-4 text-amber-400" />
              <div className="text-sm">
                <span className="font-bold text-amber-100">{user.nickname}</span>
                <span className="text-xs ml-2 text-amber-300/80 hidden md:inline-block">
                  [{getTitleRank()}]
                </span>
              </div>
            </div>

            {/* Always Visible Gold Balance */}
            <div className="gold-badge flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-sm shadow-md animate-pulse-slow">
              <Coins className="w-4 h-4 text-amber-900 animate-spin-slow" />
              <span>{user.gold} G</span>
            </div>

            {/* Hall of Fame Shortcut */}
            <button
              onClick={() => { sounds.playClick(); onOpenRanking(); }}
              className="flex items-center gap-1.5 bg-[#8b261b] hover:bg-[#a32e22] text-amber-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border border-amber-600/40"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">명예의 전당</span>
            </button>

            {/* Sound Mute Toggle */}
            <button
              onClick={handleToggleSound}
              title={muted ? "음소거 해제" : "음소거"}
              className="p-2 bg-[#42322c] hover:bg-[#57423a] text-amber-200 rounded-lg transition-colors border border-[#6b5247]"
            >
              {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Switch Student */}
            <button
              onClick={() => { sounds.playClick(); onSwitchUser(); }}
              className="text-xs text-amber-200/60 hover:text-amber-200 underline ml-1"
            >
              사용자 변경
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
