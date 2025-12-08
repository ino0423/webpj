const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. DB 설정 파일에서 MongoDB 연결 함수 가져오기
// (주의: config/db.js 파일에서 connectMongo를 꼭 export 해야 합니다!)
const { connectMongo } = require('./config/db'); 

// 2. MVC 패턴 라우트 가져오기
const apiRoutes = require('./routes/api'); 

const app = express();

// 3. 서버 시작 시 MongoDB 연결 실행
connectMongo();

// 4. 미들웨어 설정
app.use(cors());
app.use(express.json());

// 5. 정적 파일 제공 (프론트엔드 파일 및 업로드 이미지)
app.use(express.static(__dirname)); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. API 라우트 등록 (모든 API 요청은 /api로 시작)
app.use('/api', apiRoutes);

// 7. SPA(Single Page Application) 라우팅 처리
// API가 아닌 모든 요청은 index.html을 보여줘서 새로고침 에러 방지
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 8. 서버 실행
app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
    console.log('👉 접속 주소: http://localhost:3000');
});