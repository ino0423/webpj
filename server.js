const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer'); // 파일 업로드 라이브러리
const path = require('path');     // 경로 처리 라이브러리
const app = express();

app.use(cors());
app.use(express.json());

// ★ 업로드된 이미지 파일을 브라우저에서 볼 수 있게 공개 설정
app.use('/uploads', express.static('uploads'));

// 1. MySQL 연결 설정 (비밀번호 변경 필수!)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ino7541!', // ★ 본인 DB 비밀번호 입력
    database: 'sports_db'
});

db.connect((err) => {
    if (err) console.error('MySQL 연결 실패:', err);
    else console.log('MySQL 연결 성공 (이미지 업로드 준비 완료)');
});

// 2. 파일 업로드 설정 (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // uploads 폴더에 저장
    },
    filename: (req, file, cb) => {
        // 파일명 중복 방지를 위해 날짜값 붙임
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 3. 축구 API 설정 (Football-Data.org)
const FOOTBALL_API_KEY = '0fcade12f25e41d1a55d9fa90dddf468'; // ★ API 키 입력
const FOOTBALL_BASE_URL = 'https://api.football-data.org/v4/competitions';

// --- [API] 축구 데이터 ---

app.get('/api/soccer/:league', async (req, res) => {
    try {
        const response = await axios.get(`${FOOTBALL_BASE_URL}/${req.params.league}/standings`, {
            headers: { 'X-Auth-Token': FOOTBALL_API_KEY }
        });
        res.json(response.data.standings[0].table.map(t => ({
            rank: t.position, name: t.team.name, p: t.playedGames, pts: t.points,
            w: t.won, d: t.draw, l: t.lost, gd: t.goalDifference
        })));
    } catch (error) { res.status(500).json({ message: 'API 오류' }); }
});

app.get('/api/soccer/:league/matches', async (req, res) => {
    try {
        const response = await axios.get(`${FOOTBALL_BASE_URL}/${req.params.league}/matches?status=SCHEDULED`, {
            headers: { 'X-Auth-Token': FOOTBALL_API_KEY }
        });
        res.json(response.data.matches.slice(0, 10).map(m => ({
            date: m.utcDate.split('T')[0], time: m.utcDate.split('T')[1].slice(0, 5),
            home: m.homeTeam.name, away: m.awayTeam.name, stadium: `${m.matchday}라운드`
        })));
    } catch (error) { res.status(500).json({ message: '오류' }); }
});

app.get('/api/soccer/:league/results', async (req, res) => {
    try {
        const response = await axios.get(`${FOOTBALL_BASE_URL}/${req.params.league}/matches?status=FINISHED`, {
            headers: { 'X-Auth-Token': FOOTBALL_API_KEY }
        });
        res.json(response.data.matches.slice(-10).reverse().map(m => ({
            date: m.utcDate.split('T')[0], home: m.homeTeam.name, away: m.awayTeam.name,
            homeScore: m.score.fullTime.home, awayScore: m.score.fullTime.away
        })));
    } catch (error) { res.status(500).json({ message: '오류' }); }
});

// --- [API] 승부예측 투표 ---

app.post('/api/vote', (req, res) => {
    const { home, away, pick } = req.body;
    let col = pick === 'home' ? 'vote_home' : (pick === 'draw' ? 'vote_draw' : 'vote_away');
    const query = `INSERT INTO match_votes (home_team, away_team, ${col}) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE ${col} = ${col} + 1`;
    db.query(query, [home, away], (err) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        db.query('SELECT * FROM match_votes WHERE home_team=? AND away_team=?', [home, away], (err, r) => {
            if(r.length===0) return res.json({home:0, draw:0, away:0, total:0});
            const total = r[0].vote_home + r[0].vote_draw + r[0].vote_away;
            res.json({
                home: Math.round((r[0].vote_home/total)*100),
                draw: Math.round((r[0].vote_draw/total)*100),
                away: Math.round((r[0].vote_away/total)*100), total
            });
        });
    });
});

// --- [API] 회원가입 & 로그인 ---

app.post('/api/register', (req, res) => {
    const { username, password, nickname } = req.body;
    db.query('INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)', [username, password, nickname], (err) => {
        if (err) return res.status(500).json({ message: '가입 실패 (ID 중복 등)' });
        res.json({ message: '가입 성공' });
    });
});

app.post('/api/login', (req, res) => {
    db.query('SELECT * FROM users WHERE username=? AND password=?', [req.body.username, req.body.password], (err, r) => {
        if (r.length > 0) res.json({ success: true, nickname: r[0].nickname });
        else res.status(401).json({ success: false, message: '정보 불일치' });
    });
});

// --- [API] 자유게시판 (이미지 포함) ---

// 1. 목록 조회
app.get('/api/board', (req, res) => {
    db.query('SELECT * FROM board_posts ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ message: 'DB 오류' });
        const posts = results.map(p => ({ ...p, date: new Date(p.created_at).toLocaleDateString() }));
        res.json(posts);
    });
});

// 2. 상세 조회
app.get('/api/board/:id', (req, res) => {
    db.query('SELECT * FROM board_posts WHERE id = ?', [req.params.id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: '글 없음' });
        const post = results[0];
        post.date = new Date(post.created_at).toLocaleString();
        res.json(post);
    });
});

// 3. 글쓰기 (이미지 업로드)
app.post('/api/board', upload.single('image'), (req, res) => {
    const { title, content, author } = req.body;
    const image_url = req.file ? req.file.filename : null;
    
    db.query('INSERT INTO board_posts (title, content, author, image_url) VALUES (?, ?, ?, ?)', 
    [title, content, author, image_url], (err) => {
        if (err) return res.status(500).json({ message: '저장 실패' });
        res.json({ success: true });
    });
});

// 4. 글 삭제 (본인 확인)
app.delete('/api/board/:id', (req, res) => {
    db.query('DELETE FROM board_posts WHERE id = ? AND author = ?', [req.params.id, req.body.user], (err, result) => {
        if (result.affectedRows === 0) return res.status(403).json({ success: false, message: '권한 없음' });
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log('🚀 http://localhost:3000 서버 실행 중'));