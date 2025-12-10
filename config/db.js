const mysql = require('mysql2');
const mongoose = require('mongoose');

// 1. MySQL 연결 설정
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ino7541!', // 본인 비밀번호
    database: 'sports_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// [추가된 부분] MySQL 연결이 잘 됐는지 테스트하는 코드
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ MySQL 연결 실패:', err.code);
    } else {
        console.log('✅ MySQL Connected (게시판/투표 DB 준비 완료)');
        connection.release(); // 연결 확인 후 바로 반납
    }
});

const db = pool.promise();

// 2. MongoDB 연결 설정
const connectMongo = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/sports_db');
        console.log('✅ MongoDB Connected (댓글 시스템 준비 완료)');
    } catch (err) {
        console.error('❌ MongoDB 연결 실패:', err);
    }
};

module.exports = { db, connectMongo };