import React from 'react';
import { Zap, BookOpen, Gamepad2, Crown, Lock, ArrowRight, Sparkles, Coins, Award } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Dashboard({ user, onSelectGame, onOpenBoss, onOpenRanking }) {
  const isBossUnlocked = user && user.gold >= 100;
  const bossProgressPercent = user ? Math.min(100, Math.floor((user.gold / 100) * 100)) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      
      {/* Welcome Banner */}
      <div className="hanji-card p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#8b261b]/10 text-[#8b261b] px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              조선시대 집현전 학당
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2c221e]">
              반갑습니다, <span className="text-[#8b261b]">{user?.nickname}</span> 학사님! 📜
            </h2>
            <p className="text-sm text-[#5c3d2e] mt-1">
              미니게임에서 엽전을 모아 실력을 다지고, <strong className="text-[#8b261b]">100 골드</strong>를 모아 세종대왕님과의 대결에서 승리하세요!
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 sm:gap-4 bg-[#ede1c9]/80 p-3.5 rounded-xl border border-[#d4c29d]">
            <div className="text-center px-3 border-r border-[#c7b38d]">
              <p className="text-xs text-[#5c3d2e]">보유 엽전</p>
              <p className="text-lg font-black text-[#d99b26] flex items-center justify-center gap-1">
                <Coins className="w-4 h-4" /> {user?.gold || 0}
              </p>
            </div>
            <div className="text-center px-3 border-r border-[#c7b38d]">
              <p className="text-xs text-[#5c3d2e]">총 도전 횟수</p>
              <p className="text-lg font-black text-[#8b261b]">{user?.total_play_count || 0}회</p>
            </div>
            <div className="text-center px-3">
              <p className="text-xs text-[#5c3d2e]">보스전 최고점</p>
              <p className="text-lg font-black text-[#1b4965]">{user?.boss_high_score || 0}/10</p>
            </div>
          </div>
        </div>
      </div>

      {/* BOSS DUEL SECTION (SPECIAL CARD) */}
      <div className={`rounded-2xl p-6 sm:p-8 transition-all duration-300 border-4 ${
        isBossUnlocked 
          ? 'bg-gradient-to-br from-[#5c160e] via-[#8b261b] to-[#42110a] text-amber-100 border-[#f3b61f] shadow-2xl shimmer-effect' 
          : 'bg-[#ede1c9]/90 text-[#2c221e] border-[#c7b38d] shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md border ${
                isBossUnlocked ? 'bg-[#f3b61f] border-amber-200' : 'bg-[#c7b38d] border-amber-900/20'
              }`}>
                👑
              </div>
              <div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isBossUnlocked ? 'bg-amber-400 text-amber-950' : 'bg-gray-300 text-gray-700'
                }`}>
                  최종 목표 관문
                </span>
                <h3 className={`text-2xl font-black ${isBossUnlocked ? 'text-amber-300' : 'text-[#8b261b]'}`}>
                  세종대왕과의 맞춤법 대결 (보스전)
                </h3>
              </div>
            </div>

            <p className={`text-sm leading-relaxed ${isBossUnlocked ? 'text-amber-100/90' : 'text-[#5c3d2e]'}`}>
              세종대왕 AI와 1:1 실시간 맞춤법 레이스를 펼칩니다! 승리 시 <strong className="underline decoration-amber-400">왕실 교지 인증서</strong>와 칭호를 받게 됩니다.
            </p>

            {/* Gold Progress Bar for Unlocking */}
            {!isBossUnlocked && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-bold text-[#5c3d2e]">
                  <span>보스전 해금 조건 (100 G 필요)</span>
                  <span>{user?.gold || 0} / 100 G ({bossProgressPercent}%)</span>
                </div>
                <div className="w-full h-3.5 bg-[#d4c29d] rounded-full overflow-hidden p-0.5 border border-[#b8a47e]">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${bossProgressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-center md:items-end justify-center min-w-[200px]">
            {isBossUnlocked ? (
              <button
                onClick={() => { sounds.playClick(); onOpenBoss(); }}
                className="w-full sm:w-auto btn-joseon-gold px-8 py-4 rounded-xl text-lg font-black flex items-center justify-center gap-2 shadow-xl animate-bounce-slow"
              >
                <span>세종대왕님께 도전!</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto bg-gray-300 text-gray-500 px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-gray-400"
              >
                <Lock className="w-4 h-4" />
                <span>엽전 100개 필요 ({100 - (user?.gold || 0)}G 부족)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MINI GAMES SECTION HEADER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-bold text-[#8b261b] flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-[#8b261b]" />
            집현전 미니게임 (엽전 모으기)
          </h3>
          <span className="text-xs text-[#5c3d2e] font-semibold">
            플레이당 1~3분 소요
          </span>
        </div>

        {/* 3 Mini Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Game 1: Dictation Speed */}
          <div 
            onClick={() => { sounds.playClick(); onSelectGame('dictation'); }}
            className="hanji-card p-6 rounded-2xl cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-200 border-2 border-[#d4c29d] hover:border-[#8b261b] flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-12 h-12 rounded-xl bg-amber-100 text-[#8b261b] flex items-center justify-center text-2xl border border-amber-300 shadow-sm">
                  ⚡
                </span>
                <span className="bg-[#8b261b]/10 text-[#8b261b] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> 스피드 모드
                </span>
              </div>
              <h4 className="text-xl font-bold text-[#2c221e] group-hover:text-[#8b261b] transition-colors">
                ① 받아쓰기 배틀
              </h4>
              <p className="text-xs text-[#5c3d2e] mt-2 leading-relaxed">
                8초 안에 문장 속 맞춤법 빈칸을 채우세요! 빨릴 맞힐수록 스피드 보너스 골드 지급!
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#d4c29d]/60 flex items-center justify-between text-xs font-bold text-[#8b261b]">
              <span>10문항 / 콤보 보너스</span>
              <span className="group-hover:translate-x-1 transition-transform">도전하기 ➔</span>
            </div>
          </div>

          {/* Game 2: Sentence Completion Relay */}
          <div 
            onClick={() => { sounds.playClick(); onSelectGame('relay'); }}
            className="hanji-card p-6 rounded-2xl cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-200 border-2 border-[#d4c29d] hover:border-[#1b4965] flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-12 h-12 rounded-xl bg-blue-100 text-[#1b4965] flex items-center justify-center text-2xl border border-blue-300 shadow-sm">
                  📖
                </span>
                <span className="bg-[#1b4965]/10 text-[#1b4965] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> 스토리 완성
                </span>
              </div>
              <h4 className="text-xl font-bold text-[#2c221e] group-hover:text-[#1b4965] transition-colors">
                ② 문장 완성 릴레이
              </h4>
              <p className="text-xs text-[#5c3d2e] mt-2 leading-relaxed">
                자주 틀리는 맞춤법으로 문장 뒷부분을 올바르게 완성하여 유쾌한 이야기를 이어가세요!
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#d4c29d]/60 flex items-center justify-between text-xs font-bold text-[#1b4965]">
              <span>이야기 릴레이 / 보너스</span>
              <span className="group-hover:translate-x-1 transition-transform">도전하기 ➔</span>
            </div>
          </div>

          {/* Game 3: Falling Words Catch */}
          <div 
            onClick={() => { sounds.playClick(); onSelectGame('falling'); }}
            className="hanji-card p-6 rounded-2xl cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-200 border-2 border-[#d4c29d] hover:border-[#2d6a4f] flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-12 h-12 rounded-xl bg-emerald-100 text-[#2d6a4f] flex items-center justify-center text-2xl border border-emerald-300 shadow-sm">
                  🧺
                </span>
                <span className="bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  🎮 아케이드
                </span>
              </div>
              <h4 className="text-xl font-bold text-[#2c221e] group-hover:text-[#2d6a4f] transition-colors">
                ③ 낙하 단어 잡기
              </h4>
              <p className="text-xs text-[#5c3d2e] mt-2 leading-relaxed">
                하늘에서 떨어지는 단어 중 맞는 표기만 바구니로 받으세요! 틀린 단어는 피하기!
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#d4c29d]/60 flex items-center justify-between text-xs font-bold text-[#2d6a4f]">
              <span>생명 3개 / 무한 서바이벌</span>
              <span className="group-hover:translate-x-1 transition-transform">도전하기 ➔</span>
            </div>
          </div>

        </div>
      </div>

      {/* Hall of Fame Banner */}
      <div 
        onClick={() => { sounds.playClick(); onOpenRanking(); }}
        className="bg-gradient-to-r from-[#2c221e] to-[#42322c] text-amber-100 p-5 rounded-2xl cursor-pointer hover:opacity-95 transition-opacity flex items-center justify-between border-2 border-[#d99b26]"
      >
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-[#f3b61f]" />
          <div>
            <h4 className="text-lg font-bold text-[#f3b61f]">집현전 명예의 전당</h4>
            <p className="text-xs text-amber-200/80">최고 점수 랭킹과 누적 도전왕 랭킹을 확인해보세요!</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-[#f3b61f]" />
      </div>

    </div>
  );
}
