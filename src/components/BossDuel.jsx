import React, { useState, useEffect, useRef } from 'react';
import { Crown, Sparkles, Award, RotateCcw, Home, Clock, CheckCircle2, XCircle, Scroll, ShieldCheck, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

export default function BossDuel({ user, quizData, onFinish, onGoHome }) {
  const [difficulty, setDifficulty] = useState(null); // 'easy' | 'normal' | 'hard'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studentScore, setStudentScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isMatchFinished, setIsMatchFinished] = useState(false);
  const [matchResult, setMatchResult] = useState(null); // { isWin, title, certificate }
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef(null);
  const aiTimerRef = useRef(null);
  const startTimeRef = useRef(0);

  // Difficulty Sejong AI accuracies:
  // Easy: 70%, Normal: 85%, Hard: 95%
  const getAiAccuracy = (diff) => {
    if (diff === 'easy') return 0.70;
    if (diff === 'normal') return 0.85;
    return 0.95;
  };

  const handleStartMatch = (selectedDiff) => {
    sounds.playClick();
    setDifficulty(selectedDiff);

    // Pick 10 questions for boss fight
    const shuffled = [...quizData.questions].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setStudentScore(0);
    setAiScore(0);
    setTimeSeconds(0);
    setFeedback(null);
    setIsMatchFinished(false);

    startTimeRef.current = Date.now();

    // Start match stopwatch timer
    timerRef.current = setInterval(() => {
      setTimeSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Start Sejong AI automatic answering loop
    const aiAcc = getAiAccuracy(selectedDiff);
    let currentAiScore = 0;

    aiTimerRef.current = setInterval(() => {
      // AI attempts every 3.5s
      const isAiCorrect = Math.random() < aiAcc;
      if (isAiCorrect && currentAiScore < 10) {
        currentAiScore += 1;
        setAiScore(currentAiScore);
      }
    }, 3500);
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(aiTimerRef.current);
    };
  }, []);

  const handleSelectOption = (option) => {
    if (feedback !== null) return;

    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.answer;

    if (isCorrect) {
      sounds.playCorrect();
      const newScore = studentScore + 1;
      setStudentScore(newScore);

      setFeedback({
        isCorrect: true,
        tip: currentQ.tip
      });

      // Check if student completed 10 questions
      if (currentIndex + 1 >= 10) {
        finishBossDuel(newScore);
      }
    } else {
      sounds.playWrong();
      setFeedback({
        isCorrect: false,
        tip: `틀렸습니다! 정답은 '${currentQ.answer}'입니다. ${currentQ.tip}`
      });

      if (currentIndex + 1 >= 10) {
        finishBossDuel(studentScore);
      }
    }
  };

  const handleNextQuestion = () => {
    sounds.playClick();
    setFeedback(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const finishBossDuel = async (finalScore) => {
    clearInterval(timerRef.current);
    clearInterval(aiTimerRef.current);

    const elapsed = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
    setTimeSeconds(elapsed);
    setIsMatchFinished(true);
    setIsSaving(true);

    const isWin = finalScore >= aiScore || finalScore >= 7;

    let grantedTitle = "집현전 참봉 학사";
    if (finalScore === 10) grantedTitle = "정삼품 맞춤법 수석 학사 👑";
    else if (finalScore >= 8) grantedTitle = "집현전 우수 학사 📜";

    if (isWin) {
      sounds.playFanfare();
      // Trigger Confetti effect
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    setMatchResult({
      isWin,
      finalScore,
      aiFinalScore: aiScore,
      elapsed,
      title: grantedTitle
    });

    try {
      // Save result to backend database (deducts 100 gold and updates boss high score)
      const res = await fetch('/api/boss/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: user.nickname,
          score: finalScore,
          timeSeconds: elapsed
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        onFinish(data.user);
      }
    } catch (err) {
      console.error("Failed to save boss result:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ede1c9] hover:bg-[#e2d3b5] text-[#2c221e] rounded-lg text-sm font-bold border border-[#c7b38d]"
        >
          <Home className="w-4 h-4" /> 로비로 돌아가기
        </button>

        {difficulty && !isMatchFinished && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm font-extrabold text-[#8b261b]">
              <Clock className="w-4 h-4" /> {timeSeconds}초 경과
            </div>
            <div className="bg-[#8b261b] text-amber-100 text-xs font-bold px-3 py-1 rounded-full">
              난이도: {difficulty === 'easy' ? '쉬움' : difficulty === 'normal' ? '보통' : '어려움'}
            </div>
          </div>
        )}
      </div>

      {/* DIFFICULTY SELECTION SCREEN */}
      {!difficulty ? (
        <div className="scroll-panel p-6 sm:p-10 rounded-2xl shadow-2xl text-center space-y-8 animate-scale-up">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8b261b] to-[#5c160e] text-amber-300 flex items-center justify-center text-4xl mx-auto shadow-xl border-2 border-amber-400">
            👑
          </div>

          <div>
            <span className="bg-[#8b261b]/10 text-[#8b261b] text-xs font-bold px-3 py-1 rounded-full border border-[#8b261b]/20">
              세종대왕 맞춤법 1:1 겨루기
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#8b261b] mt-2">
              세종대왕 AI 대결 난이도 선택
            </h2>
            <p className="text-sm text-[#5c3d2e] mt-2 max-w-lg mx-auto leading-relaxed">
              도전 시 <strong className="text-[#8b261b]">엽전 100개</strong>가 사용됩니다.<br />
              세종대왕 AI의 실력 난이도를 결정하고 대결을 시작하세요!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {/* Easy */}
            <div 
              onClick={() => handleStartMatch('easy')}
              className="hanji-card p-6 rounded-2xl cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all border-2 border-[#d4c29d] hover:border-emerald-600 text-center group"
            >
              <div className="text-3xl mb-2">🌱</div>
              <h3 className="font-bold text-lg text-[#2c221e] group-hover:text-emerald-700">쉬움</h3>
              <p className="text-xs text-gray-600 mt-1">AI 정답률 70%</p>
              <button className="mt-4 w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg group-hover:bg-emerald-700">
                도전하기
              </button>
            </div>

            {/* Normal */}
            <div 
              onClick={() => handleStartMatch('normal')}
              className="hanji-card p-6 rounded-2xl cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all border-2 border-[#d4c29d] hover:border-amber-600 text-center group"
            >
              <div className="text-3xl mb-2">📜</div>
              <h3 className="font-bold text-lg text-[#2c221e] group-hover:text-amber-700">보통</h3>
              <p className="text-xs text-gray-600 mt-1">AI 정답률 85%</p>
              <button className="mt-4 w-full py-2 bg-amber-600 text-white text-xs font-bold rounded-lg group-hover:bg-amber-700">
                도전하기
              </button>
            </div>

            {/* Hard */}
            <div 
              onClick={() => handleStartMatch('hard')}
              className="hanji-card p-6 rounded-2xl cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all border-2 border-[#d4c29d] hover:border-[#8b261b] text-center group"
            >
              <div className="text-3xl mb-2">🔥</div>
              <h3 className="font-bold text-lg text-[#2c221e] group-hover:text-[#8b261b]">어려움</h3>
              <p className="text-xs text-gray-600 mt-1">AI 정답률 95%</p>
              <button className="mt-4 w-full py-2 bg-[#8b261b] text-white text-xs font-bold rounded-lg group-hover:bg-[#a32e22]">
                도전하기
              </button>
            </div>
          </div>
        </div>
      ) : !isMatchFinished ? (
        /* ACTIVE BOSS DUEL MATCH SCREEN */
        <div className="scroll-panel p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
          
          {/* REAL TIME PROGRESS BARS (STUDENT VS SEJONG AI) */}
          <div className="bg-[#fbf7ee] p-5 rounded-xl border-2 border-[#c7b38d] space-y-4">
            
            {/* Student Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-1.5 text-[#8b261b]">
                  🧑‍🎓 {user.nickname} 학사 (나)
                </span>
                <span className="text-[#8b261b] font-black">{studentScore} / 10 문제</span>
              </div>
              <div className="w-full h-4 bg-[#ede1c9] rounded-full overflow-hidden border border-[#c7b38d]">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-[#8b261b] rounded-full transition-all duration-300"
                  style={{ width: `${(studentScore / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Sejong AI Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="flex items-center gap-1.5 text-[#1b4965]">
                  👑 세종대왕 AI
                </span>
                <span className="text-[#1b4965] font-black">{aiScore} / 10 문제</span>
              </div>
              <div className="w-full h-4 bg-[#ede1c9] rounded-full overflow-hidden border border-[#c7b38d]">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-[#1b4965] rounded-full transition-all duration-300"
                  style={{ width: `${(aiScore / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Current Question Box */}
          <div className="bg-[#ede1c9] p-6 rounded-xl border-2 border-[#d4c29d] text-center">
            <span className="bg-[#8b261b] text-amber-100 text-xs font-bold px-3 py-1 rounded-full">
              문제 {currentIndex + 1} / 10
            </span>
            <h3 className="text-xl sm:text-2xl font-bold leading-relaxed text-[#2c221e] mt-3">
              {currentQ?.sentence.replace('{blank}', ' [  ?  ] ')}
            </h3>
          </div>

          {/* Options */}
          <div className={`grid ${currentQ?.options.length > 2 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'} gap-4`}>
            {currentQ?.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={feedback !== null}
                onClick={() => handleSelectOption(opt)}
                className="py-4 px-6 bg-[#fbf7ee] hover:bg-[#ede1c9] disabled:opacity-60 text-[#2c221e] text-xl font-extrabold rounded-xl border-2 border-[#bfa980] hover:border-[#8b261b] shadow-md transition-all flex items-center justify-center"
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Feedback Banner */}
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
                <div>
                  <h4 className="font-bold">{feedback.isCorrect ? '정답입니다!' : '오답입니다!'}</h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    💡 <strong>팁:</strong> {feedback.tip}
                  </p>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="mt-4 w-full py-2.5 btn-joseon-primary rounded-lg text-sm font-bold shadow"
              >
                {currentIndex + 1 >= 10 ? '대결 결과 보기 ➔' : '다음 문제 ➔'}
              </button>
            </div>
          )}

        </div>
      ) : (
        /* MATCH FINISHED RESULT & ROYAL EDICT CERTIFICATE */
        <div className="scroll-panel p-6 sm:p-10 rounded-2xl shadow-2xl text-center space-y-6 animate-scale-up">
          
          {matchResult?.isWin ? (
            /* ROYAL EDICT CERTIFICATE (교지) FORMAT */
            <div className="bg-[#fbf7ee] p-6 sm:p-8 rounded-2xl border-4 border-[#8b261b] shadow-inner space-y-6 relative overflow-hidden">
              
              {/* Royal Seal Watermark */}
              <div className="absolute top-4 right-4 opacity-15 text-7xl select-none">
                👑
              </div>

              <div className="border-b-2 border-[#8b261b]/30 pb-4">
                <span className="text-[#8b261b] font-black tracking-widest text-lg border-b-2 border-[#8b261b] pb-1">
                  敎 旨 (교 지)
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2c221e] mt-3">
                  맞춤법 대결 승리 인증서
                </h3>
              </div>

              <div className="space-y-3 text-[#5c3d2e] leading-relaxed text-sm sm:text-base font-semibold">
                <p>
                  교지 대상: <strong className="text-[#8b261b] text-lg">{user.nickname}</strong> 학사
                </p>
                <p className="max-w-md mx-auto">
                  위 학사는 세종대왕과의 맞춤법 겨루기에서 훌륭한 맞춤법 실력(<strong className="text-[#8b261b]">{matchResult.finalScore} / 10 정답</strong>, {matchResult.elapsed}초)을 증명하였으므로, 이에 집현전 명예 학사 칭호를 수여함.
                </p>
                <div className="py-2">
                  <span className="inline-block bg-[#8b261b] text-amber-300 font-bold px-4 py-2 rounded-xl text-base shadow">
                    칭호: {matchResult.title}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#8b261b]/30 flex items-center justify-between text-xs text-[#8b261b] font-bold">
                <span>조선시대 집현전 세종대왕 어인 💮</span>
                <span>{new Date().toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          ) : (
            /* LOSS / RETRY SCREEN */
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-4xl mx-auto border-2 border-gray-400">
                📜
              </div>
              <h3 className="text-2xl font-bold text-[#8b261b]">
                세종대왕 AI 승리! (아쉬운 결과)
              </h3>
              <p className="text-sm text-[#5c3d2e]">
                점수: 나 ({matchResult?.finalScore}점) vs 세종대왕 ({matchResult?.aiFinalScore}점)<br />
                조금 더 연습하여 다시 도전해보세요!
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => {
                setDifficulty(null);
                setIsMatchFinished(false);
              }}
              className="flex-1 py-3 bg-[#ede1c9] hover:bg-[#e2d3b5] text-[#2c221e] rounded-xl font-bold text-sm border border-[#c7b38d] flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> 다시 도전하기
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
