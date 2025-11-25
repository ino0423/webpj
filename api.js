// routes/api.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// 컨트롤러 불러오기
const soccerCtrl = require('../controllers/soccerController');
const authCtrl = require('../controllers/authController');
const boardCtrl = require('../controllers/boardController');

// Multer 설정 (여기서 라우터와 연결)
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads/'),
        filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
    })
});

// === 라우트 정의 ===

// 1. 축구 API
router.get('/soccer/:league', soccerCtrl.getStandings);
router.get('/soccer/:league/matches', soccerCtrl.getMatches);
router.get('/soccer/:league/results', soccerCtrl.getResults);

// 2. 인증 API
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

// 3. 게시판 & 투표 API
router.get('/board', boardCtrl.getPosts);
router.get('/board/:id', boardCtrl.getPostDetail);
router.post('/board', upload.single('image'), boardCtrl.createPost);
router.delete('/board/:id', boardCtrl.deletePost);
router.post('/vote', boardCtrl.vote);

module.exports = router;