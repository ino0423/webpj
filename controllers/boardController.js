// controllers/boardController.js

// 1. DB 연결 (MySQL 및 MongoDB)
// config/db.js에서 db(MySQL) 객체만 구조 분해 할당으로 가져옴
const { db } = require('../config/db'); 
const Comment = require('../models/Comment'); // MongoDB 모델

// ==========================================
// 1. 게시판 기능 (MySQL)
// ==========================================

exports.getPosts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM board_posts ORDER BY id DESC');
        const posts = rows.map(p => ({ ...p, date: new Date(p.created_at).toLocaleDateString() }));
        res.json(posts);
    } catch (err) { res.status(500).json({ message: 'DB Error' }); }
};

exports.getPostDetail = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM board_posts WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: '글 없음' });
        res.json({ ...rows[0], date: new Date(rows[0].created_at).toLocaleString() });
    } catch (err) { res.status(500).json({ message: 'Error' }); }
};

exports.createPost = async (req, res) => {
    const { title, content, author } = req.body;
    const image_url = req.file ? req.file.filename : null;
    try {
        await db.execute('INSERT INTO board_posts (title, content, author, image_url) VALUES (?, ?, ?, ?)', [title, content, author, image_url]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: '저장 실패' }); }
};

exports.deletePost = async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM board_posts WHERE id = ? AND author = ?', [req.params.id, req.body.user]);
        if (result.affectedRows === 0) return res.status(403).json({ success: false, message: '권한 없음' });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: '삭제 실패' }); }
};

// ==========================================
// 2. 승부예측 투표 기능 (MySQL)
// ==========================================

exports.vote = async (req, res) => {
    const { home, away, pick } = req.body;
    let col = pick === 'home' ? 'vote_home' : (pick === 'draw' ? 'vote_draw' : 'vote_away');
    
    const query = `
        INSERT INTO match_votes (home_team, away_team, ${col}) 
        VALUES (?, ?, 1) 
        ON DUPLICATE KEY UPDATE ${col} = ${col} + 1
    `;
    
    try {
        await db.execute(query, [home, away]);
        const [rows] = await db.execute('SELECT * FROM match_votes WHERE home_team=? AND away_team=?', [home, away]);
        const r = rows[0];
        const total = r.vote_home + r.vote_draw + r.vote_away;
        
        res.json({
            home: Math.round((r.vote_home / total) * 100),
            draw: Math.round((r.vote_draw / total) * 100),
            away: Math.round((r.vote_away / total) * 100),
            total
        });
    } catch (err) { 
        res.status(500).json({ error: 'Vote Error' }); 
    }
};

// ==========================================
// 3. 댓글 기능 (MongoDB)
// ==========================================

// 댓글 쓰기
exports.addComment = async (req, res) => {
    const { postId, author, content } = req.body;
    try {
        const newComment = new Comment({ postId, author, content });
        await newComment.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: '댓글 저장 실패' });
    }
};

// 댓글 불러오기
exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: -1 });
        const formatted = comments.map(c => ({
            author: c.author,
            content: c.content,
            date: new Date(c.createdAt).toLocaleString()
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: '댓글 로딩 실패' });
    }
};