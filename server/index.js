import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve Static Frontend Assets from public/
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Quiz Data Fallback to guarantee zero file missing errors on Vercel Lambda
let spellingData = { questions: [], relayStories: [] };

try {
  const quizDataPath = path.join(__dirname, 'data', 'spelling_data.json');
  if (fs.existsSync(quizDataPath)) {
    const raw = fs.readFileSync(quizDataPath, 'utf-8');
    spellingData = JSON.parse(raw);
  }
} catch (err) {
  console.error("Warning reading spelling_data.json:", err);
}

// 1. Quiz Data Endpoint
app.get('/api/quiz', (req, res) => {
  res.json(spellingData);
});

// 2. Login or Register Endpoint
app.post('/api/login', (req, res) => {
  try {
    const { nickname } = req.body;
    if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
      return res.status(400).json({ error: '닉네임을 올바르게 입력해주세요.' });
    }
    const user = db.loginOrRegister(nickname);
    res.json({ success: true, user });
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ error: '로그인 처리 중 오류 발생' });
  }
});

// 3. Get User Info
app.get('/api/user/:nickname', (req, res) => {
  try {
    const user = db.getUser(req.params.nickname);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: '사용자 조회 중 오류 발생' });
  }
});

// 4. Update Gold & Play Count for Mini-games
app.post('/api/user/gold', (req, res) => {
  try {
    const { nickname, goldEarned, gameType } = req.body;
    if (!nickname) {
      return res.status(400).json({ error: '닉네임이 필요합니다.' });
    }
    const updatedUser = db.addGoldAndPlay(nickname, parseInt(goldEarned) || 0, gameType || 'minigame');
    if (!updatedUser) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: '골드 저장 중 오류 발생' });
  }
});

// 5. Submit Boss Duel Result
app.post('/api/boss/result', (req, res) => {
  try {
    const { nickname, score, timeSeconds } = req.body;
    if (!nickname) {
      return res.status(400).json({ error: '닉네임이 필요합니다.' });
    }
    
    const user = db.getUser(nickname);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const updatedUser = db.saveBossResult(nickname, parseInt(score) || 0, parseInt(timeSeconds) || 0, 100);
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: '보스전 결과 저장 중 오류 발생' });
  }
});

// 6. Get Rankings
app.get('/api/rankings', (req, res) => {
  try {
    const bossRankings = db.getBossRankings(20);
    const playRankings = db.getPlayRankings(20);
    res.json({ bossRankings, playRankings });
  } catch (err) {
    res.status(500).json({ error: '랭킹 조회 중 오류 발생' });
  }
});

// Fallback to index.html for SPA routes when running locally
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Export app for Vercel Serverless
export default app;

// Start Server locally
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`[집현전 맞춤법 대결 Backend API Server Running on port ${PORT}]`);
  });
}
