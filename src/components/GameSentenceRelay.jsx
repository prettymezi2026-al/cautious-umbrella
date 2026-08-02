import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, XCircle, Home, RotateCcw, Sparkles, Coins, ScrollText, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function GameSentenceRelay({ user, quizData, onFinish, onGoHome }) {
  const [selectedStory, setSelectedStory] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [completedSentences, setCompletedSentences] = useState([]);
  const [score, setScore] = useState(0);
  const [totalGold, setTotalGold] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (quizData && quizData.relayStories && quizData.relayStories.length > 0) {
      // Pick a random story from dataset
      const story = quizData.relayStories[Math.floor(Math.random() * quizData.relayStories.length)];
      setSelectedStory(story);
    }
  }, [quizData]);

  if (!selectedStory) {
    return <div className="text-center p-8 text-[#8b261b]">이야기를 준비 중입니다...</div>;
  }

  const currentStep = selectedStory.steps[stepIndex];

  const handleSelectOption = (option) => {
    if (feedback !== null) return;

    if (option.isCorrect) {
      sounds.playCorrect();
      const goldEarned = 15;
      setScore(prev => prev + 1);
      setTotalGold(prev => prev + goldEarned);

      const sentenceAdded = `${currentStep.prompt} ${option.text}`;
      setCompletedSentences(prev => [...prev, sentenceAdded]);

      setFeedback({
        isCorrect: true,
        text: option.text,
        tip: option.tip,
        earned: goldEarned
      });
    } else {
      sounds.playWrong();
      setFeedback({
        isCorrect: false,
        text: option.text,
        tip: option.tip,
        earned: 0
      });
    }
  };

  const handleNextStep = () => {
    sounds.playClick();
    setFeedback(null);

    if (stepIndex + 1 >= selectedStory.steps.length) {
      finishRelay();
    } else {
      setStepIndex(prev => prev + 1);
    }
  };

  const finishRelay = async () => {
    sounds.playFanfare();
    setIsFinished(true);
    setIsSaving(true);

    // Bonus gold for finishing full story
    const finalGold = totalGold + 20;
    setTotalGold(finalGold);

    try {
      const res = await fetch('/api/user/gold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: user.nickname,
          goldEarned: finalGold,
          gameType: 'relay'
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        onFinish(data.user);
      }
    } catch (err) {
      console.error("Relay gold save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#1b4965]">
            <BookOpen className="w-4 h-4" /> 이야기 단계 {stepIndex + 1} / {selectedStory.steps.length}
          </div>
          <div className="gold-badge px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-900" /> +{totalGold} G
          </div>
        </div>
      </div>

      {!isFinished ? (
        <div className="scroll-panel p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
          
          {/* Story Title */}
          <div className="text-center pb-3 border-b border-[#c7b38d]">
            <span className="bg-[#1b4965]/10 text-[#1b4965] text-xs font-bold px-3 py-1 rounded-full inline-block mb-1">
              📜 {selectedStory.title}
            </span>
            <h3 className="text-xl font-bold text-[#2c221e]">
              문장의 뒷부분을 올바른 맞춤법으로 완성하세요!
            </h3>
          </div>

          {/* Accumulated Story Scroll */}
          <div className="bg-[#fbf7ee] p-5 rounded-xl border-2 border-[#c7b38d] space-y-2 text-sm leading-relaxed text-[#5c3d2e] max-h-48 overflow-y-auto">
            {completedSentences.length === 0 ? (
              <p className="italic text-gray-500 text-center">
                이야기가 시작됩니다. 알맞은 문장을 선택해주세요!
              </p>
            ) : (
              completedSentences.map((sentence, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="text-[#8b261b] font-bold">Step {idx + 1}.</span>
                  <span>{sentence}</span>
                </p>
              ))
            )}
          </div>

          {/* Current Sentence Prompt */}
          <div className="bg-[#ede1c9] p-5 rounded-xl border border-[#d4c29d]">
            <p className="text-xs font-bold text-[#1b4965] mb-1">다음 이어질 이야기:</p>
            <p className="text-lg font-bold text-[#2c221e]">
              "{currentStep.prompt} <span className="text-[#8b261b] animate-pulse">[ ... ]</span>"
            </p>
          </div>

          {/* Option Choices */}
          <div className="space-y-3">
            {currentStep.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={feedback !== null}
                onClick={() => handleSelectOption(opt)}
                className="w-full text-left p-4 bg-[#fbf7ee] hover:bg-[#ede1c9] disabled:opacity-60 rounded-xl border-2 border-[#c7b38d] hover:border-[#1b4965] font-bold text-base text-[#2c221e] shadow-sm hover:shadow transition-all flex items-center justify-between group"
              >
                <span>{opt.text}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1b4965] group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          {/* Feedback & Tip Banner */}
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
                    {feedback.isCorrect ? '올바른 문장입니다! 🎉' : '맞춤법이 어색합니다!'}
                    {feedback.isCorrect && (
                      <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                        +{feedback.earned} Gold
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed opacity-90 font-medium">
                    💡 <strong>맞춤법 팁:</strong> {feedback.tip}
                  </p>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="mt-4 w-full py-2.5 bg-[#1b4965] hover:bg-[#14374d] text-amber-100 rounded-lg text-sm font-bold shadow transition-colors"
              >
                {stepIndex + 1 >= selectedStory.steps.length ? '완성된 이야기 확인하기 ➔' : '다음 문장 이어가기 ➔'}
              </button>
            </div>
          )}

        </div>
      ) : (
        /* FULL COMPLETED STORY SCROLL RESULT */
        <div className="scroll-panel p-8 rounded-2xl shadow-2xl space-y-6 animate-scale-up text-center">
          <div className="w-20 h-20 rounded-full bg-[#1b4965] text-amber-300 flex items-center justify-center text-4xl mx-auto shadow-lg border-2 border-amber-400">
            📜
          </div>

          <div>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
              이야기 완성 보너스 (+20 Gold)
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#1b4965] mt-2">
              "{selectedStory.title}" 완성!
            </h3>
            <p className="text-sm text-[#5c3d2e] mt-1 font-semibold">
              학사님의 멋진 맞춤법 실력으로 한편의 명작 이야기가 완성되었습니다!
            </p>
          </div>

          {/* Full Story Scroll Box */}
          <div className="bg-[#fbf7ee] p-6 rounded-xl border-2 border-[#d4c29d] text-left space-y-3 shadow-inner">
            <h4 className="font-bold text-[#8b261b] text-base border-b border-[#d4c29d] pb-2 flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-[#8b261b]" /> 완성된 집현전 이야기 전문
            </h4>
            <div className="space-y-2 text-sm leading-relaxed text-[#2c221e] font-medium">
              {completedSentences.map((s, idx) => (
                <p key={idx} className="indent-2">
                  • {s}
                </p>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 bg-[#ede1c9] p-3.5 rounded-xl border border-[#d4c29d]">
            <Coins className="w-5 h-5 text-[#d99b26]" />
            <span className="font-bold text-[#2c221e]">총 획득 엽전:</span>
            <span className="text-xl font-extrabold text-[#d99b26]">+{totalGold} Gold</span>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => {
                const story = quizData.relayStories[Math.floor(Math.random() * quizData.relayStories.length)];
                setSelectedStory(story);
                setStepIndex(0);
                setCompletedSentences([]);
                setScore(0);
                setTotalGold(0);
                setFeedback(null);
                setIsFinished(false);
              }}
              className="flex-1 py-3 bg-[#ede1c9] hover:bg-[#e2d3b5] text-[#2c221e] rounded-xl font-bold text-sm border border-[#c7b38d] flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> 다른 이야기 도전
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
