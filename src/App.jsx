import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import Dashboard from './components/Dashboard';
import GameDictation from './components/GameDictation';
import GameSentenceRelay from './components/GameSentenceRelay';
import GameFallingWords from './components/GameFallingWords';
import BossDuel from './components/BossDuel';
import RankingView from './components/RankingView';

export default function App() {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [quizData, setQuizData] = useState({ questions: [], relayStories: [] });
  const [muted, setMuted] = useState(false);

  // Fetch Quiz Data & Check Auto Login on Mount
  useEffect(() => {
    // 1. Fetch Quiz Data
    fetch('/api/quiz')
      .then((res) => res.json())
      .then((data) => setQuizData(data))
      .catch((err) => console.error("Quiz data fetch error:", err));

    // 2. Auto Login if Nickname saved in localStorage
    const savedNick = localStorage.getItem('jiphyeonjeon_student_nickname');
    if (savedNick) {
      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: savedNick })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setShowLoginModal(true);
          }
        })
        .catch(() => setShowLoginModal(true));
    } else {
      setShowLoginModal(true);
    }
  }, []);

  // Update user state and persist nickname
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('jiphyeonjeon_student_nickname', userData.nickname);
    setShowLoginModal(false);
    setCurrentView('dashboard');
  };

  const handleSwitchUser = () => {
    localStorage.removeItem('jiphyeonjeon_student_nickname');
    setUser(null);
    setShowLoginModal(true);
  };

  const handleUserUpdated = (updatedUser) => {
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf7ee] text-[#2c221e]">
      
      {/* Navbar */}
      <Navbar
        user={user}
        onOpenRanking={() => setCurrentView('ranking')}
        onSwitchUser={handleSwitchUser}
        muted={muted}
        setMuted={setMuted}
        onGoHome={() => setCurrentView('dashboard')}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-12">
        {user ? (
          <>
            {currentView === 'dashboard' && (
              <Dashboard
                user={user}
                onSelectGame={(gameType) => setCurrentView(gameType)}
                onOpenBoss={() => setCurrentView('boss')}
                onOpenRanking={() => setCurrentView('ranking')}
              />
            )}

            {currentView === 'dictation' && (
              <GameDictation
                user={user}
                quizData={quizData}
                onFinish={handleUserUpdated}
                onGoHome={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'relay' && (
              <GameSentenceRelay
                user={user}
                quizData={quizData}
                onFinish={handleUserUpdated}
                onGoHome={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'falling' && (
              <GameFallingWords
                user={user}
                quizData={quizData}
                onFinish={handleUserUpdated}
                onGoHome={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'boss' && (
              <BossDuel
                user={user}
                quizData={quizData}
                onFinish={handleUserUpdated}
                onGoHome={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'ranking' && (
              <RankingView
                user={user}
                onGoHome={() => setCurrentView('dashboard')}
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-[#8b261b] font-bold">집현전에 접속 중입니다...</p>
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onLogin={handleLogin} />
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#5c3d2e]/70 border-t border-[#d4c29d] bg-[#f5edd6]">
        <p>집현전 맞춤법 대결 © 2026 초등 국어 맞춤법 학습 프로젝트</p>
      </footer>

    </div>
  );
}
