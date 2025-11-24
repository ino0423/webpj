// server.js (수정본)
const express = require('express');
const cors = require('cors');
const path = require('path');

// MVC 패턴 라우트 가져오기 (파일이 존재해야 함)
// 만약 ./routes/api 파일이 없다면 에러가 납니다. 꼭 파일 생성 확인하세요!
const apiRoutes = require('./routes/api'); 

const app = express();

// 1. 미들웨어 설정
app.use(cors());
app.use(express.json());

// 2. 정적 파일 제공 설정 (HTML, CSS, JS, 이미지 등)
// 현재 폴더(__dirname)의 모든 파일을 브라우저가 접근할 수 있게 함
app.use(express.static(__dirname)); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. API 라우트 등록
app.use('/api', apiRoutes);

// 4. SPA(Single Page Application)를 위한 라우팅 처리
// API 요청이 아닌 모든 요청은 index.html을 돌려줌 (새로고침 시 404 방지)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 실행
app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
});