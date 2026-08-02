import React, { useState, useEffect } from 'react';
import { Crown, Trophy, Medal, Flame, Home, RefreshCw, UserCheck } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function RankingView({ user, onGoHome }) {
  const [activeTab, setActiveTab] = useState('boss'); // 'boss' | 'play'
  const [bossRankings, setBossRankings] = useState([]);
  const [playRankings, setPlayRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rankings');
      const data = await res.json();
      if (data) {
        setBossRankings(data.bossRankings || []);
        setPlayRankings(data.playRankings || []);
      }
    } catch (err) {
      console.error("Failed to fetch rankings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const getRankBadge = (index) => {
    if (index === 0) return <span className="text-2xl">🥇</span>;
    if (index === 1) return <span className="text-2xl">🥈</span>;
    if (index === 2) return <span className="text-2xl">🥉</span>;
    return <span className="font-bold text-[#8b261b] text-base w-7 h-7 rounded-full bg-[#ede1c9] flex items-center justify-center border border-[#c7b38d]">{index + 1}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ede1c9] hover:bg-[#e2d3b5] text-[#2c221e] rounded-lg text-sm font-bold border border-[#c7b38d]"
        >
          <Home className="w-4 h-4" /> 로비로 이동
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { sounds.playClick(); fetchRankings(); }}
            className="p-2 bg-[#ede1c9] hover:bg-[#e2d3b5] text-[#2c221e] rounded-lg border border-[#c7b38d]"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Title Panel */}
      <div className="scroll-panel p-6 sm:p-8 rounded-2xl shadow-xl text-center space-y-6">
        
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#8b261b] text-amber-300 text-3xl shadow-lg border-2 border-amber-400">
          👑
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#8b261b]">
            집현전 명예의 전당
          </h2>
          <p className="text-xs sm:text-sm text-[#5c3d2e] mt-1 font-semibold">
            최고의 맞춤법 실력자와 열정 최고의 학사 랭킹입니다.
          </p>
        </div>

        {/* 2 Tabs Selection */}
        <div className="flex bg-[#ede1c9] p-1.5 rounded-xl border border-[#c7b38d] max-w-md mx-auto">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('boss'); }}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'boss'
                ? 'bg-[#8b261b] text-amber-100 shadow-md'
                : 'text-[#5c3d2e] hover:text-[#2c221e]'
            }`}
          >
            <Trophy className="w-4 h-4" /> 탭 A. 세종대왕 대결 최고점
          </button>

          <button
            onClick={() => { sounds.playClick(); setActiveTab('play'); }}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'play'
                ? 'bg-[#1b4965] text-amber-100 shadow-md'
                : 'text-[#5c3d2e] hover:text-[#2c221e]'
            }`}
          >
            <Flame className="w-4 h-4" /> 탭 B. 열정 도전 횟수 왕
          </button>
        </div>

        {/* Rankings Table / Cards */}
        {loading ? (
          <div className="py-12 text-[#8b261b] font-bold">랭킹 데이터를 불러오는 중...</div>
        ) : (
          <div className="space-y-3 text-left">
            {activeTab === 'boss' ? (
              /* TAB A: BOSS HIGH SCORES */
              bossRankings.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-medium">
                  아직 세종대왕 보스전에 성공한 학사가 없습니다. 첫 도전자가 되어보세요!
                </div>
              ) : (
                bossRankings.map((item, idx) => {
                  const isCurrentUser = user && user.nickname.toLowerCase() === item.nickname.toLowerCase();
                  return (
                    <div
                      key={item.id || idx}
                      className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                        idx === 0 ? 'bg-gradient-to-r from-amber-100 to-yellow-50 border-amber-400 shadow-md scale-[1.02]' :
                        idx === 1 ? 'bg-gradient-to-r from-slate-100 to-gray-50 border-slate-300' :
                        idx === 2 ? 'bg-gradient-to-r from-orange-100 to-amber-50 border-amber-600/40' :
                        isCurrentUser ? 'bg-rose-50 border-[#8b261b]' : 'bg-[#fbf7ee] border-[#c7b38d]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8">
                          {getRankBadge(idx)}
                        </div>
                        <div>
                          <div className="font-extrabold text-[#2c221e] text-base flex items-center gap-2">
                            <span>{item.nickname}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] bg-[#8b261b] text-white px-2 py-0.5 rounded-full">나</span>
                            )}
                          </div>
                          <p className="text-xs text-[#5c3d2e]">
                            보유 엽전: {item.gold} G | 보스전 {item.boss_play_count || 0}회 도전
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-lg text-[#8b261b]">
                          {item.boss_high_score} / 10 정답
                        </div>
                        <p className="text-xs text-gray-500">
                          {item.boss_fastest_time}초 소요
                        </p>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* TAB B: TOTAL PLAY COUNT */
              playRankings.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-medium">
                  아직 도전 기록이 없습니다.
                </div>
              ) : (
                playRankings.map((item, idx) => {
                  const isCurrentUser = user && user.nickname.toLowerCase() === item.nickname.toLowerCase();
                  return (
                    <div
                      key={item.id || idx}
                      className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                        idx === 0 ? 'bg-gradient-to-r from-amber-100 to-yellow-50 border-amber-400 shadow-md scale-[1.02]' :
                        idx === 1 ? 'bg-gradient-to-r from-slate-100 to-gray-50 border-slate-300' :
                        idx === 2 ? 'bg-gradient-to-r from-orange-100 to-amber-50 border-amber-600/40' :
                        isCurrentUser ? 'bg-blue-50 border-[#1b4965]' : 'bg-[#fbf7ee] border-[#c7b38d]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8">
                          {getRankBadge(idx)}
                        </div>
                        <div>
                          <div className="font-extrabold text-[#2c221e] text-base flex items-center gap-2">
                            <span>{item.nickname}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] bg-[#1b4965] text-white px-2 py-0.5 rounded-full">나</span>
                            )}
                          </div>
                          <p className="text-xs text-[#5c3d2e]">
                            보유 엽전: {item.gold} G
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-lg text-[#1b4965]">
                          총 {item.total_play_count}회 플레이
                        </div>
                        <p className="text-xs text-gray-500">
                          열정 학사 훈장 🎖️
                        </p>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        )}

      </div>

    </div>
  );
}
