// config/db.js
const mysql = require('mysql2');

// Connection Pool 방식을 사용하여 성능 최적화
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ino7541!', // 본인 비밀번호 확인
    database: 'sports_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Promise 기반으로 사용하기 위해 promise() 호출
const db = pool.promise();

module.exports = db;