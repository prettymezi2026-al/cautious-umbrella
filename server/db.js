import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Ensure directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Initial DB state with sample seed users for realistic rankings
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

// Read database
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDB(INITIAL_DATA);
      return INITIAL_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("DB Read Error:", err);
    return INITIAL_DATA;
  }
}

// Write database atomically
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("DB Write Error:", err);
  }
}

export const db = {
  // Get or login user by nickname
  loginOrRegister(nickname) {
    const data = readDB();
    const cleanNick = nickname.trim();
    let user = data.users.find(u => u.nickname.toLowerCase() === cleanNick.toLowerCase());

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

  // Get user profile
  getUser(nickname) {
    const data = readDB();
    return data.users.find(u => u.nickname.toLowerCase() === nickname.trim().toLowerCase()) || null;
  },

  // Update user gold & play count
  addGoldAndPlay(nickname, goldEarned, gameType) {
    const data = readDB();
    const cleanNick = nickname.trim();
    const user = data.users.find(u => u.nickname.toLowerCase() === cleanNick.toLowerCase());
    
    if (!user) return null;

    user.gold = Math.max(0, user.gold + goldEarned);
    user.total_play_count += 1;
    user.updated_at = new Date().toISOString();

    // Log record
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

  // Record boss duel result
  saveBossResult(nickname, score, timeSeconds, goldDeduction = 100) {
    const data = readDB();
    const cleanNick = nickname.trim();
    const user = data.users.find(u => u.nickname.toLowerCase() === cleanNick.toLowerCase());

    if (!user) return null;

    // Deduct entry gold if provided
    user.gold = Math.max(0, user.gold - goldDeduction);
    user.boss_play_count += 1;
    user.total_play_count += 1;

    // Update high score & fastest time (if equal score, faster time wins)
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

  // Tab A Ranking: Boss score DESC, fastest time ASC
  getBossRankings(limit = 20) {
    const data = readDB();
    const filtered = data.users.filter(u => u.boss_high_score > 0);
    filtered.sort((a, b) => {
      if (b.boss_high_score !== a.boss_high_score) {
        return b.boss_high_score - a.boss_high_score; // Higher score first
      }
      return a.boss_fastest_time - b.boss_fastest_time; // Lower time first
    });
    return filtered.slice(0, limit);
  },

  // Tab B Ranking: Total play count DESC
  getPlayRankings(limit = 20) {
    const data = readDB();
    const sorted = [...data.users];
    sorted.sort((a, b) => b.total_play_count - a.total_play_count);
    return sorted.slice(0, limit);
  }
};
