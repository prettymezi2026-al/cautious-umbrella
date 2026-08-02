import React, { useState, useEffect, useRef } from 'react';
import { Heart, Home, RotateCcw, ArrowLeft, ArrowRight, Coins, ShieldAlert, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function GameFallingWords({ user, quizData, onFinish, onGoHome }) {
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [totalGold, setTotalGold] = useState(0);
  const [basketPos, setBasketPos] = useState(50); // percentage (0 to 100)
  const [fallingWords, setFallingWords] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedbackEffect, setFeedbackEffect] = useState(null); // 'correct' | 'wrong'

  const requestRef = useRef();
  const lastSpawnTime = useRef(Date.now());
  const speedRef = useRef(1.2); // Base speed
  const basketPosRef = useRef(50);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);

  // Sync ref
  useEffect(() => {
    basketPosRef.current = basketPos;
  }, [basketPos]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setBasketPos((prev) => Math.max(5, prev - 8));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setBasketPos((prev) => Math.min(95, prev + 8));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver]);

  // Game Loop
  useEffect(() => {
    if (isGameOver || !quizData || !quizData.questions) return;

    // Generate word pool of correct & incorrect words
    const wordPool = [];
    quizData.questions.forEach((q) => {
      wordPool.push({ text: q.answer, isCorrect: true, tip: q.tip });
      q.options.forEach((opt) => {
        if (opt !== q.answer) {
          wordPool.push({ text: opt, isCorrect: false, tip: q.tip });
        }
      });
    });

    const timerInterval = setInterval(() => {
      setSurvivalTime((prev) => prev + 1);
      // Gradually increase falling speed over time
      speedRef.current += 0.05;
    }, 1000);

    const updateLoop = () => {
      const now = Date.now();

      // Spawn new falling word every 1.8s ~ 2.5s
      if (now - lastSpawnTime.current > Math.max(900, 2200 - speedRef.current * 150)) {
        lastSpawnTime.current = now;
        const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
        
        setFallingWords((prev) => [
          ...prev,
          {
            id: 'w_' + Date.now() + '_' + Math.random(),
            text: randomWord.text,
            isCorrect: randomWord.isCorrect,
            x: 10 + Math.random() * 80, // percentage 10% to 90%
            y: 0,
            speed: (0.6 + Math.random() * 0.4) * speedRef.current
          }
        ]);
      }

      // Move falling words down & collision check
      setFallingWords((prev) => {
        const nextWords = [];

        for (let word of prev) {
          const newY = word.y + word.speed;

          // Catch check near bottom (y >= 82% and y <= 92%)
          if (newY >= 82 && newY <= 92) {
            const distance = Math.abs(word.x - basketPosRef.current);
            if (distance < 12) {
              // CAUGHT BY BASKET!
              if (word.isCorrect) {
                sounds.playCorrect();
                scoreRef.current += 1;
                setScore(scoreRef.current);
                setFeedbackEffect('correct');
                setTimeout(() => setFeedbackEffect(null), 300);
              } else {
                sounds.playWrong();
                livesRef.current -= 1;
                setLives(livesRef.current);
                setFeedbackEffect('wrong');
                setTimeout(() => setFeedbackEffect(null), 300);
                if (livesRef.current <= 0) {
                  endGame();
                  return [];
                }
              }
              continue; // remove caught word
            }
          }

          // Missed word check (reached bottom y > 95%)
          if (newY > 95) {
            if (word.isCorrect) {
              // Missed a CORRECT word -> lose life!
              sounds.playWrong();
              livesRef.current -= 1;
              setLives(livesRef.current);
              setFeedbackEffect('wrong');
              setTimeout(() => setFeedbackEffect(null), 300);
              if (livesRef.current <= 0) {
                endGame();
                return [];
              }
            }
            continue; // remove word
          }

          nextWords.push({ ...word, y: newY });
        }

        return nextWords;
      });

      if (livesRef.current > 0) {
        requestRef.current = requestAnimationFrame(updateLoop);
      }
    };

    requestRef.current = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(requestRef.current);
      clearInterval(timerInterval);
    };
  }, [quizData, isGameOver]);

  const endGame = async () => {
    setIsGameOver(true);
    sounds.playFanfare();

    // Calculate total gold (Score * 8 + Survival seconds * 1)
    const earnedGold = (scoreRef.current * 8) + Math.floor(survivalTime / 2);
    setTotalGold(earnedGold);

    try {
      await fetch('/api/user/gold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: user.nickname,
          goldEarned: earnedGold,
          gameType: 'falling'
        })
      });
      onFinish();
    } catch (err) {
      console.error("Falling game gold save failed:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ede1c9] hover:bg-[#e2d3b5] text-[#2c221e] rounded-lg text-sm font-bold border border-[#c7b38d]"
        >
          <Home className="w-4 h-4" /> 메인으로
        </button>

        {/* Lives & Score */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((h) => (
              <Heart
                key={h}
                className={`w-6 h-6 transition-all ${
                  h <= lives ? 'text-red-500 fill-red-500 animate-pulse' : 'text-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="text-sm font-black text-[#2d6a4f]">
            잡은 단어: {score}개 ({survivalTime}초 생존)
          </div>
        </div>
      </div>

      {!isGameOver ? (
        <div className="space-y-4">
          
          {/* Main Game Screen Board */}
          <div className={`relative w-full h-[450px] bg-gradient-to-b from-[#fbf7ee] to-[#ede1c9] rounded-2xl border-4 overflow-hidden shadow-2xl transition-colors ${
            feedbackEffect === 'wrong' ? 'border-red-500 bg-rose-100/50' : 
            feedbackEffect === 'correct' ? 'border-emerald-500 bg-emerald-100/30' : 'border-[#2d6a4f]'
          }`}>
            
            {/* Falling Words */}
            {fallingWords.map((word) => (
              <div
                key={word.id}
                className="absolute transform -translate-x-1/2 px-4 py-2 bg-[#f5edd6] text-[#2c221e] font-extrabold text-lg sm:text-xl rounded-xl border-2 border-[#8b261b] shadow-md pointer-events-none select-none transition-transform"
                style={{
                  left: `${word.x}%`,
                  top: `${word.y}%`
                }}
              >
                {word.text}
              </div>
            ))}

            {/* Scholar Basket Character at Bottom */}
            <div
              className="absolute bottom-3 transform -translate-x-1/2 flex flex-col items-center transition-all duration-75"
              style={{ left: `${basketPos}%` }}
            >
              {/* Basket Icon */}
              <div className="w-20 h-10 bg-gradient-to-r from-amber-600 to-amber-700 rounded-t-2xl border-2 border-amber-900 shadow-xl flex items-center justify-center text-[#fbf7ee] text-xs font-bold">
                🧺 올바른 한글
              </div>
              {/* Scholar Avatar */}
              <div className="text-2xl -mt-1">
                🧑‍🎓
              </div>
            </div>

            {/* Game Instructions Overlay */}
            <div className="absolute top-2 left-2 text-xs font-bold text-[#5c3d2e] bg-[#fbf7ee]/80 px-3 py-1 rounded-full border border-[#c7b38d]">
              💡 <strong>올바른 맞춤법만</strong> 받아내세요!
            </div>
          </div>

          {/* Mobile & Touch Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setBasketPos((prev) => Math.max(5, prev - 12))}
              className="flex-1 py-4 bg-[#2d6a4f] hover:bg-[#23533e] active:bg-[#1a3d2e] text-white rounded-xl font-extrabold text-lg flex items-center justify-center gap-2 shadow-lg"
            >
              <ArrowLeft className="w-6 h-6" /> 왼쪽 이동
            </button>
            <button
              onClick={() => setBasketPos((prev) => Math.min(95, prev + 12))}
              className="flex-1 py-4 bg-[#2d6a4f] hover:bg-[#23533e] active:bg-[#1a3d2e] text-white rounded-xl font-extrabold text-lg flex items-center justify-center gap-2 shadow-lg"
            >
              오른쪽 이동 <ArrowRight className="w-6 h-6" />
            </button>
          </div>

        </div>
      ) : (
        /* GAME OVER SUMMARY */
        <div className="scroll-panel p-8 rounded-2xl shadow-2xl text-center space-y-6 animate-scale-up">
          <div className="w-20 h-20 rounded-full bg-[#2d6a4f] text-amber-300 flex items-center justify-center text-4xl mx-auto shadow-lg border-2 border-amber-400">
            🧺
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#2d6a4f]">
              낙하 단어 잡기 종료!
            </h3>
            <p className="text-sm text-[#5c3d2e] mt-1 font-semibold">
              {user.nickname} 학사님의 순발력이 빛났습니다!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-[#ede1c9] p-4 rounded-xl border border-[#d4c29d]">
            <div>
              <p className="text-xs text-[#5c3d2e]">잡은 단어 수</p>
              <p className="text-xl font-extrabold text-[#2d6a4f]">{score}개</p>
            </div>
            <div>
              <p className="text-xs text-[#5c3d2e]">생존 시간</p>
              <p className="text-xl font-extrabold text-[#1b4965]">{survivalTime}초</p>
            </div>
            <div>
              <p className="text-xs text-[#5c3d2e]">획득 엽전</p>
              <p className="text-xl font-extrabold text-[#d99b26]">+{totalGold} G</p>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => {
                setLives(3);
                setScore(0);
                setSurvivalTime(0);
                setTotalGold(0);
                setBasketPos(50);
                setFallingWords([]);
                speedRef.current = 1.2;
                scoreRef.current = 0;
                livesRef.current = 3;
                setIsGameOver(false);
              }}
              className="flex-1 py-3 bg-[#ede1c9] hover:bg-[#e2d3b5] text-[#2c221e] rounded-xl font-bold text-sm border border-[#c7b38d] flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> 다시 하기
            </button>
            <button
              onClick={onGoHome}
              className="flex-1 py-3 btn-joseon-primary rounded-xl font-bold text-sm flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" /> 로비로 이동
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
