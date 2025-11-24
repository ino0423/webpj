-- 1. 데이터베이스 생성 (없으면 만듦)
CREATE DATABASE IF NOT EXISTS sports_db;
USE sports_db;
ALTER TABLE board_posts ADD COLUMN image_url VARCHAR(255) DEFAULT NULL;

-- 2. 승부예측 투표 테이블
-- 경기별 홈승/무/원정승 투표수를 저장합니다.
CREATE TABLE IF NOT EXISTS match_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    vote_home INT DEFAULT 0,
    vote_draw INT DEFAULT 0,
    vote_away INT DEFAULT 0,
    -- 똑같은 팀 매치업이 중복으로 쌓이지 않게 설정
    UNIQUE KEY unique_match (home_team, away_team)
);

-- 3. 회원 정보 테이블
-- 아이디, 비밀번호, 닉네임을 저장합니다.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE, -- 아이디 (중복 불가)
    password VARCHAR(100) NOT NULL,       -- 비밀번호
    nickname VARCHAR(50) NOT NULL         -- 화면에 표시될 이름
);

-- 4. 자유게시판 테이블
-- 글 제목, 내용, 작성자, 작성일, 이미지 경로를 저장합니다.
CREATE TABLE IF NOT EXISTS board_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,          -- 제목
    content TEXT NOT NULL,                -- 내용 (긴 글 가능)
    author VARCHAR(50) NOT NULL,          -- 작성자 닉네임
    image_url VARCHAR(255) DEFAULT NULL,  -- 첨부파일(이미지) 파일명
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 작성 시간 자동 기록
);