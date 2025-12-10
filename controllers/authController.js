const { db } = require('../config/db');

// 1. 회원가입
exports.register = async (req, res) => {
    const { username, password, nickname } = req.body;

    // 필수 입력값 확인
    if (!username || !password || !nickname) {
        return res.status(400).json({ message: '모든 항목을 입력해주세요.' });
    }

    try {
        // 중복 아이디 확인
        const [existing] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
        }

        // DB에 저장 (주의: 실무에선 비밀번호를 암호화해야 하지만, 지금은 그대로 저장합니다)
        await db.execute(
            'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
            [username, password, nickname]
        );

        res.json({ success: true, message: '회원가입 성공! 로그인 해주세요.' });

    } catch (err) {
        console.error('❌ 회원가입 에러:', err);
        res.status(500).json({ message: '서버 DB 오류 발생' });
    }
};

// 2. 로그인
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 아이디와 비밀번호가 일치하는 유저 찾기
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?', 
            [username, password]
        );

        if (rows.length > 0) {
            // 로그인 성공
            const user = rows[0];
            res.json({ 
                success: true, 
                message: '로그인 성공!',
                nickname: user.nickname 
            });
        } else {
            // 로그인 실패
            res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 틀렸습니다.' });
        }
    } catch (err) {
        console.error('❌ 로그인 에러:', err);
        res.status(500).json({ message: '서버 DB 오류 발생' });
    }
};