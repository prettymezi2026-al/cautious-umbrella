const { useState, useEffect, useRef } = React;

// 1. Web Audio API Sound Synthesizer Engine
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
  playCorrect() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(783.99, now + 0.1);
    gain2.gain.setValueAtTime(0.35, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  }
  playWrong() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
  playCombo() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }
  playClick() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }
  playFanfare() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    [
      { f: 261.63, t: 0, d: 0.15 },
      { f: 329.63, t: 0.15, d: 0.15 },
      { f: 392.00, t: 0.30, d: 0.15 },
      { f: 523.25, t: 0.45, d: 0.25 },
      { f: 659.25, t: 0.65, d: 0.25 },
      { f: 783.99, t: 0.85, d: 0.60 }
    ].forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + note.t;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, startTime);
      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + note.d);
    });
  }
}
const sounds = new SoundEngine();

// 2. Navbar Component
function Navbar({ user, onOpenRanking, onSwitchUser, muted, setMuted, onGoHome }) {
  const handleToggleSound = () => {
    setMuted(sounds.toggleMute());
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
        <div onClick={onGoHome} className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b261b] to-[#5c160e] flex items-center justify-center text-2xl shadow-md border border-[#d99b26]">
            📜
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide text-[#f3b61f] group-hover:text-amber-300 transition-colors">
              집현전 맞춤법 대결
            </h1>
            <p className="text-xs text-amber-200/70 hidden sm:block">세종대왕의 학사가 되다!</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-[#42322c] px-3 py-1.5 rounded-lg border border-[#6b5247]">
              <span className="text-amber-400">👤</span>
              <div className="text-sm">
                <span className="font-bold text-amber-100">{user.nickname}</span>
                <span className="text-xs ml-2 text-amber-300/80 hidden md:inline-block">[{getTitleRank()}]</span>
              </div>
            </div>

            <div className="gold-badge flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-sm shadow-md">
              <span>🪙</span>
              <span>{user.gold} G</span>
            </div>

            <button
              onClick={() => { sounds.playClick(); onOpenRanking(); }}
              className="flex items-center gap-1.5 bg-[#8b261b] hover:bg-[#a32e22] text-amber-100 px-3 py-1.5 rounded-lg text-sm font-semibold border border-amber-600/40"
            >
              <span>👑 명예의 전당</span>
            </button>

            <button
              onClick={handleToggleSound}
              className="p-2 bg-[#42322c] hover:bg-[#57423a] text-amber-200 rounded-lg border border-[#6b5247]"
            >
              {muted ? '🔇' : '🔊'}
            </button>

            <button onClick={() => { sounds.playClick(); onSwitchUser(); }} className="text-xs text-amber-200/60 hover:text-amber-200 underline ml-1">
              변경
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// 3. LoginModal Component
function LoginModal({ onLogin }) {
  const [nickname, setNickname] = useState('');
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
      setError('서버 연결 실패. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="scroll-panel w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#8b261b] text-amber-300 text-3xl mb-3 shadow-lg border-2 border-[#d99b26]">
            🖊️
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#8b261b]">집현전 입학 서약</h2>
          <p className="text-sm text-[#5c3d2e] mt-1 font-semibold">조선 최고의 맞춤법 학사에 도전하세요!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#2c221e] mb-1.5">
              학사 닉네임 (또는 학번)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 한글왕6학년3반 / 집현전꿈나무"
              className="w-full px-4 py-3 bg-[#fbf7ee] border-2 border-[#c7b38d] rounded-xl text-[#2c221e] font-bold focus:outline-none focus:border-[#8b261b]"
              maxLength={15}
              autoFocus
            />
            {error && <p className="text-xs text-red-600 font-bold mt-1.5">⚠️ {error}</p>}
          </div>

          <div className="bg-[#ede1c9]/70 p-3.5 rounded-xl border border-[#d4c29d] text-xs text-[#5c3d2e] leading-relaxed">
            💡 비밀번호 없이 닉네임만으로 간편하게 시작할 수 있습니다.<br />
            다른 기기에서도 <strong>동일한 닉네임</strong>을 입력하면 성적이 유지됩니다!
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-joseon-primary py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
          >
            {loading ? '집현전 입장 중...' : '집현전 학사로 입장하기 ➔'}
          </button>
        </form>
      </div>
    </div>
  );
}

// 4. Dashboard Component
function Dashboard({ user, onSelectGame, onOpenBoss, onOpenRanking }) {
  const isBossUnlocked = user && user.gold >= 100;
  const bossProgressPercent = user ? Math.min(100, Math.floor((user.gold / 100) * 100)) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Welcome Banner */}
      <div className="hanji-card p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#8b261b]/10 text-[#8b261b] px-3 py-1 rounded-full text-xs font-bold mb-2">
              ✨ 조선시대 집현전 학당
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2c221e]">
              반갑습니다, <span className="text-[#8b261b]">{user?.nickname}</span> 학사님! 📜
            </h2>
            <p className="text-sm text-[#5c3d2e] mt-1">
              미니게임에서 엽전을 모아 실력을 다지고, <strong className="text-[#8b261b]">100 골드</strong>를 모아 세종대왕님과의 대결에서 승리하세요!
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 bg-[#ede1c9]/80 p-3.5 rounded-xl border border-[#d4c29d]">
            <div className="text-center px-3 border-r border-[#c7b38d]">
              <p className="text-xs text-[#5c3d2e]">보유 엽전</p>
              <p className="text-lg font-black text-[#d99b26]">🪙 {user?.gold || 0}</p>
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

      {/* BOSS DUEL UNLOCK CARD */}
      <div className={`rounded-2xl p-6 sm:p-8 border-4 transition-all ${
        isBossUnlocked 
          ? 'bg-gradient-to-br from-[#5c160e] via-[#8b261b] to-[#42110a] text-amber-100 border-[#f3b61f] shadow-2xl' 
          : 'bg-[#ede1c9]/90 text-[#2c221e] border-[#c7b38d] shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                isBossUnlocked ? 'bg-[#f3b61f] border-amber-200' : 'bg-[#c7b38d]'
              }`}>
                👑
              </div>
              <div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isBossUnlocked ? 'bg-amber-400 text-amber-950' : 'bg-gray-300 text-gray-700'
                }`}>
                  최종 관문
                </span>
                <h3 className={`text-2xl font-black ${isBossUnlocked ? 'text-amber-300' : 'text-[#8b261b]'}`}>
                  세종대왕과의 맞춤법 대결 (보스전)
                </h3>
              </div>
            </div>

            <p className={`text-sm leading-relaxed ${isBossUnlocked ? 'text-amber-100/90' : 'text-[#5c3d2e]'}`}>
              세종대왕 AI와 1:1 실시간 맞춤법 레이스를 펼칩니다! 승리 시 <strong>왕실 교지 인증서</strong>와 칭호를 받게 됩니다.
            </p>

            {!isBossUnlocked && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-bold text-[#5c3d2e]">
                  <span>보스전 해금 조건 (100 G 필요)</span>
                  <span>{user?.gold || 0} / 100 G ({bossProgressPercent}%)</span>
                </div>
                <div className="w-full h-3.5 bg-[#d4c29d] rounded-full overflow-hidden p-0.5 border border-[#b8a47e]">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500" style={{ width: `${bossProgressPercent}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-[200px] flex justify-center md:justify-end">
            {isBossUnlocked ? (
              <button onClick={() => { sounds.playClick(); onOpenBoss(); }} className="btn-joseon-gold px-8 py-4 rounded-xl text-lg font-black shadow-xl">
                세종대왕님께 도전! ➔
              </button>
            ) : (
              <button disabled className="bg-gray-300 text-gray-500 px-6 py-3.5 rounded-xl font-bold cursor-not-allowed border border-gray-400">
                🔒 엽전 100개 필요 ({100 - (user?.gold || 0)}G 부족)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MINI GAMES SECTION */}
      <div className="space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold text-[#8b261b] flex items-center gap-2">
          🎮 집현전 미니게임 (엽전 모으기)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Game 1 */}
          <div onClick={() => { sounds.playClick(); onSelectGame('dictation'); }} className="hanji-card p-6 rounded-2xl cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all border-2 border-[#d4c29d] hover:border-[#8b261b] flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-12 h-12 rounded-xl bg-amber-100 text-[#8b261b] flex items-center justify-center text-2xl border border-amber-300 shadow-sm">⚡</span>
                <span className="bg-[#8b261b]/10 text-[#8b261b] text-xs font-bold px-2.5 py-1 rounded-full">스피드 모드</span>
              </div>
              <h4 className="text-xl font-bold text-[#2c221e] group-hover:text-[#8b261b]">① 받아쓰기 배틀</h4>
              <p className="text-xs text-[#5c3d2e] mt-2">8초 안에 문장 속 맞춤법 빈칸을 채우세요! 스피드 보너스 및 콤보 혜택!</p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#d4c29d]/60 flex items-center justify-between text-xs font-bold text-[#8b261b]">
              <span>10문항 / 콤보 보너스</span>
              <span>도전하기 ➔</span>
            </div>
          </div>

          {/* Game 2 */}
          <div onClick={() => { sounds.playClick(); onSelectGame('relay'); }} className="hanji-card p-6 rounded-2xl cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all border-2 border-[#d4c29d] hover:border-[#1b4965] flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-12 h-12 rounded-xl bg-blue-100 text-[#1b4965] flex items-center justify-center text-2xl border border-blue-300 shadow-sm">📖</span>
                <span className="bg-[#1b4965]/10 text-[#1b4965] text-xs font-bold px-2.5 py-1 rounded-full">스토리 완성</span>
              </div>
              <h4 className="text-xl font-bold text-[#2c221e] group-hover:text-[#1b4965]">② 문장 완성 릴레이</h4>
              <p className="text-xs text-[#5c3d2e] mt-2">자주 틀리는 맞춤법 문장 뒷부분을 이어 완성하여 유쾌한 이야기를 만드세요!</p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#d4c29d]/60 flex items-center justify-between text-xs font-bold text-[#1b4965]">
              <span>이야기 릴레이 / 보너스</span>
              <span>도전하기 ➔</span>
            </div>
          </div>

          {/* Game 3 */}
          <div onClick={() => { sounds.playClick(); onSelectGame('falling'); }} className="hanji-card p-6 rounded-2xl cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all border-2 border-[#d4c29d] hover:border-[#2d6a4f] flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-12 h-12 rounded-xl bg-emerald-100 text-[#2d6a4f] flex items-center justify-center text-2xl border border-emerald-300 shadow-sm">🧺</span>
                <span className="bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-bold px-2.5 py-1 rounded-full">아케이드</span>
              </div>
              <h4 className="text-xl font-bold text-[#2c221e] group-hover:text-[#2d6a4f]">③ 낙하 단어 잡기</h4>
              <p className="text-xs text-[#5c3d2e] mt-2">하늘에서 떨어지는 단어 중 맞는 표기만 바구니로 받으세요! 생명 3개!</p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#d4c29d]/60 flex items-center justify-between text-xs font-bold text-[#2d6a4f]">
              <span>생명 3개 / 무한 서바이벌</span>
              <span>도전하기 ➔</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hall of Fame Banner */}
      <div onClick={() => { sounds.playClick(); onOpenRanking(); }} className="bg-gradient-to-r from-[#2c221e] to-[#42322c] text-amber-100 p-5 rounded-2xl cursor-pointer flex items-center justify-between border-2 border-[#d99b26]">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👑</span>
          <div>
            <h4 className="text-lg font-bold text-[#f3b61f]">집현전 명예의 전당</h4>
            <p className="text-xs text-amber-200/80">최고 점수 랭킹과 누적 도전왕 랭킹을 확인해보세요!</p>
          </div>
        </div>
        <span className="text-[#f3b61f] font-bold">확인하기 ➔</span>
      </div>
    </div>
  );
}

// 5. GameDictation (Mini-game 1)
function GameDictation({ user, quizData, onFinish, onGoHome }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalGold, setTotalGold] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (quizData && quizData.questions) {
      setQuestions([...quizData.questions].sort(() => 0.5 - Math.random()).slice(0, 10));
    }
  }, [quizData]);

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
      const speedBonus = timeLeft;
      const newCombo = combo + 1;
      const comboBonus = newCombo >= 3 ? 5 : 0;
      const earned = 10 + speedBonus + comboBonus;

      if (newCombo >= 3) sounds.playCombo();

      setScore(s => s + 1);
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      setTotalGold(g => g + earned);

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
        tip: `틀렸습니다! 정답은 '${currentQ.answer}'입니다. ${currentQ.tip}`
      });
    }
  };

  const handleNextQuestion = () => {
    sounds.playClick();
    setFeedback(null);
    if (currentIndex + 1 >= questions.length) {
      finishGame();
    } else {
      setCurrentIndex(c => c + 1);
    }
  };

  const finishGame = async () => {
    setIsGameOver(true);
    try {
      const res = await fetch('/api/user/gold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: user.nickname, goldEarned: totalGold, gameType: 'dictation' })
      });
      const data = await res.json();
      if (data.success) onFinish(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  if (questions.length === 0) return <div className="text-center p-8 text-[#8b261b]">문제를 로딩 중...</div>;

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onGoHome} className="px-3 py-1.5 bg-[#ede1c9] text-[#2c221e] rounded-lg text-sm font-bold border border-[#c7b38d]">
          🏠 메인으로
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-extrabold text-[#8b261b]">문제 {currentIndex + 1} / 10</span>
          <span className="gold-badge px-3 py-1 rounded-full text-xs font-bold">🪙 +{totalGold} G</span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="scroll-panel p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-[#8b261b]">⏰ 제한시간</span>
              <span className={`text-lg font-black ${timeLeft <= 3 ? 'text-red-600' : 'text-[#8b261b]'}`}>{timeLeft}초</span>
            </div>
            <div className="w-full h-3 bg-[#d4c29d] rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${timeLeft <= 3 ? 'bg-red-600' : 'bg-amber-500'}`} style={{ width: `${(timeLeft / 8) * 100}%` }} />
            </div>
          </div>

          {combo >= 2 && (
            <div className="bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold px-3 py-1.5 rounded-full inline-block">
              🔥 {combo} 연속 정답! (콤보 보너스 획득 중!)
            </div>
          )}

          <div className="bg-[#fbf7ee] p-6 rounded-xl border-2 border-[#c7b38d] text-center">
            <h3 className="text-xl sm:text-2xl font-bold leading-relaxed text-[#2c221e]">
              {currentQ?.sentence.replace('{blank}', ' [  ?  ] ')}
            </h3>
          </div>

          <div className={`grid ${currentQ?.options.length > 2 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'} gap-4`}>
            {currentQ?.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={feedback !== null}
                onClick={() => handleSelectOption(opt)}
                className="py-4 px-6 bg-[#ede1c9] hover:bg-[#e5d4b4] disabled:opacity-60 text-[#2c221e] text-xl font-bold rounded-xl border-2 border-[#bfa980] hover:border-[#8b261b] shadow"
              >
                {opt}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`p-4 rounded-xl border-2 ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
              <div className="font-extrabold text-base flex items-center gap-2">
                {feedback.isCorrect ? '정답입니다! 👏' : '오답입니다!'}
                {feedback.isCorrect && <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">+{feedback.earned} Gold</span>}
              </div>
              <p className="text-xs mt-1 leading-relaxed">💡 {feedback.tip}</p>
              <button onClick={handleNextQuestion} className="mt-4 w-full py-2.5 btn-joseon-primary rounded-lg text-sm font-bold">
                {currentIndex + 1 >= questions.length ? '결과 확인하기 ➔' : '다음 문제 ➔'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="scroll-panel p-8 rounded-2xl shadow-2xl text-center space-y-6">
          <div className="text-4xl">🎯</div>
          <h3 className="text-2xl font-black text-[#8b261b]">받아쓰기 배틀 완료!</h3>
          <div className="grid grid-cols-3 gap-3 bg-[#ede1c9] p-4 rounded-xl border border-[#d4c29d]">
            <div><p className="text-xs text-[#5c3d2e]">정답수</p><p className="text-xl font-extrabold text-[#8b261b]">{score} / 10</p></div>
            <div><p className="text-xs text-[#5c3d2e]">최대 콤보</p><p className="text-xl font-extrabold text-[#1b4965]">{maxCombo}회</p></div>
            <div><p className="text-xs text-[#5c3d2e]">획득 엽전</p><p className="text-xl font-extrabold text-[#d99b26]">+{totalGold} G</p></div>
          </div>
          <button onClick={onGoHome} className="w-full py-3 btn-joseon-primary rounded-xl font-bold">로비로 이동 ➔</button>
        </div>
      )}
    </div>
  );
}

// 6. GameSentenceRelay (Mini-game 2)
function GameSentenceRelay({ user, quizData, onFinish, onGoHome }) {
  const [selectedStory, setSelectedStory] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [completedSentences, setCompletedSentences] = useState([]);
  const [totalGold, setTotalGold] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (quizData && quizData.relayStories && quizData.relayStories.length > 0) {
      setSelectedStory(quizData.relayStories[Math.floor(Math.random() * quizData.relayStories.length)]);
    }
  }, [quizData]);

  if (!selectedStory) return <div className="text-center p-8 text-[#8b261b]">이야기 로딩 중...</div>;

  const currentStep = selectedStory.steps[stepIndex];

  const handleSelectOption = (option) => {
    if (feedback !== null) return;
    if (option.isCorrect) {
      sounds.playCorrect();
      const goldEarned = 15;
      setTotalGold(g => g + goldEarned);
      setCompletedSentences(prev => [...prev, `${currentStep.prompt} ${option.text}`]);
      setFeedback({ isCorrect: true, tip: option.tip, earned: goldEarned });
    } else {
      sounds.playWrong();
      setFeedback({ isCorrect: false, tip: option.tip, earned: 0 });
    }
  };

  const handleNextStep = () => {
    sounds.playClick();
    setFeedback(null);
    if (stepIndex + 1 >= selectedStory.steps.length) {
      finishRelay();
    } else {
      setStepIndex(s => s + 1);
    }
  };

  const finishRelay = async () => {
    sounds.playFanfare();
    setIsFinished(true);
    const finalGold = totalGold + 20;
    setTotalGold(finalGold);
    try {
      const res = await fetch('/api/user/gold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: user.nickname, goldEarned: finalGold, gameType: 'relay' })
      });
      const data = await res.json();
      if (data.success) onFinish(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onGoHome} className="px-3 py-1.5 bg-[#ede1c9] text-[#2c221e] rounded-lg text-sm font-bold border border-[#c7b38d]">
          🏠 메인으로
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-extrabold text-[#1b4965]">단계 {stepIndex + 1} / {selectedStory.steps.length}</span>
          <span className="gold-badge px-3 py-1 rounded-full text-xs font-bold">🪙 +{totalGold} G</span>
        </div>
      </div>

      {!isFinished ? (
        <div className="scroll-panel p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
          <div className="text-center pb-3 border-b border-[#c7b38d]">
            <span className="bg-[#1b4965]/10 text-[#1b4965] text-xs font-bold px-3 py-1 rounded-full">📜 {selectedStory.title}</span>
            <h3 className="text-xl font-bold text-[#2c221e] mt-1">문장의 뒷부분을 올바른 맞춤법으로 이어 완성하세요!</h3>
          </div>

          <div className="bg-[#fbf7ee] p-4 rounded-xl border-2 border-[#c7b38d] text-sm space-y-1 text-[#5c3d2e] max-h-40 overflow-y-auto">
            {completedSentences.length === 0 ? <p className="italic text-gray-500 text-center">이야기가 시작됩니다...</p> : (
              completedSentences.map((s, idx) => <p key={idx}>Step {idx + 1}. {s}</p>)
            )}
          </div>

          <div className="bg-[#ede1c9] p-5 rounded-xl border border-[#d4c29d]">
            <p className="text-xs font-bold text-[#1b4965]">이어질 이야기:</p>
            <p className="text-lg font-bold text-[#2c221e]">"{currentStep.prompt} [ ... ]"</p>
          </div>

          <div className="space-y-3">
            {currentStep.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={feedback !== null}
                onClick={() => handleSelectOption(opt)}
                className="w-full text-left p-4 bg-[#fbf7ee] hover:bg-[#ede1c9] disabled:opacity-60 rounded-xl border-2 border-[#c7b38d] font-bold text-base text-[#2c221e] shadow-sm flex items-center justify-between"
              >
                <span>{opt.text}</span>
                <span>➔</span>
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`p-4 rounded-xl border-2 ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
              <div className="font-extrabold text-base flex items-center gap-2">
                {feedback.isCorrect ? '올바른 문장입니다! 🎉' : '맞춤법이 어색합니다!'}
                {feedback.isCorrect && <span className="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">+{feedback.earned} Gold</span>}
              </div>
              <p className="text-xs mt-1 leading-relaxed">💡 {feedback.tip}</p>
              <button onClick={handleNextStep} className="mt-4 w-full py-2.5 bg-[#1b4965] text-amber-100 rounded-lg text-sm font-bold">
                {stepIndex + 1 >= selectedStory.steps.length ? '완성된 이야기 보기 ➔' : '다음 문장 ➔'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="scroll-panel p-8 rounded-2xl shadow-2xl text-center space-y-6">
          <div className="text-4xl">📜</div>
          <h3 className="text-2xl font-black text-[#1b4965]">"{selectedStory.title}" 완성!</h3>
          <div className="bg-[#fbf7ee] p-5 rounded-xl border-2 border-[#d4c29d] text-left space-y-2 text-sm leading-relaxed text-[#2c221e]">
            {completedSentences.map((s, idx) => <p key={idx}>• {s}</p>)}
          </div>
          <div className="font-bold text-[#d99b26] text-lg">총 획득 엽전: +{totalGold} Gold</div>
          <button onClick={onGoHome} className="w-full py-3 btn-joseon-primary rounded-xl font-bold">로비로 이동 ➔</button>
        </div>
      )}
    </div>
  );
}

// 7. GameFallingWords (Mini-game 3)
function GameFallingWords({ user, quizData, onFinish, onGoHome }) {
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [totalGold, setTotalGold] = useState(0);
  const [basketPos, setBasketPos] = useState(50);
  const [fallingWords, setFallingWords] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const requestRef = useRef();
  const lastSpawnTime = useRef(Date.now());
  const speedRef = useRef(1.2);
  const basketPosRef = useRef(50);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);

  useEffect(() => { basketPosRef.current = basketPos; }, [basketPos]);
  useEffect(() => { livesRef.current = lives; }, [lives]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') setBasketPos(p => Math.max(5, p - 8));
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') setBasketPos(p => Math.min(95, p + 8));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver || !quizData || !quizData.questions) return;
    const wordPool = [];
    quizData.questions.forEach((q) => {
      wordPool.push({ text: q.answer, isCorrect: true });
      q.options.forEach((opt) => {
        if (opt !== q.answer) wordPool.push({ text: opt, isCorrect: false });
      });
    });

    const timerInterval = setInterval(() => {
      setSurvivalTime(s => s + 1);
      speedRef.current += 0.05;
    }, 1000);

    const updateLoop = () => {
      const now = Date.now();
      if (now - lastSpawnTime.current > Math.max(900, 2200 - speedRef.current * 150)) {
        lastSpawnTime.current = now;
        const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
        setFallingWords(prev => [
          ...prev,
          {
            id: 'w_' + Date.now() + '_' + Math.random(),
            text: randomWord.text,
            isCorrect: randomWord.isCorrect,
            x: 10 + Math.random() * 80,
            y: 0,
            speed: (0.6 + Math.random() * 0.4) * speedRef.current
          }
        ]);
      }

      setFallingWords(prev => {
        const nextWords = [];
        for (let word of prev) {
          const newY = word.y + word.speed;
          if (newY >= 82 && newY <= 92) {
            if (Math.abs(word.x - basketPosRef.current) < 12) {
              if (word.isCorrect) {
                sounds.playCorrect();
                scoreRef.current += 1;
                setScore(scoreRef.current);
              } else {
                sounds.playWrong();
                livesRef.current -= 1;
                setLives(livesRef.current);
                if (livesRef.current <= 0) { endGame(); return []; }
              }
              continue;
            }
          }
          if (newY > 95) {
            if (word.isCorrect) {
              sounds.playWrong();
              livesRef.current -= 1;
              setLives(livesRef.current);
              if (livesRef.current <= 0) { endGame(); return []; }
            }
            continue;
          }
          nextWords.push({ ...word, y: newY });
        }
        return nextWords;
      });

      if (livesRef.current > 0) requestRef.current = requestAnimationFrame(updateLoop);
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
    const earnedGold = (scoreRef.current * 8) + Math.floor(survivalTime / 2);
    setTotalGold(earnedGold);
    try {
      const res = await fetch('/api/user/gold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: user.nickname, goldEarned: earnedGold, gameType: 'falling' })
      });
      const data = await res.json();
      if (data.success) onFinish(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onGoHome} className="px-3 py-1.5 bg-[#ede1c9] text-[#2c221e] rounded-lg text-sm font-bold border border-[#c7b38d]">
          🏠 메인으로
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-red-500 font-bold">
            {'❤️'.repeat(Math.max(0, lives))}
          </div>
          <span className="text-sm font-black text-[#2d6a4f]">점수: {score}개 ({survivalTime}초)</span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="space-y-4">
          <div className="relative w-full h-[450px] bg-gradient-to-b from-[#fbf7ee] to-[#ede1c9] rounded-2xl border-4 border-[#2d6a4f] overflow-hidden shadow-2xl">
            {fallingWords.map((word) => (
              <div
                key={word.id}
                className="absolute transform -translate-x-1/2 px-4 py-2 bg-[#f5edd6] text-[#2c221e] font-extrabold text-xl rounded-xl border-2 border-[#8b261b] shadow"
                style={{ left: `${word.x}%`, top: `${word.y}%` }}
              >
                {word.text}
              </div>
            ))}
            <div className="absolute bottom-3 transform -translate-x-1/2 flex flex-col items-center" style={{ left: `${basketPos}%` }}>
              <div className="w-20 h-10 bg-amber-700 text-[#fbf7ee] text-xs font-bold rounded-t-xl flex items-center justify-center border-2 border-amber-900">
                🧺 올바른 한글
              </div>
              <div className="text-2xl">🧑‍🎓</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setBasketPos(p => Math.max(5, p - 12))} className="flex-1 py-4 bg-[#2d6a4f] text-white rounded-xl font-bold text-lg">
              ◀ 왼쪽 이동
            </button>
            <button onClick={() => setBasketPos(p => Math.min(95, p + 12))} className="flex-1 py-4 bg-[#2d6a4f] text-white rounded-xl font-bold text-lg">
              오른쪽 이동 ▶
            </button>
          </div>
        </div>
      ) : (
        <div className="scroll-panel p-8 rounded-2xl shadow-2xl text-center space-y-6">
          <div className="text-4xl">🧺</div>
          <h3 className="text-2xl font-black text-[#2d6a4f]">낙하 단어 잡기 종료!</h3>
          <div className="grid grid-cols-3 gap-3 bg-[#ede1c9] p-4 rounded-xl border border-[#d4c29d]">
            <div><p className="text-xs text-[#5c3d2e]">잡은 단어</p><p className="text-xl font-extrabold text-[#2d6a4f]">{score}개</p></div>
            <div><p className="text-xs text-[#5c3d2e]">생존시간</p><p className="text-xl font-extrabold text-[#1b4965]">{survivalTime}초</p></div>
            <div><p className="text-xs text-[#5c3d2e]">획득 엽전</p><p className="text-xl font-extrabold text-[#d99b26]">+{totalGold} G</p></div>
          </div>
          <button onClick={onGoHome} className="w-full py-3 btn-joseon-primary rounded-xl font-bold">로비로 이동 ➔</button>
        </div>
      )}
    </div>
  );
}

// 8. BossDuel Component
function BossDuel({ user, quizData, onFinish, onGoHome }) {
  const [difficulty, setDifficulty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studentScore, setStudentScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isMatchFinished, setIsMatchFinished] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const timerRef = useRef(null);
  const aiTimerRef = useRef(null);
  const startTimeRef = useRef(0);

  const handleStartMatch = (selectedDiff) => {
    sounds.playClick();
    setDifficulty(selectedDiff);
    setQuestions([...quizData.questions].sort(() => 0.5 - Math.random()).slice(0, 10));
    setCurrentIndex(0);
    setStudentScore(0);
    setAiScore(0);
    setTimeSeconds(0);
    setFeedback(null);
    setIsMatchFinished(false);

    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    const aiAcc = selectedDiff === 'easy' ? 0.70 : selectedDiff === 'normal' ? 0.85 : 0.95;
    let currentAiScore = 0;

    aiTimerRef.current = setInterval(() => {
      if (Math.random() < aiAcc && currentAiScore < 10) {
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
      setFeedback({ isCorrect: true, tip: currentQ.tip });
      if (currentIndex + 1 >= 10) finishBossDuel(newScore);
    } else {
      sounds.playWrong();
      setFeedback({ isCorrect: false, tip: `틀렸습니다! 정답은 '${currentQ.answer}'입니다. ${currentQ.tip}` });
      if (currentIndex + 1 >= 10) finishBossDuel(studentScore);
    }
  };

  const handleNextQuestion = () => {
    sounds.playClick();
    setFeedback(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(c => c + 1);
    }
  };

  const finishBossDuel = async (finalScore) => {
    clearInterval(timerRef.current);
    clearInterval(aiTimerRef.current);
    const elapsed = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
    setTimeSeconds(elapsed);
    setIsMatchFinished(true);

    const isWin = finalScore >= aiScore || finalScore >= 7;
    let title = "집현전 참봉 학사";
    if (finalScore === 10) title = "정삼품 맞춤법 수석 학사 👑";
    else if (finalScore >= 8) title = "집현전 우수 학사 📜";

    if (isWin && window.confetti) {
      sounds.playFanfare();
      window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }

    setMatchResult({ isWin, finalScore, aiFinalScore: aiScore, elapsed, title });

    try {
      const res = await fetch('/api/boss/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: user.nickname, score: finalScore, timeSeconds: elapsed })
      });
      const data = await res.json();
      if (data.success) onFinish(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onGoHome} className="px-3 py-1.5 bg-[#ede1c9] text-[#2c221e] rounded-lg text-sm font-bold border border-[#c7b38d]">
          🏠 메인으로
        </button>
        {difficulty && !isMatchFinished && (
          <div className="text-sm font-extrabold text-[#8b261b]">⏰ {timeSeconds}초 경과</div>
        )}
      </div>

      {!difficulty ? (
        <div className="scroll-panel p-8 rounded-2xl shadow-2xl text-center space-y-8">
          <div className="text-4xl">👑</div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#8b261b]">세종대왕 AI 대결 난이도 선택</h2>
          <p className="text-sm text-[#5c3d2e]">도전 시 <strong>엽전 100개</strong>가 차감됩니다.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div onClick={() => handleStartMatch('easy')} className="hanji-card p-6 rounded-2xl cursor-pointer text-center border-2 border-emerald-600">
              <div className="text-3xl">🌱</div>
              <h3 className="font-bold text-lg text-emerald-700">쉬움</h3>
              <p className="text-xs text-gray-600 mt-1">AI 정답률 70%</p>
            </div>
            <div onClick={() => handleStartMatch('normal')} className="hanji-card p-6 rounded-2xl cursor-pointer text-center border-2 border-amber-600">
              <div className="text-3xl">📜</div>
              <h3 className="font-bold text-lg text-amber-700">보통</h3>
              <p className="text-xs text-gray-600 mt-1">AI 정답률 85%</p>
            </div>
            <div onClick={() => handleStartMatch('hard')} className="hanji-card p-6 rounded-2xl cursor-pointer text-center border-2 border-[#8b261b]">
              <div className="text-3xl">🔥</div>
              <h3 className="font-bold text-lg text-[#8b261b]">어려움</h3>
              <p className="text-xs text-gray-600 mt-1">AI 정답률 95%</p>
            </div>
          </div>
        </div>
      ) : !isMatchFinished ? (
        <div className="scroll-panel p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
          <div className="bg-[#fbf7ee] p-5 rounded-xl border-2 border-[#c7b38d] space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm font-bold text-[#8b261b]">
                <span>🧑‍🎓 {user.nickname} 학사 (나)</span>
                <span>{studentScore} / 10 문제</span>
              </div>
              <div className="w-full h-4 bg-[#ede1c9] rounded-full overflow-hidden">
                <div className="h-full bg-amber-600 transition-all duration-300" style={{ width: `${(studentScore / 10) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm font-bold text-[#1b4965]">
                <span>👑 세종대왕 AI</span>
                <span>{aiScore} / 10 문제</span>
              </div>
              <div className="w-full h-4 bg-[#ede1c9] rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(aiScore / 10) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-[#ede1c9] p-6 rounded-xl border-2 border-[#d4c29d] text-center">
            <span className="bg-[#8b261b] text-amber-100 text-xs font-bold px-3 py-1 rounded-full">문제 {currentIndex + 1} / 10</span>
            <h3 className="text-xl sm:text-2xl font-bold leading-relaxed text-[#2c221e] mt-3">
              {currentQ?.sentence.replace('{blank}', ' [  ?  ] ')}
            </h3>
          </div>

          <div className={`grid ${currentQ?.options.length > 2 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'} gap-4`}>
            {currentQ?.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={feedback !== null}
                onClick={() => handleSelectOption(opt)}
                className="py-4 px-6 bg-[#fbf7ee] hover:bg-[#ede1c9] text-[#2c221e] text-xl font-extrabold rounded-xl border-2 border-[#bfa980]"
              >
                {opt}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`p-4 rounded-xl border-2 ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
              <h4 className="font-bold">{feedback.isCorrect ? '정답입니다!' : '오답입니다!'}</h4>
              <p className="text-xs mt-1">💡 {feedback.tip}</p>
              <button onClick={handleNextQuestion} className="mt-4 w-full py-2.5 btn-joseon-primary rounded-lg text-sm font-bold">
                {currentIndex + 1 >= 10 ? '대결 결과 보기 ➔' : '다음 문제 ➔'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="scroll-panel p-8 rounded-2xl shadow-2xl text-center space-y-6">
          {matchResult?.isWin ? (
            <div className="bg-[#fbf7ee] p-6 rounded-2xl border-4 border-[#8b261b] space-y-4">
              <div className="text-xl font-black text-[#8b261b] tracking-widest">敎 旨 (교 지)</div>
              <h3 className="text-2xl font-extrabold text-[#2c221e]">맞춤법 대결 승리 인증서</h3>
              <p className="text-sm text-[#5c3d2e]">
                학사 <strong>{user.nickname}</strong>은 세종대왕과의 맞춤법 대결에서 훌륭한 성적({matchResult.finalScore} / 10 정답, {matchResult.elapsed}초)을 거두었으므로 아래 칭호를 수여함.
              </p>
              <div className="bg-[#8b261b] text-amber-300 font-bold px-4 py-2 rounded-xl text-base inline-block">
                칭호: {matchResult.title}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl">📜</div>
              <h3 className="text-2xl font-bold text-[#8b261b]">세종대왕 AI 승리!</h3>
              <p className="text-sm text-[#5c3d2e]">나 ({matchResult?.finalScore}점) vs 세종대왕 ({matchResult?.aiFinalScore}점)</p>
            </div>
          )}

          <button onClick={onGoHome} className="w-full py-3 btn-joseon-primary rounded-xl font-bold">로비로 이동 ➔</button>
        </div>
      )}
    </div>
  );
}

// 9. RankingView Component
function RankingView({ user, onGoHome }) {
  const [activeTab, setActiveTab] = useState('boss');
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRankings(); }, []);

  const getRankBadge = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return index + 1;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onGoHome} className="px-3 py-1.5 bg-[#ede1c9] text-[#2c221e] rounded-lg text-sm font-bold border border-[#c7b38d]">
          🏠 메인으로
        </button>
        <button onClick={fetchRankings} className="p-2 bg-[#ede1c9] rounded-lg border border-[#c7b38d]">🔄</button>
      </div>

      <div className="scroll-panel p-6 sm:p-8 rounded-2xl shadow-xl text-center space-y-6">
        <div className="text-4xl">👑</div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#8b261b]">집현전 명예의 전당</h2>

        <div className="flex bg-[#ede1c9] p-1.5 rounded-xl border border-[#c7b38d] max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('boss')}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold ${activeTab === 'boss' ? 'bg-[#8b261b] text-amber-100 shadow' : 'text-[#5c3d2e]'}`}
          >
            🏆 탭 A. 세종대왕 대결 최고점
          </button>
          <button
            onClick={() => setActiveTab('play')}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold ${activeTab === 'play' ? 'bg-[#1b4965] text-amber-100 shadow' : 'text-[#5c3d2e]'}`}
          >
            🔥 탭 B. 열정 도전 횟수 왕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-[#8b261b] font-bold">랭킹 불러오는 중...</div>
        ) : (
          <div className="space-y-3 text-left">
            {activeTab === 'boss' ? (
              bossRankings.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-2 flex items-center justify-between ${idx === 0 ? 'bg-amber-100 border-amber-400' : 'bg-[#fbf7ee] border-[#c7b38d]'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{getRankBadge(idx)}</span>
                    <div>
                      <div className="font-extrabold text-[#2c221e]">{item.nickname}</div>
                      <div className="text-xs text-[#5c3d2e]">엽전: {item.gold} G</div>
                    </div>
                  </div>
                  <div className="text-right font-black text-lg text-[#8b261b]">
                    {item.boss_high_score} / 10 정답 ({item.boss_fastest_time}초)
                  </div>
                </div>
              ))
            ) : (
              playRankings.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-2 flex items-center justify-between ${idx === 0 ? 'bg-amber-100 border-amber-400' : 'bg-[#fbf7ee] border-[#c7b38d]'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{getRankBadge(idx)}</span>
                    <div>
                      <div className="font-extrabold text-[#2c221e]">{item.nickname}</div>
                      <div className="text-xs text-[#5c3d2e]">엽전: {item.gold} G</div>
                    </div>
                  </div>
                  <div className="text-right font-black text-lg text-[#1b4965]">
                    총 {item.total_play_count}회 플레이
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 10. Root App Component
function App() {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [quizData, setQuizData] = useState({ questions: [], relayStories: [] });
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    fetch('/api/quiz')
      .then((res) => res.json())
      .then((data) => setQuizData(data))
      .catch((err) => console.error(err));

    const savedNick = localStorage.getItem('jiphyeonjeon_student_nickname');
    if (savedNick) {
      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: savedNick })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) setUser(data.user);
          else setShowLoginModal(true);
        })
        .catch(() => setShowLoginModal(true));
    } else {
      setShowLoginModal(true);
    }
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf7ee]">
      <Navbar
        user={user}
        onOpenRanking={() => setCurrentView('ranking')}
        onSwitchUser={handleSwitchUser}
        muted={muted}
        setMuted={setMuted}
        onGoHome={() => setCurrentView('dashboard')}
      />

      <main className="flex-1 pb-12">
        {user ? (
          <>
            {currentView === 'dashboard' && (
              <Dashboard
                user={user}
                onSelectGame={(g) => setCurrentView(g)}
                onOpenBoss={() => setCurrentView('boss')}
                onOpenRanking={() => setCurrentView('ranking')}
              />
            )}
            {currentView === 'dictation' && (
              <GameDictation user={user} quizData={quizData} onFinish={setUser} onGoHome={() => setCurrentView('dashboard')} />
            )}
            {currentView === 'relay' && (
              <GameSentenceRelay user={user} quizData={quizData} onFinish={setUser} onGoHome={() => setCurrentView('dashboard')} />
            )}
            {currentView === 'falling' && (
              <GameFallingWords user={user} quizData={quizData} onFinish={setUser} onGoHome={() => setCurrentView('dashboard')} />
            )}
            {currentView === 'boss' && (
              <BossDuel user={user} quizData={quizData} onFinish={setUser} onGoHome={() => setCurrentView('dashboard')} />
            )}
            {currentView === 'ranking' && (
              <RankingView user={user} onGoHome={() => setCurrentView('dashboard')} />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh] text-[#8b261b] font-bold">
            집현전에 접속 중입니다...
          </div>
        )}
      </main>

      {showLoginModal && <LoginModal onLogin={handleLogin} />}

      <footer className="py-4 text-center text-xs text-[#5c3d2e]/70 border-t border-[#d4c29d] bg-[#f5edd6]">
        <p>집현전 맞춤법 대결 © 2026 초등 국어 맞춤법 학습 웹앱</p>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
