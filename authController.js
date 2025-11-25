// controllers/authController.js
const db = require('../config/db');

exports.register = async (req, res) => {
    const { username, password, nickname } = req.body;
    try {
        await db.execute('INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)', [username, password, nickname]);
        res.json({ message: '가입 성공' });
    } catch (err) {
        res.status(500).json({ message: '가입 실패 (ID 중복)' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE username=? AND password=?', [username, password]);
        if (rows.length > 0) res.json({ success: true, nickname: rows[0].nickname });
        else res.status(401).json({ success: false, message: '정보 불일치' });
    } catch (err) {
        res.status(500).json({ message: 'DB Error' });
    }
};