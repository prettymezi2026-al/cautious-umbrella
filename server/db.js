import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = process.env.VERCEL ? path.join('/tmp', 'database.json') : path.join(__dirname, 'data', 'database.json');

const INITIAL_DATA = {
  users: [
    {
      id: "seed_1",
      nickname: "한글으뜸이",
      gold: 450,
      total_play_count: 24,
      boss_high_score: 10,
      boss_fastest_time: 35,
      boss_play_count: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed_2",
      nickname: "집현전수석",
      gold: 320,
      total_play_count: 18,
      boss_high_score: 10,
      boss_fastest_time: 41,
      boss_play_count: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed_3",
      nickname: "맞춤법달인",
      gold: 210,
      total_play_count: 15,
      boss_high_score: 9,
      boss_fastest_time: 38,
      boss_play_count: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "seed_4",
      nickname: "훈민정음학사",
      gold: 180,
      total_play_count: 12,
      boss_high_score: 8,
      boss_fastest_time: 48,
      boss_play_count: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  game_records: []
};

// In-memory cache to guarantee zero-crash execution
let memoryCache = { ...INITIAL_DATA, users: [...INITIAL_DATA.users] };

function readDB() {
  if (memoryCache && memoryCache.users) return memoryCache;
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      memoryCache = JSON.parse(raw);
    } else {
      writeDB(INITIAL_DATA);
    }
  } catch (err) {
    console.error("DB Read Warning (using memory fallback):", err);
    memoryCache = { ...INITIAL_DATA, users: [...INITIAL_DATA.users] };
  }
  return memoryCache;
}

function writeDB(data) {
  memoryCache = data;
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("DB Write Warning (memory persisted):", err);
  }
}

export const db = {
  loginOrRegister(nickname) {
    const data = readDB();
    const cleanNick = nickname.trim();
    let user = data.users.find(u => u.nickname && u.nickname.toLowerCase() === cleanNick.toLowerCase());

    if (!user) {
      user = {
        id: 'u_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        nickname: cleanNick,
        gold: 0,
        total_play_count: 0,
        boss_high_score: 0,
        boss_fastest_time: 999,
        boss_play_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      data.users.push(user);
      writeDB(data);
    }
    return user;
  },

  getUser(nickname) {
    const data = readDB();
    return data.users.find(u => u.nickname && u.nickname.toLowerCase() === nickname.trim().toLowerCase()) || null;
  },

  addGoldAndPlay(nickname, goldEarned, gameType) {
    const data = readDB();
    const cleanNick = nickname.trim();
    const user = data.users.find(u => u.nickname && u.nickname.toLowerCase() === cleanNick.toLowerCase());
    
    if (!user) return null;

    user.gold = Math.max(0, user.gold + goldEarned);
    user.total_play_count += 1;
    user.updated_at = new Date().toISOString();

    data.game_records.push({
      id: 'rec_' + Date.now(),
      user_id: user.id,
      nickname: user.nickname,
      game_type: gameType,
      gold_earned: goldEarned,
      timestamp: new Date().toISOString()
    });

    writeDB(data);
    return user;
  },

  saveBossResult(nickname, score, timeSeconds, goldDeduction = 100) {
    const data = readDB();
    const cleanNick = nickname.trim();
    const user = data.users.find(u => u.nickname && u.nickname.toLowerCase() === cleanNick.toLowerCase());

    if (!user) return null;

    user.gold = Math.max(0, user.gold - goldDeduction);
    user.boss_play_count += 1;
    user.total_play_count += 1;

    if (score > user.boss_high_score || (score === user.boss_high_score && timeSeconds < user.boss_fastest_time)) {
      user.boss_high_score = score;
      user.boss_fastest_time = timeSeconds;
    }

    user.updated_at = new Date().toISOString();

    data.game_records.push({
      id: 'boss_' + Date.now(),
      user_id: user.id,
      nickname: user.nickname,
      game_type: 'boss_duel',
      score: score,
      time_seconds: timeSeconds,
      timestamp: new Date().toISOString()
    });

    writeDB(data);
    return user;
  },

  getBossRankings(limit = 20) {
    const data = readDB();
    const filtered = data.users.filter(u => u.boss_high_score > 0);
    filtered.sort((a, b) => {
      if (b.boss_high_score !== a.boss_high_score) {
        return b.boss_high_score - a.boss_high_score;
      }
      return a.boss_fastest_time - b.boss_fastest_time;
    });
    return filtered.slice(0, limit);
  },

  getPlayRankings(limit = 20) {
    const data = readDB();
    const sorted = [...data.users];
    sorted.sort((a, b) => b.total_play_count - a.total_play_count);
    return sorted.slice(0, limit);
  }
};
