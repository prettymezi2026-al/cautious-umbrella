import React, { useState, useEffect, useRef } from 'react';
import { Clock, Zap, Award, RotateCcw, Home, CheckCircle2, XCircle, Sparkles, Coins } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function GameDictation({ user, quizData, onFinish, onGoHome }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(8);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalGold, setTotalGold] = useState(0);
  const [feedback, setFeedback] = useState(null); // { isCorrect, tip }
  const [isGameOver, setIsGameOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef(null);

  // Initialize session with 10 random questions
  useEffect(() => {
    if (quizData && quizData.questions && quizData.questions.length > 0) {
      const shuffled = [...quizData.questions].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 10));
    }
  }, [quizData]);

  // Timer loop for active question
  useEffect(() => {
    if (isGameOver || feedback !== null || questions.length === 0) return;

    setTimeLeft(8);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, feedback, isGameOver, questions]);

  const handleTimeOut = () => {
    sounds.playWrong();
    setCombo(0);
    setFeedback({
      isCorrect: false,
      tip: `시간 초과! 정답은 '${questions[currentIndex]?.answer}'입니다. ${questions[currentIndex]?.tip}`
    });
  };

  const handleSelectOption = (option) => {
    if (feedback !== null) return;
    clearInterval(timerRef.current);

    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.answer;

    if (isCorrect) {
      sounds.playCorrect();
      const speedBonus = timeLeft; // 1 ~ 8 bonus
      const newCombo = combo + 1;
      const comboBonus = newCombo >= 3 ? 5 : 0;
      const earned = 10 + speedBonus + comboBonus;

      if (newCombo >= 3) {
        sounds.playCombo();
      }

      setScore((prev) => prev + 1);
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      setTotalGold((prev) => prev + earned);

      setFeedback({
        isCorrect: true,
        earned,
        speedBonus,
        comboBonus,
        tip: currentQ.tip
      });
    } else {
      sounds.playWrong();
      setCombo(0);
      setFeedback({
        isCorrect: false,
        tip: `아쉽네요! 정답은 '${currentQ.answer}'입니다. ${currentQ.tip}`
      });
    }
  };

  const handleNextQuestion = () => {
    sounds.playClick();
    setFeedback(null);
    setSelectedOption(null);

    if (currentIndex + 1 >= questions.length) {
      finishGame();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const finishGame = async () => {
    setIsGameOver(true);
    setIsSaving(true);

    try {
      const res = await fetch('/api/user/gold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: user.nickname,
          goldEarned: totalGold,
          gameType: 'dictation'
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        onFinish(data.user);
      }
    } catch (err) {
      console.error("Failed to update gold:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (questions.length === 0) {
    return <div className="text-center p-8 text-[#8b261b]">문제를 불러오는 중입니다...</div>;
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ede1c9] hover:bg-[#e2d3b5] text-[#2c221e] rounded-lg text-sm font-bold border border-[#c7b38d]"
        >
          <Home className="w-4 h-4" /> 메인으로
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#8b261b]">
            <Award className="w-4 h-4" /> 문제 {currentIndex + 1} / 10
          </div>
          <div className="gold-badge px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-900" /> +{totalGold} G
          </div>
        </div>
      </div>

      {/* Main Game Card */}
      {!isGameOver ? (
        <div className="scroll-panel p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
          
          {/* Progress Bar & Timer */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="flex items-center gap-1 text-[#8b261b]">
                <Clock className="w-4 h-4" /> 제한시간
              </span>
              <span className={`text-lg font-black ${timeLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-[#8b261b]'}`}>
                {timeLeft}초
              </span>
            </div>

            {/* Time Bar */}
            <div className="w-full h-3 bg-[#d4c29d] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 3 ? 'bg-red-600' : 'bg-gradient-to-r from-amber-500 to-amber-600'
                }`}
                style={{ width: `${(timeLeft / 8) * 100}%` }}
              />
            </div>
          </div>

          {/* Combo Indicator Banner */}
          {combo >= 2 && (
            <div className="bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 animate-bounce">
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
              🔥 {combo} 연속 정답! (콤보 보너스 골드 지급 중!)
            </div>
          )}

          {/* Sentence Display */}
          <div className="bg-[#fbf7ee] p-6 sm:p-8 rounded-xl border-2 border-[#c7b38d] text-center shadow-inner">
            <h3 className="text-xl sm:text-2xl font-bold leading-relaxed text-[#2c221e]">
              {currentQ?.sentence.replace('{blank}', ' [  ?  ] ')}
            </h3>
          </div>

          {/* Options Grid */}
          <div className={`grid ${currentQ?.options.length > 2 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'} gap-4`}>
            {currentQ?.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={feedback !== null}
                onClick={() => handleSelectOption(opt)}
                className="py-4 px-6 bg-[#ede1c9] hover:bg-[#e5d4b4] active:bg-[#d8c49f] disabled:opacity-60 text-[#2c221e] text-xl font-bold rounded-xl border-2 border-[#bfa980] hover:border-[#8b261b] shadow-md transition-all duration-150 flex items-center justify-center gap-2"
              >
                <span>{opt}</span>
              </button>
            ))}
          </div>

          {/* Feedback & Explanation Modal/Banner */}
          {feedback && (
            <div className={`p-4 rounded-xl border-2 animate-fade-in ${
              feedback.isCorrect 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-start gap-3">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-extrabold text-base flex items-center gap-2">
                    {feedback.isCorrect ? '정답입니다! 👏' : '틀렸습니다!'}
                    {feedback.isCorrect && (
                      <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                        +{feedback.earned} Gold (스피드 {feedback.speedBonus}G {feedback.comboBonus ? `+ 콤보 ${feedback.comboBonus}G` : ''})
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed opacity-90 font-medium">
                    💡 <strong>도움말:</strong> {feedback.tip}
                  </p>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="mt-4 w-full py-2.5 btn-joseon-primary rounded-lg text-sm font-bold shadow"
              >
                {currentIndex + 1 >= questions.length ? '결과 확인하기 ➔' : '다음 문제 ➔'}
              </button>
            </div>
          )}

        </div>
      ) : (
        /* GAME OVER SUMMARY CARD */
        <div className="scroll-panel p-8 rounded-2xl shadow-2xl text-center space-y-6 animate-scale-up">
          <div className="w-20 h-20 rounded-full bg-[#8b261b] text-amber-300 flex items-center justify-center text-4xl mx-auto shadow-lg border-2 border-amber-400">
            🎯
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#8b261b]">
              받아쓰기 배틀 완료!
            </h3>
            <p className="text-sm text-[#5c3d2e] mt-1 font-semibold">
              수고하셨습니다, {user.nickname} 학사님!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-[#ede1c9] p-4 rounded-xl border border-[#d4c29d]">
            <div>
              <p className="text-xs text-[#5c3d2e]">정답 맞힌 수</p>
              <p className="text-xl font-extrabold text-[#8b261b]">{score} / 10</p>
            </div>
            <div>
              <p className="text-xs text-[#5c3d2e]">최대 콤보</p>
              <p className="text-xl font-extrabold text-[#1b4965]">{maxCombo}회</p>
            </div>
            <div>
              <p className="text-xs text-[#5c3d2e]">획득 엽전</p>
              <p className="text-xl font-extrabold text-[#d99b26]">+{totalGold} G</p>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => {
                setQuestions([...quizData.questions].sort(() => 0.5 - Math.random()).slice(0, 10));
                setCurrentIndex(0);
                setScore(0);
                setCombo(0);
                setMaxCombo(0);
                setTotalGold(0);
                setFeedback(null);
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
