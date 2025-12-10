// models/Comment.js (신규 생성)
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    postId: { type: Number, required: true }, // MySQL의 게시글 ID와 연결
    author: { type: String, required: true }, // 작성자 닉네임
    content: { type: String, required: true }, // 댓글 내용
    createdAt: { type: Date, default: Date.now } // 작성일 (자동)
});

module.exports = mongoose.model('Comment', commentSchema);