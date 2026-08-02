import React, { useState, useEffect, useRef } from 'react';
import { Heart, Home, RotateCcw, Coins, Sparkles, Send, Keyboard, CheckCircle2, XCircle } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function GameFallingWords({ user, quizData, onFinish, onGoHome }) {
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [totalGold, setTotalGold] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [fallingWords, setFallingWords] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedbackEffect, setFeedbackEffect] = useState(null);

  const requestRef = useRef();
  const lastSpawnTime = useRef(Date.now());
  const speedRef = useRef(0.25); // Gentle, comfortable falling speed!
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const inputRef = useRef(null);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  // Focus input automatically
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isGameOver]);

  // Game Loop
  useEffect(() => {
    if (isGameOver || !quizData || !quizData.questions) return;

    // Prepare pool of words with correct & wrong spelling options
    const wordPool = [];
    quizData.questions.forEach((q) => {
      wordPool.push({
        displayedText: q.sentence.replace('{blank}', `[ ${q.options.join('/')} ]`),
        correctAnswer: q.answer,
        options: q.options,
        tip: q.tip
      });
    });

    const timerInterval = setInterval(() => {
      setSurvivalTime((prev) => prev + 1);
    }, 1000);

    const updateLoop = () => {
      const now = Date.now();

      // Spawn falling word cloud every 3.5 seconds (gentle pace)
      if (now - lastSpawnTime.current > 3500) {
        lastSpawnTime.current = now;
        const randomItem = wordPool[Math.floor(Math.random() * wordPool.length)];
        
        setFallingWords((prev) => [
          ...prev,
          {
            id: 'w_' + Date.now() + '_' + Math.random(),
            sentence: randomItem.displayedText,
            correctAnswer: randomItem.correctAnswer,
            options: randomItem.options,
            tip: randomItem.tip,
            x: 10 + Math.random() * 70, // percentage 10% ~ 80%
            y: 0,
            speed: speedRef.current
          }
        ]);
      }

      // Move words down & check ground collision
      setFallingWords((prev) => {
        const nextWords = [];

        for (let word of prev) {
          const newY = word.y + word.speed;

          // Hit ground (y >= 88%) -> Missed!
          if (newY >= 88) {
            sounds.playWrong();
            livesRef.current -= 1;
            setLives(livesRef.current);
            setFeedbackEffect({ type: 'wrong', msg: `시간 초과! 올바른 표기는 '${word.correctAnswer}'` });
            setTimeout(() => setFeedbackEffect(null), 1200);

            if (livesRef.current <= 0) {
              endGame();
              return [];
            }
            continue; // Remove word
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

  // Submit Answer
  const handleCheckAnswer = (answerText) => {
    if (isGameOver || !answerText || fallingWords.length === 0) return;

    const targetAnswer = answerText.trim();
    // Match against lowest falling word matching the correct answer
    const matchIndex = fallingWords.findIndex(
      (w) => w.correctAnswer.toLowerCase() === targetAnswer.toLowerCase()
    );

    if (matchIndex !== -1) {
      // CORRECT!
      sounds.playCorrect();
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setTotalGold((prev) => prev + 10);
      setFeedbackEffect({ type: 'correct', msg: `정답! (+10 G)` });
      setTimeout(() => setFeedbackEffect(null), 800);

      // Remove popped word
      setFallingWords((prev) => prev.filter((_, idx) => idx !== matchIndex));
      setInputValue('');
    } else {
      // WRONG ANSWER INPUT!
      sounds.playWrong();
      livesRef.current -= 1;
      setLives(livesRef.current);
      setFeedbackEffect({ type: 'wrong', msg: `오답입니다! (틀린 입력: ${targetAnswer})` });
      setTimeout(() => setFeedbackEffect(null), 1200);
      setInputValue('');

      if (livesRef.current <= 0) {
        endGame();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCheckAnswer(inputValue);
  };

  const endGame = async () => {
    setIsGameOver(true);
    sounds.playFanfare();

    const earnedGold = (scoreRef.current * 10) + Math.floor(survivalTime / 3);
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
            정답 수: {score}개 ({survivalTime}초)
          </div>
        </div>
      </div>

      {!isGameOver ? (
        <div className="space-y-4">
          
          {/* Main Falling Screen */}
          <div className={`relative w-full h-[400px] bg-gradient-to-b from-[#fbf7ee] via-[#ede1c9] to-[#d4c29d] rounded-2xl border-4 overflow-hidden shadow-2xl transition-colors ${
            feedbackEffect?.type === 'wrong' ? 'border-red-500 bg-rose-100/50' : 
            feedbackEffect?.type === 'correct' ? 'border-emerald-500 bg-emerald-100/30' : 'border-[#2d6a4f]'
          }`}>
            
            {/* Ground Line Danger Zone */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-red-900/10 border-t-2 border-red-500/40 flex items-center justify-center text-xs font-bold text-red-700/80">
              ⚠️ 바닥에 닿기 전에 올바른 맞춤법을 입력하세요!
            </div>

            {/* Falling Word Clouds */}
            {fallingWords.map((word) => (
              <div
                key={word.id}
                className="absolute transform -translate-x-1/2 px-4 py-2.5 bg-[#fbf7ee] text-[#2c221e] font-extrabold text-base sm:text-lg rounded-2xl border-2 border-[#8b261b] shadow-lg animate-float"
                style={{
                  left: `${word.x}%`,
                  top: `${word.y}%`
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-[#8b261b]">{word.sentence}</span>
                  <div className="flex gap-1.5 mt-1">
                    {word.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCheckAnswer(opt)}
                        className="px-2.5 py-0.5 bg-[#ede1c9] hover:bg-amber-200 text-[#8b261b] text-xs font-black rounded-lg border border-[#bfa980] shadow-sm"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Feedback Floating Banner */}
            {feedbackEffect && (
              <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full font-bold text-sm shadow-xl z-20 animate-bounce ${
                feedbackEffect.type === 'correct' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {feedbackEffect.msg}
              </div>
            )}
          </div>

          {/* Typing & Option Controls Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="내려오는 단어의 올바른 맞춤법 입력 (예: 돼 / 오랜만 / 안)"
                className="w-full px-4 py-3.5 bg-[#fbf7ee] border-2 border-[#c7b38d] rounded-xl text-[#2c221e] font-bold text-lg focus:outline-none focus:border-[#2d6a4f] shadow-inner"
              />
              <Keyboard className="absolute right-3.5 top-3.5 w-5 h-5 text-gray-400" />
            </div>

            <button
              type="submit"
              className="px-6 py-3.5 bg-[#2d6a4f] hover:bg-[#23533e] text-white font-extrabold rounded-xl text-lg shadow-lg flex items-center gap-1.5"
            >
              <Send className="w-5 h-5" /> 입력
            </button>
          </form>

        </div>
      ) : (
        /* GAME OVER SUMMARY */
        <div className="scroll-panel p-8 rounded-2xl shadow-2xl text-center space-y-6 animate-scale-up">
          <div className="w-20 h-20 rounded-full bg-[#2d6a4f] text-amber-300 flex items-center justify-center text-4xl mx-auto shadow-lg border-2 border-amber-400">
            ✍️
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#2d6a4f]">
              맞춤법 낙하 잡기 종료!
            </h3>
            <p className="text-sm text-[#5c3d2e] mt-1 font-semibold">
              3번의 틀린 입력으로 게임이 종료되었습니다.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-[#ede1c9] p-4 rounded-xl border border-[#d4c29d]">
            <div>
              <p className="text-xs text-[#5c3d2e]">맞힌 수</p>
              <p className="text-xl font-extrabold text-[#2d6a4f]">{score}개</p>
            </div>
            <div>
              <p className="text-xs text-[#5c3d2e]">버틴 시간</p>
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
                setFallingWords([]);
                setInputValue('');
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
