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

// 2. Superlist Navbar Component
function Navbar({ user, onOpenRanking, onSwitchUser, muted, setMuted, onGoHome }) {
  const handleToggleSound = () => setMuted(sounds.toggleMute());

  const getTitleRank = () => {
    if (!user) return "집현전 학사";
    if (user.boss_high_score >= 10) return "정삼품 수석 학사 👑";
    if (user.boss_high_score >= 7) return "집현전 우수 학사 📜";
    if (user.boss_high_score > 0) return "참봉 학사 🎖️";
    return "신입 학사 🖊️";
  };

  return (
    <header className="sticky top-0 z-40 bg-[#14110f]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div onClick={onGoHome} className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c93b2b] to-[#8b261b] flex items-center justify-center text-xl shadow-lg border border-amber-500/30">
            📜
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              집현전 맞춤법 <span className="text-amber-400 font-normal text-sm">v2.0</span>
            </h1>
            <p className="text-[11px] text-amber-200/60 hidden sm:block">Superlist 에디션 • 세종대왕의 학사가 되다</p>
          </div>
        </div>

        {/* Right User Bar */}
        {user && (
          <div className="flex items-center gap-3">
            {/* User Pill */}
            <div className="superlist-pill px-3.5 py-1.5 flex items-center gap-2 text-xs font-semibold text-amber-100">
              <span className="text-amber-400">🧑‍🎓</span>
              <span>{user.nickname}</span>
              <span className="text-amber-400/80 text-[10px] hidden md:inline">[{getTitleRank()}]</span>
            </div>

            {/* Gold Pill */}
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-amber-300 flex items-center gap-1.5 shadow-sm">
              <span>🪙</span>
              <span>{user.gold} G</span>
            </div>

            {/* Hall of Fame */}
            <button
              onClick={() => { sounds.playClick(); onOpenRanking(); }}
              className="superlist-pill hover:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <span>👑 랭킹</span>
            </button>

            {/* Mute Toggle */}
            <button
              onClick={handleToggleSound}
              className="superlist-pill hover:bg-white/10 p-2 text-xs text-amber-200 transition-colors"
            >
              {muted ? '🔇' : '🔊'}
            </button>

            <button onClick={() => { sounds.playClick(); onSwitchUser(); }} className="text-xs text-amber-200/50 hover:text-amber-200 underline">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="superlist-card w-full max-w-md p-8 text-center space-y-6 shadow-superlist border border-amber-500/20">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c93b2b] to-[#8b261b] text-amber-300 text-3xl mx-auto flex items-center justify-center shadow-lg border border-amber-500/30">
          🖊️
        </div>
        <div>
          <span className="superlist-pill px-3 py-1 text-xs font-bold text-amber-300 inline-block mb-2">
            집현전 입학 서약
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">학사 등록하기</h2>
          <p className="text-xs text-amber-200/60 mt-1">조선 최고의 국어 맞춤법 학사에 도전하세요!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-amber-200/80 mb-2">학사 닉네임 (또는 학번)</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 한글왕6학년3반 / 집현전꿈나무"
              className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white font-bold placeholder-gray-500 focus:outline-none focus:border-amber-400"
              maxLength={15}
              autoFocus
            />
            {error && <p className="text-xs text-red-400 font-bold mt-2">⚠️ {error}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full btn-superlist-primary py-4 text-base">
            {loading ? '등록 중...' : '집현전 시작하기 ➔'}
          </button>
        </form>
      </div>
    </div>
  );
}

// 4. Superlist Dashboard Component
function Dashboard({ user, onSelectGame, onOpenBoss, onOpenRanking }) {
  const isBossUnlocked = user && user.gold >= 100;
  const bossProgressPercent = user ? Math.min(100, Math.floor((user.gold / 100) * 100)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      
      {/* Superlist Hero Section */}
      <div className="space-y-4 text-center md:text-left">
        <div className="inline-flex items-center gap-2 superlist-pill px-4 py-1.5 text-xs font-bold text-amber-300">
          <span>✨</span>
          <span>훈민정음 6학년 국어 맞춤법 • 집현전 학당</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              집현전 맞춤법 대결 <span className="text-amber-400">.</span>
            </h2>
            <p className="text-sm sm:text-base text-amber-100/70 max-w-2xl font-normal">
              반갑습니다, <strong className="text-amber-300">{user?.nickname}</strong> 학사님! 미니게임으로 엽전을 모아 실력을 쌓고, <strong className="text-amber-300">100 Gold</strong>를 달성하여 세종대왕 AI와의 맞춤법 레이스에서 승리하세요.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex items-center justify-center gap-3">
            <div className="superlist-card px-5 py-3 text-center min-w-[100px]">
              <p className="text-[10px] text-amber-200/60 uppercase font-bold">보유 엽전</p>
              <p className="text-lg font-black text-amber-400">🪙 {user?.gold || 0}</p>
            </div>
            <div className="superlist-card px-5 py-3 text-center min-w-[100px]">
              <p className="text-[10px] text-amber-200/60 uppercase font-bold">총 플레이</p>
              <p className="text-lg font-black text-red-400">{user?.total_play_count || 0}회</p>
            </div>
            <div className="superlist-card px-5 py-3 text-center min-w-[100px]">
              <p className="text-[10px] text-amber-200/60 uppercase font-bold">보스 최고점</p>
              <p className="text-lg font-black text-blue-400">{user?.boss_high_score || 0}/10</p>
            </div>
          </div>
        </div>
      </div>

      {/* SUPERLIST SPLIT GRID (FEATURED HERO CARD & MINI-GAMES) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: FEATURED BOSS CARD (Lg 5-Cols) */}
        <div className={`lg:col-span-5 superlist-card p-8 flex flex-col justify-between relative overflow-hidden border-2 ${
          isBossUnlocked ? 'border-amber-400/60 bg-gradient-to-b from-[#2a1d13] to-[#1e1a17]' : 'border-white/10'
        }`}>
          {/* Background Glow Placeholder */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                isBossUnlocked ? 'bg-amber-400 text-amber-950' : 'bg-white/10 text-amber-200/70'
              }`}>
                최종 관문 • 보스전
              </span>
              <span className="text-3xl">👑</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                세종대왕 맞춤법 대결
              </h3>
              <p className="text-xs sm:text-sm text-amber-100/70 leading-relaxed">
                세종대왕 AI와 10문항 실시간 퀴즈 레이스를 펼칩니다! 승리 시 조선 왕실 교지 인증서와 칭호를 수여받습니다.
              </p>
            </div>

            {/* AI Avatar Placeholder Image Box */}
            <div className="bg-black/40 rounded-2xl p-4 border border-white/10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-3xl shadow">
                🤴
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-200">세종대왕 AI (상대)</h4>
                <p className="text-xs text-amber-100/60">난이도별 70% / 85% / 95% 정답률</p>
              </div>
            </div>

            {/* Gold Unlock Progress Bar */}
            {!isBossUnlocked && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold text-amber-200/70">
                  <span>해금 조건 (100 G 필요)</span>
                  <span>{user?.gold || 0} / 100 G ({bossProgressPercent}%)</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500" style={{ width: `${bossProgressPercent}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 relative z-10">
            {isBossUnlocked ? (
              <button onClick={() => { sounds.playClick(); onOpenBoss(); }} className="w-full btn-superlist-gold py-4 text-base">
                세종대왕님께 도전! ➔
              </button>
            ) : (
              <button disabled className="w-full bg-white/5 text-gray-500 py-3.5 rounded-xl font-bold text-sm cursor-not-allowed border border-white/10">
                🔒 엽전 100개 필요 ({100 - (user?.gold || 0)}G 부족)
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: MINI-GAMES GRID (Lg 7-Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🎮</span> 미니게임 카드 목록 (엽전 획득)
            </h3>
            <span className="text-xs text-amber-200/60">플레이당 1~3분</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Game 1 */}
            <div onClick={() => { sounds.playClick(); onSelectGame('dictation'); }} className="superlist-card p-6 cursor-pointer flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold border border-amber-500/30">⚡</span>
                  <span className="superlist-pill px-2.5 py-0.5 text-[10px] font-bold text-amber-300">스피드 모드</span>
                </div>
                <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  ① 받아쓰기 배틀
                </h4>
                <p className="text-xs text-amber-100/60 leading-relaxed">
                  8초 안에 문장 속 맞춤법 빈칸을 채우세요! 남은 제한시간 스피드 보너스 및 3연속 콤보 보너스!
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-400">
                <span>10문항 세션</span>
                <span className="group-hover:translate-x-1 transition-transform">플레이 ➔</span>
              </div>
            </div>

            {/* Game 2 */}
            <div onClick={() => { sounds.playClick(); onSelectGame('relay'); }} className="superlist-card p-6 cursor-pointer flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-bold border border-blue-500/30">📖</span>
                  <span className="superlist-pill px-2.5 py-0.5 text-[10px] font-bold text-blue-300">스토리 완성</span>
                </div>
                <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  ② 문장 완성 릴레이
                </h4>
                <p className="text-xs text-amber-100/60 leading-relaxed">
                  자주 틀리는 맞춤법 문장의 뒷부분을 올바르게 완성하여 명작 이야기를 이어 만드세요!
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-400">
                <span>스토리 완성 보너스</span>
                <span className="group-hover:translate-x-1 transition-transform">플레이 ➔</span>
              </div>
            </div>

            {/* Game 3 */}
            <div onClick={() => { sounds.playClick(); onSelectGame('falling'); }} className="sm:col-span-2 superlist-card p-6 cursor-pointer flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold border border-emerald-500/30">✍️</span>
                  <span className="superlist-pill px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">타이핑 / 선택 디펜스</span>
                </div>
                <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  ③ 낙하 단어 수호전
                </h4>
                <p className="text-xs text-amber-100/60 leading-relaxed">
                  천천히 내려오는 구름 속 올바른 맞춤법을 키보드로 타이핑하거나 선택해 물리치세요! 3번의 틀린 입력 시 종료!
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>틀린 입력 3회 제한 / 디펜스 모드</span>
                <span className="group-hover:translate-x-1 transition-transform">플레이 ➔</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* SUPERLIST INTERACTIVE QUESTION FEED PREVIEW */}
      <div className="superlist-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">6학년 필수 맞춤법 퀴즈 미리보기</h3>
            <p className="text-xs text-amber-100/60 mt-0.5">자주 헷갈리는 45가지 핵심 단어를 게임에서 학습합니다.</p>
          </div>
          <span className="superlist-pill px-3 py-1 text-xs font-bold text-amber-300">45+ 문항 보유</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {[
            { word: '되 / 돼', ex: '오늘 밤부터 비가 오기 시작{돼}어요.' },
            { word: '안 / 않', ex: '숙제를 하지 {않}았습니다.' },
            { word: '낫다 / 났다 / 낳다', ex: '감기가 싹 {낫}았다.' },
            { word: '어떡해 / 어떻게', ex: '소풍날 비가 오면 {어떻게} 하지?' },
            { word: '왠지 / 웬', ex: '오늘은 {왠지} 좋은 예감이 든다.' },
            { word: '며칠 / 몇일', ex: '안 본 지 {며칠} 되었을까?' },
            { word: '금세 / 금새', ex: '사탕이 {금세} 사라졌다.' },
            { word: '오랜만 / 오랫만', ex: '정말 {오랜만}에 만났어!' }
          ].map((item, idx) => (
            <div key={idx} className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-1">
              <span className="text-xs font-black text-amber-400">{item.word}</span>
              <p className="text-xs text-amber-100/80 leading-snug">{item.ex}</p>
            </div>
          ))}
        </div>
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

  if (questions.length === 0) return <div className="text-center p-8 text-amber-300">문제를 로딩 중...</div>;

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onGoHome} className="superlist-pill px-4 py-2 text-xs font-bold text-white hover:bg-white/10">
          🏠 로비로 이동
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-amber-300">문제 {currentIndex + 1} / 10</span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold">🪙 +{totalGold} G</span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="superlist-card p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-amber-300">⏰ 제한시간</span>
              <span className={`text-base font-black ${timeLeft <= 3 ? 'text-red-400' : 'text-amber-300'}`}>{timeLeft}초</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
              <div className={`h-full transition-all duration-1000 ${timeLeft <= 3 ? 'bg-red-500' : 'bg-amber-400'}`} style={{ width: `${(timeLeft / 8) * 100}%` }} />
            </div>
          </div>

          {combo >= 2 && (
            <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full inline-block">
              🔥 {combo} 연속 정답! (콤보 보너스 획득 중!)
            </div>
          )}

          <div className="bg-black/40 p-6 rounded-2xl border border-white/10 text-center">
            <h3 className="text-xl sm:text-2xl font-bold leading-relaxed text-white">
              {currentQ?.sentence.replace('{blank}', ' [  ?  ] ')}
            </h3>
          </div>

          <div className={`grid ${currentQ?.options.length > 2 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'} gap-4`}>
            {currentQ?.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={feedback !== null}
                onClick={() => handleSelectOption(opt)}
                className="py-4 px-6 bg-white/5 hover:bg-white/10 disabled:opacity-60 text-white text-xl font-bold rounded-xl border border-white/10 hover:border-amber-400 transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`p-4 rounded-xl border ${feedback.isCorrect ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/60 border-rose-500/50 text-rose-200'}`}>
              <div className="font-extrabold text-sm flex items-center gap-2">
                {feedback.isCorrect ? '정답입니다! 👏' : '오답입니다!'}
                {feedback.isCorrect && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">+{feedback.earned} Gold</span>}
              </div>
              <p className="text-xs mt-1.5 leading-relaxed opacity-90">💡 {feedback.tip}</p>
              <button onClick={handleNextQuestion} className="mt-4 w-full btn-superlist-primary py-3 text-sm">
                {currentIndex + 1 >= questions.length ? '결과 확인하기 ➔' : '다음 문제 ➔'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="superlist-card p-8 text-center space-y-6">
          <div className="text-4xl">🎯</div>
          <h3 className="text-2xl font-black text-white">받아쓰기 배틀 완료!</h3>
          <div className="grid grid-cols-3 gap-3 bg-black/40 p-4 rounded-xl border border-white/10">
            <div><p className="text-[10px] text-amber-200/60 uppercase">정답수</p><p className="text-lg font-extrabold text-amber-400">{score} / 10</p></div>
            <div><p className="text-[10px] text-amber-200/60 uppercase">최대 콤보</p><p className="text-lg font-extrabold text-blue-400">{maxCombo}회</p></div>
            <div><p className="text-[10px] text-amber-200/60 uppercase">획득 엽전</p><p className="text-lg font-extrabold text-yellow-400">+{totalGold} G</p></div>
          </div>
          <button onClick={onGoHome} className="w-full btn-superlist-primary py-3.5 text-base">로비로 이동 ➔</button>
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

  if (!selectedStory) return <div className="text-center p-8 text-amber-300">이야기 로딩 중...</div>;

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
        <button onClick={onGoHome} className="superlist-pill px-4 py-2 text-xs font-bold text-white hover:bg-white/10">
          🏠 로비로 이동
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-blue-400">단계 {stepIndex + 1} / {selectedStory.steps.length}</span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold">🪙 +{totalGold} G</span>
        </div>
      </div>

      {!isFinished ? (
        <div className="superlist-card p-6 sm:p-8 space-y-6">
          <div className="text-center pb-3 border-b border-white/10">
            <span className="superlist-pill px-3 py-1 text-xs font-bold text-blue-300">📜 {selectedStory.title}</span>
            <h3 className="text-xl font-bold text-white mt-2">문장의 뒷부분을 올바른 맞춤법으로 완성하세요!</h3>
          </div>

          <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-xs space-y-1.5 text-amber-100/80 max-h-40 overflow-y-auto">
            {completedSentences.length === 0 ? <p className="italic text-gray-400 text-center">이야기가 시작됩니다...</p> : (
              completedSentences.map((s, idx) => <p key={idx}>Step {idx + 1}. {s}</p>)
            )}
          </div>

          <div className="bg-white/5 p-5 rounded-xl border border-white/10">
            <p className="text-xs font-bold text-blue-400">이어질 이야기:</p>
            <p className="text-base font-bold text-white mt-1">"{currentStep.prompt} [ ... ]"</p>
          </div>

          <div className="space-y-3">
            {currentStep.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={feedback !== null}
                onClick={() => handleSelectOption(opt)}
                className="w-full text-left p-4 bg-white/5 hover:bg-white/10 disabled:opacity-60 rounded-xl border border-white/10 font-bold text-sm text-white flex items-center justify-between group"
              >
                <span>{opt.text}</span>
                <span className="group-hover:translate-x-1 transition-transform">➔</span>
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`p-4 rounded-xl border ${feedback.isCorrect ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/60 border-rose-500/50 text-rose-200'}`}>
              <div className="font-extrabold text-sm flex items-center gap-2">
                {feedback.isCorrect ? '올바른 문장입니다! 🎉' : '맞춤법이 어색합니다!'}
                {feedback.isCorrect && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">+{feedback.earned} Gold</span>}
              </div>
              <p className="text-xs mt-1.5 leading-relaxed opacity-90">💡 {feedback.tip}</p>
              <button onClick={handleNextStep} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm">
                {stepIndex + 1 >= selectedStory.steps.length ? '완성된 이야기 보기 ➔' : '다음 문장 ➔'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="superlist-card p-8 text-center space-y-6">
          <div className="text-4xl">📜</div>
          <h3 className="text-2xl font-black text-blue-400">"{selectedStory.title}" 완성!</h3>
          <div className="bg-black/40 p-5 rounded-xl border border-white/10 text-left space-y-2 text-xs leading-relaxed text-amber-100/90">
            {completedSentences.map((s, idx) => <p key={idx}>• {s}</p>)}
          </div>
          <div className="font-bold text-amber-400 text-base">총 획득 엽전: +{totalGold} Gold</div>
          <button onClick={onGoHome} className="w-full btn-superlist-primary py-3.5 text-base">로비로 이동 ➔</button>
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
  const [inputValue, setInputValue] = useState('');
  const [fallingWords, setFallingWords] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedbackEffect, setFeedbackEffect] = useState(null);

  const requestRef = useRef();
  const lastSpawnTime = useRef(Date.now());
  const speedRef = useRef(0.25);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const inputRef = useRef(null);

  useEffect(() => { livesRef.current = lives; }, [lives]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver || !quizData || !quizData.questions) return;
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
      setSurvivalTime(s => s + 1);
    }, 1000);

    const updateLoop = () => {
      const now = Date.now();
      if (now - lastSpawnTime.current > 3500) {
        lastSpawnTime.current = now;
        const randomItem = wordPool[Math.floor(Math.random() * wordPool.length)];
        setFallingWords(prev => [
          ...prev,
          {
            id: 'w_' + Date.now() + '_' + Math.random(),
            sentence: randomItem.displayedText,
            correctAnswer: randomItem.correctAnswer,
            options: randomItem.options,
            tip: randomItem.tip,
            x: 10 + Math.random() * 70,
            y: 0,
            speed: speedRef.current
          }
        ]);
      }

      setFallingWords(prev => {
        const nextWords = [];
        for (let word of prev) {
          const newY = word.y + word.speed;
          if (newY >= 88) {
            sounds.playWrong();
            livesRef.current -= 1;
            setLives(livesRef.current);
            setFeedbackEffect({ type: 'wrong', msg: `시간 초과! 올바른 표기는 '${word.correctAnswer}'` });
            setTimeout(() => setFeedbackEffect(null), 1200);

            if (livesRef.current <= 0) { endGame(); return []; }
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

  const handleCheckAnswer = (answerText) => {
    if (isGameOver || !answerText || fallingWords.length === 0) return;
    const targetAnswer = answerText.trim();
    const matchIndex = fallingWords.findIndex(w => w.correctAnswer.toLowerCase() === targetAnswer.toLowerCase());

    if (matchIndex !== -1) {
      sounds.playCorrect();
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setTotalGold(g => g + 10);
      setFeedbackEffect({ type: 'correct', msg: '정답! (+10 G)' });
      setTimeout(() => setFeedbackEffect(null), 800);
      setFallingWords(prev => prev.filter((_, idx) => idx !== matchIndex));
      setInputValue('');
    } else {
      sounds.playWrong();
      livesRef.current -= 1;
      setLives(livesRef.current);
      setFeedbackEffect({ type: 'wrong', msg: `오답입니다! (틀린 입력: ${targetAnswer})` });
      setTimeout(() => setFeedbackEffect(null), 1200);
      setInputValue('');
      if (livesRef.current <= 0) endGame();
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
        <button onClick={onGoHome} className="superlist-pill px-4 py-2 text-xs font-bold text-white hover:bg-white/10">
          🏠 로비로 이동
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-red-500 font-bold">
            {'❤️'.repeat(Math.max(0, lives))}
          </div>
          <span className="text-xs font-bold text-emerald-400">정답 수: {score}개 ({survivalTime}초)</span>
        </div>
      </div>

      {!isGameOver ? (
        <div className="space-y-4">
          <div className="relative w-full h-[400px] bg-gradient-to-b from-black/40 via-[#1e1a17] to-black/60 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-red-950/40 border-t border-red-500/40 flex items-center justify-center text-xs font-bold text-red-400">
              ⚠️ 바닥에 닿기 전에 올바른 맞춤법을 입력하세요!
            </div>

            {fallingWords.map((word) => (
              <div key={word.id} className="absolute transform -translate-x-1/2 px-4 py-2.5 bg-[#2a241f] text-white font-bold text-sm sm:text-base rounded-2xl border border-amber-500/30 shadow-lg" style={{ left: `${word.x}%`, top: `${word.y}%` }}>
                <div className="flex flex-col items-center">
                  <span className="text-amber-200">{word.sentence}</span>
                  <div className="flex gap-1.5 mt-1.5">
                    {word.options.map((opt, idx) => (
                      <button key={idx} onClick={() => handleCheckAnswer(opt)} className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 text-xs font-black rounded border border-amber-500/40">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {feedbackEffect && (
              <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full font-bold text-xs shadow-xl z-20 ${feedbackEffect.type === 'correct' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                {feedbackEffect.msg}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="올바른 맞춤법 입력 (예: 돼 / 오랜만 / 안)"
              className="flex-1 px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white font-bold text-base focus:outline-none focus:border-emerald-400"
            />
            <button type="submit" className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow">
              입력 ➔
            </button>
          </form>
        </div>
      ) : (
        <div className="superlist-card p-8 text-center space-y-6">
          <div className="text-4xl">✍️</div>
          <h3 className="text-2xl font-black text-emerald-400">낙하 단어 수호전 종료!</h3>
          <p className="text-xs text-amber-200/60">3번의 틀린 입력으로 게임이 종료되었습니다.</p>
          <div className="grid grid-cols-3 gap-3 bg-black/40 p-4 rounded-xl border border-white/10">
            <div><p className="text-[10px] text-amber-200/60 uppercase">맞힌 수</p><p className="text-lg font-extrabold text-emerald-400">{score}개</p></div>
            <div><p className="text-[10px] text-amber-200/60 uppercase">버틴시간</p><p className="text-lg font-extrabold text-blue-400">{survivalTime}초</p></div>
            <div><p className="text-[10px] text-amber-200/60 uppercase">획득 엽전</p><p className="text-lg font-extrabold text-yellow-400">+{totalGold} G</p></div>
          </div>
          <button onClick={onGoHome} className="w-full btn-superlist-primary py-3.5 text-base">로비로 이동 ➔</button>
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
        <button onClick={onGoHome} className="superlist-pill px-4 py-2 text-xs font-bold text-white hover:bg-white/10">
          🏠 로비로 이동
        </button>
        {difficulty && !isMatchFinished && (
          <div className="text-xs font-bold text-amber-400">⏰ {timeSeconds}초 경과</div>
        )}
      </div>

      {!difficulty ? (
        <div className="superlist-card p-8 text-center space-y-8">
          <div className="text-4xl">👑</div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">세종대왕 AI 대결 난이도 선택</h2>
          <p className="text-xs text-amber-100/60">도전 시 <strong>엽전 100개</strong>가 차감됩니다.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div onClick={() => handleStartMatch('easy')} className="bg-white/5 hover:bg-white/10 p-6 rounded-2xl cursor-pointer text-center border border-emerald-500/40">
              <div className="text-3xl mb-1">🌱</div>
              <h3 className="font-bold text-base text-emerald-400">쉬움</h3>
              <p className="text-[10px] text-gray-400 mt-1">AI 정답률 70%</p>
            </div>
            <div onClick={() => handleStartMatch('normal')} className="bg-white/5 hover:bg-white/10 p-6 rounded-2xl cursor-pointer text-center border border-amber-500/40">
              <div className="text-3xl mb-1">📜</div>
              <h3 className="font-bold text-base text-amber-400">보통</h3>
              <p className="text-[10px] text-gray-400 mt-1">AI 정답률 85%</p>
            </div>
            <div onClick={() => handleStartMatch('hard')} className="bg-white/5 hover:bg-white/10 p-6 rounded-2xl cursor-pointer text-center border border-red-500/40">
              <div className="text-3xl mb-1">🔥</div>
              <h3 className="font-bold text-base text-red-400">어려움</h3>
              <p className="text-[10px] text-gray-400 mt-1">AI 정답률 95%</p>
            </div>
          </div>
        </div>
      ) : !isMatchFinished ? (
        <div className="superlist-card p-6 sm:p-8 space-y-6">
          <div className="bg-black/40 p-5 rounded-xl border border-white/10 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-amber-300">
                <span>🧑‍🎓 {user.nickname} 학사 (나)</span>
                <span>{studentScore} / 10 문제</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(studentScore / 10) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-blue-400">
                <span>👑 세종대왕 AI</span>
                <span>{aiScore} / 10 문제</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(aiScore / 10) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
            <span className="superlist-pill px-3 py-1 text-xs font-bold text-amber-300">문제 {currentIndex + 1} / 10</span>
            <h3 className="text-xl sm:text-2xl font-bold leading-relaxed text-white mt-3">
              {currentQ?.sentence.replace('{blank}', ' [  ?  ] ')}
            </h3>
          </div>

          <div className={`grid ${currentQ?.options.length > 2 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'} gap-4`}>
            {currentQ?.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={feedback !== null}
                onClick={() => handleSelectOption(opt)}
                className="py-4 px-6 bg-white/5 hover:bg-white/10 text-white text-xl font-extrabold rounded-xl border border-white/10 hover:border-amber-400"
              >
                {opt}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`p-4 rounded-xl border ${feedback.isCorrect ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/60 border-rose-500/50 text-rose-200'}`}>
              <h4 className="font-bold text-sm">{feedback.isCorrect ? '정답입니다!' : '오답입니다!'}</h4>
              <p className="text-xs mt-1">💡 {feedback.tip}</p>
              <button onClick={handleNextQuestion} className="mt-4 w-full btn-superlist-primary py-3 text-sm">
                {currentIndex + 1 >= 10 ? '대결 결과 보기 ➔' : '다음 문제 ➔'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="superlist-card p-8 text-center space-y-6">
          {matchResult?.isWin ? (
            <div className="bg-black/40 p-6 rounded-2xl border border-amber-500/40 space-y-3">
              <div className="text-lg font-black text-amber-400 tracking-widest">敎 旨 (교 지)</div>
              <h3 className="text-2xl font-extrabold text-white">맞춤법 대결 승리 인증서</h3>
              <p className="text-xs text-amber-100/80">
                학사 <strong>{user.nickname}</strong>은 세종대왕과의 맞춤법 대결에서 훌륭한 성적({matchResult.finalScore} / 10 정답, {matchResult.elapsed}초)을 거두었으므로 아래 칭호를 수여함.
              </p>
              <div className="superlist-pill text-amber-300 font-bold px-4 py-2 text-sm inline-block">
                칭호: {matchResult.title}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">📜</div>
              <h3 className="text-2xl font-bold text-white">세종대왕 AI 승리!</h3>
              <p className="text-xs text-amber-100/60">나 ({matchResult?.finalScore}점) vs 세종대왕 ({matchResult?.aiFinalScore}점)</p>
            </div>
          )}

          <button onClick={onGoHome} className="w-full btn-superlist-primary py-3.5 text-base">로비로 이동 ➔</button>
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
        <button onClick={onGoHome} className="superlist-pill px-4 py-2 text-xs font-bold text-white hover:bg-white/10">
          🏠 로비로 이동
        </button>
        <button onClick={fetchRankings} className="superlist-pill p-2 text-xs text-white">🔄</button>
      </div>

      <div className="superlist-card p-6 sm:p-8 text-center space-y-6">
        <div className="text-4xl">👑</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">집현전 명예의 전당</h2>

        <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/10 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('boss')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold ${activeTab === 'boss' ? 'bg-amber-500 text-amber-950 shadow' : 'text-amber-100/60'}`}
          >
            🏆 탭 A. 세종대왕 대결 최고점
          </button>
          <button
            onClick={() => setActiveTab('play')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold ${activeTab === 'play' ? 'bg-blue-600 text-white shadow' : 'text-amber-100/60'}`}
          >
            🔥 탭 B. 열정 도전 횟수 왕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-amber-400 font-bold text-xs">랭킹 불러오는 중...</div>
        ) : (
          <div className="space-y-3 text-left">
            {activeTab === 'boss' ? (
              bossRankings.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${idx === 0 ? 'bg-amber-500/10 border-amber-500/40' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">{getRankBadge(idx)}</span>
                    <div>
                      <div className="font-extrabold text-white text-sm">{item.nickname}</div>
                      <div className="text-[10px] text-amber-200/60">엽전: {item.gold} G</div>
                    </div>
                  </div>
                  <div className="text-right font-black text-sm text-amber-400">
                    {item.boss_high_score} / 10 정답 ({item.boss_fastest_time}초)
                  </div>
                </div>
              ))
            ) : (
              playRankings.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${idx === 0 ? 'bg-blue-500/10 border-blue-500/40' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">{getRankBadge(idx)}</span>
                    <div>
                      <div className="font-extrabold text-white text-sm">{item.nickname}</div>
                      <div className="text-[10px] text-amber-200/60">엽전: {item.gold} G</div>
                    </div>
                  </div>
                  <div className="text-right font-black text-sm text-blue-400">
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
    <div className="min-h-screen flex flex-col bg-[#14110f] text-white">
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
          <div className="flex items-center justify-center min-h-[60vh] text-amber-400 font-bold text-sm">
            집현전에 접속 중입니다...
          </div>
        )}
      </main>

      {showLoginModal && <LoginModal onLogin={handleLogin} />}

      <footer className="py-6 text-center text-xs text-amber-200/40 border-t border-white/5 bg-black/40">
        <p>집현전 맞춤법 대결 • Superlist 에디션 © 2026 초등 국어 맞춤법 학습 프로젝트</p>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
