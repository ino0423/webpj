// script.js (수정 완료 버전)
const app = document.getElementById('app');
const title = document.getElementById('page-title');
const API_BASE = 'http://localhost:3000/api'; 
let currentUser = localStorage.getItem('user_nickname');

// ==========================================
// 1. BOM & Routing (뒤로가기 완벽 지원)
// ==========================================

// 뒤로가기 이벤트 감지
window.onpopstate = (event) => {
    const page = event.state ? event.state.page : 'home';
    const param = event.state ? event.state.param : null;
    render(page, param);
};

// 페이지 이동 함수
function navigateTo(page, param = null) {
    const url = param ? `/${page}/${param}` : `/${page}`;
    window.history.pushState({ page, param }, null, url);
    render(page, param);
}

// [핵심] 화면 렌더링 스위치 (버그 수정됨)
function render(page, param = null) {
    window.scrollTo(0, 0);
    
    // 에러 방지를 위해 app이 없으면 중단
    if (!app) return;

    switch(page) {
        // [수정] app.innerHTML = renderHome() 에서 "app.innerHTML =" 삭제!
        case 'home': title.innerText = "⚽ 해외 축구 정보 메인"; renderHome(); break;
        
        case 'epl': title.innerText="🇬🇧 EPL"; loadSoccerMenu('PL','epllogo.jpg'); break;
        case 'bundes': title.innerText="🇩🇪 분데스"; loadSoccerMenu('BL1','bdlogo.jpg'); break;
        case 'laliga': title.innerText="🇪🇸 라리가"; loadSoccerMenu('PD','laligalogo.jpg'); break;
        case 'ligue1': title.innerText="🇫🇷 리그1"; loadSoccerMenu('FL1','ligue1logo.jpg'); break;

        case 'epl-rank': loadSoccerData('PL','EPL 순위','epllogo.jpg'); break;
        case 'epl-schedule': loadSoccerSchedule('PL','EPL 일정','epllogo.jpg'); break;
        case 'epl-results': loadSoccerResults('PL','EPL 결과','epllogo.jpg'); break;
        
        case 'bundes-rank': loadSoccerData('BL1','분데스 순위','bdlogo.jpg'); break;
        case 'bundes-schedule': loadSoccerSchedule('BL1','분데스 일정','bdlogo.jpg'); break;
        case 'bundes-results': loadSoccerResults('BL1','분데스 결과','bdlogo.jpg'); break;

        case 'laliga-rank': loadSoccerData('PD','라리가 순위','laligalogo.jpg'); break;
        case 'laliga-schedule': loadSoccerSchedule('PD','라리가 일정','laligalogo.jpg'); break;
        case 'laliga-results': loadSoccerResults('PD','라리가 결과','laligalogo.jpg'); break;

        case 'ligue1-rank': loadSoccerData('FL1','리그1 순위','ligue1logo.jpg'); break;
        case 'ligue1-schedule': loadSoccerSchedule('FL1','리그1 일정','ligue1logo.jpg'); break;
        case 'ligue1-results': loadSoccerResults('FL1','리그1 결과','ligue1logo.jpg'); break;

        case 'vote': title.innerText="🗳️ 승부예측"; loadVotingScreen(); break;
        case 'board': title.innerText="📝 자유게시판"; loadBoard(); break;
        case 'post-detail': title.innerText="📄 게시글 보기"; loadPostDetail(param); break;
        case 'write': title.innerText="🖊️ 글쓰기"; renderWriteForm(); break;
        case 'login': title.innerText="🔑 로그인"; renderLogin(); break;
        case 'register': title.innerText="✨ 회원가입"; renderRegister(); break;

        // [수정] default에서도 함수만 실행
        default: title.innerText = "⚽ 해외 축구 정보 메인"; renderHome();
    }
}

// HTML 호환용 연결
window.router = navigateTo;


// ==========================================
// 2. 화면 그리기 함수들
// ==========================================

function renderHome() {
    app.innerHTML = `
      <div class="main-content">
        <h2 style="text-align:center;">🔥 오늘의 핫매치 & 하이라이트</h2>
        <div class="flex-box">
          <div class="side-img"><img src="soccer1.png" onerror="this.style.display='none'"></div>
          <div class="video-box">
             <iframe width="100%" height="315" src="https://www.youtube.com/embed/Pq-6A6y-sXw" frameborder="0" allowfullscreen></iframe>
          </div>
          <div class="side-img"><img src="soccer1.png" onerror="this.style.display='none'"></div>
        </div>
        <p style="text-align:center; margin-top:20px;">상단 메뉴에서 원하시는 리그 정보를 확인하세요!</p>
      </div>
    `;
}

function loadSoccerMenu(leagueCode, logoFile) {
    let leagueName = leagueCode === 'PL' ? 'epl' : (leagueCode === 'BL1' ? 'bundes' : (leagueCode === 'PD' ? 'laliga' : 'ligue1'));
    
   app.innerHTML = `
      <div class="main-content" style="text-align:center;">
        <img src="/${logoFile}" style="width:100px; margin-bottom:20px;" onerror="this.src='https://placehold.co/100?text=${leagueName}'">
        
        </div>
    `;
}

// 3. API 데이터 연동 함수들

async function loadSoccerData(league, titleText, logo) {
    app.innerHTML = `<div class="main-content"><h2>Loading...</h2></div>`;
    try {
        const res = await fetch(`${API_BASE}/soccer/${league}`);
        const data = await res.json();
        
        let html = `
            <div class="main-content">
            <div style="text-align:center;"><img src="${logo}" width="80" onerror="this.style.display='none'"><h2>${titleText}</h2></div>
            <table>
                <tr><th>순위</th><th>팀</th><th>승점</th><th>승</th><th>무</th><th>패</th></tr>
        `;
        data.forEach(t => {
            html += `<tr><td>${t.rank}</td><td>${t.name}</td><td>${t.pts}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td></tr>`;
        });
        html += `</table><div style="text-align:center;"><button class="btn-back" onclick="history.back()">뒤로가기</button></div></div>`;
        app.innerHTML = html;
    } catch (e) { app.innerHTML = `<div class="main-content"><h3>데이터 로딩 실패 (API 키 확인 필요)</h3></div>`; }
}

async function loadSoccerSchedule(league, titleText, logo) {
    app.innerHTML = `<div class="main-content"><h2>Loading Schedule...</h2></div>`;
    try {
        const res = await fetch(`${API_BASE}/soccer/${league}/matches`);
        const data = await res.json();
        
        let html = `
            <div class="main-content">
            <div style="text-align:center;"><img src="${logo}" width="80" onerror="this.style.display='none'"><h2>${titleText}</h2></div>
            <table><tr><th>날짜</th><th>홈</th><th>VS</th><th>원정</th></tr>`;
        data.forEach(m => {
            html += `<tr><td>${m.date} ${m.time}</td><td>${m.home}</td><td>VS</td><td>${m.away}</td></tr>`;
        });
        html += `</table><div style="text-align:center;"><button class="btn-back" onclick="history.back()">뒤로가기</button></div></div>`;
        app.innerHTML = html;
    } catch (e) { app.innerHTML = `<div class="main-content"><h3>일정 로딩 실패</h3></div>`; }
}

async function loadSoccerResults(league, titleText, logo) {
    app.innerHTML = `<div class="main-content"><h2>Loading Results...</h2></div>`;
    try {
        const res = await fetch(`${API_BASE}/soccer/${league}/results`);
        const data = await res.json();
        
        let html = `
            <div class="main-content">
            <div style="text-align:center;"><img src="${logo}" width="80" onerror="this.style.display='none'"><h2>${titleText}</h2></div>
            <table><tr><th>날짜</th><th>홈</th><th>점수</th><th>원정</th></tr>`;
        data.forEach(m => {
            html += `<tr><td>${m.date}</td><td>${m.home}</td><td><b>${m.homeScore} : ${m.awayScore}</b></td><td>${m.away}</td></tr>`;
        });
        html += `</table><div style="text-align:center;"><button class="btn-back" onclick="history.back()">뒤로가기</button></div></div>`;
        app.innerHTML = html;
    } catch (e) { app.innerHTML = `<div class="main-content"><h3>결과 로딩 실패</h3></div>`; }
}

// 4. 게시판 및 기타 기능

async function loadBoard() {
    app.innerHTML = `<div class="main-content"><h2>게시판 로딩중...</h2></div>`;
    try {
        const res = await fetch(`${API_BASE}/board`);
        const posts = await res.json();
        
        let html = `
            <div class="main-content">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>📝 자유게시판</h2>
                ${currentUser ? `<button class="menu-btn btn-home" style="width:auto;" onclick="navigateTo('write')">글쓰기</button>` : ''}
            </div>
            <table><tr><th>번호</th><th>제목</th><th>작성자</th><th>날짜</th></tr>`;
        
        posts.forEach(p => {
            html += `
            <tr>
                <td>${p.id}</td>
                <td style="text-align:left; cursor:pointer;" onclick="navigateTo('post-detail', ${p.id})">
                    ${p.title} ${p.image_url ? '📷' : ''}
                </td>
                <td>${p.author}</td>
                <td>${p.date}</td>
            </tr>`;
        });
        html += `</table></div>`;
        app.innerHTML = html;
    } catch (e) { app.innerHTML = `<div class="main-content"><h3>게시판 로딩 실패</h3></div>`; }
}

async function loadPostDetail(id) {
    try {
        const res = await fetch(`${API_BASE}/board/${id}`);
        const post = await res.json();
        
        app.innerHTML = `
            <div class="main-content">
                <div class="post-detail-box">
                    <div class="detail-header">
                        <h2>${post.title}</h2>
                        <p>작성자: ${post.author} | ${post.date}</p>
                    </div>
                    <div class="detail-content">
                        ${post.image_url ? `<img src="/uploads/${post.image_url}" style="max-width:100%; border-radius:10px; margin-bottom:20px;">` : ''}
                        <p>${post.content}</p>
                    </div>
                    <button class="btn-back" onclick="navigateTo('board')">목록으로</button>
                    ${currentUser === post.author ? `<button class="btn-back btn-red" onclick="deletePost(${post.id})">삭제</button>` : ''}
                </div>
            </div>`;
    } catch(e) { alert('글을 불러오지 못했습니다.'); navigateTo('board'); }
}

function renderWriteForm() {
    if (!currentUser) return alert('로그인이 필요합니다.');
    app.innerHTML = `
        <div class="main-content">
            <h2>🖊️ 글쓰기</h2>
            <input type="text" id="w-title" class="input-field" placeholder="제목">
            <textarea id="w-content" class="input-field" style="height:200px;" placeholder="내용"></textarea>
            <input type="file" id="w-file" class="input-field">
            <button class="menu-btn btn-home" onclick="submitPost()">등록하기</button>
        </div>`;
}

async function submitPost() {
    const title = document.getElementById('w-title').value;
    const content = document.getElementById('w-content').value;
    const file = document.getElementById('w-file').files[0];
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('author', currentUser);
    if (file) formData.append('image', file);

    await fetch(`${API_BASE}/board`, { method: 'POST', body: formData });
    navigateTo('board');
}

async function deletePost(id) {
    if(!confirm('삭제하시겠습니까?')) return;
    await fetch(`${API_BASE}/board/${id}`, { 
        method: 'DELETE', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user: currentUser })
    });
    navigateTo('board');
}

// 5. 로그인/회원가입

function renderLogin() {
    app.innerHTML = `
        <div class="main-content" style="text-align:center; max-width:400px; margin:auto;">
            <h2>🔑 로그인</h2>
            <input type="text" id="l-id" class="input-field" placeholder="아이디">
            <input type="password" id="l-pw" class="input-field" placeholder="비밀번호">
            <button class="menu-btn btn-home" onclick="login()">로그인</button>
            <button class="menu-btn" onclick="navigateTo('register')">회원가입</button>
        </div>`;
}

function renderRegister() {
    app.innerHTML = `
        <div class="main-content" style="text-align:center; max-width:400px; margin:auto;">
            <h2>✨ 회원가입</h2>
            <input type="text" id="r-id" class="input-field" placeholder="아이디">
            <input type="password" id="r-pw" class="input-field" placeholder="비밀번호">
            <input type="text" id="r-nick" class="input-field" placeholder="닉네임">
            <button class="menu-btn btn-home" onclick="register()">가입하기</button>
        </div>`;
}

async function login() {
    const username = document.getElementById('l-id').value;
    const password = document.getElementById('l-pw').value;
    
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if(data.success) {
        localStorage.setItem('user_nickname', data.nickname);
        currentUser = data.nickname;
        checkLoginStatus();
        navigateTo('home');
    } else { alert(data.message); }
}

async function register() {
    const username = document.getElementById('r-id').value;
    const password = document.getElementById('r-pw').value;
    const nickname = document.getElementById('r-nick').value;

    const res = await fetch(`${API_BASE}/register`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username, password, nickname })
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) navigateTo('login');
}

function logout() {
    localStorage.removeItem('user_nickname');
    currentUser = null;
    checkLoginStatus();
    navigateTo('home');
}

function checkLoginStatus() {
    const authMenu = document.getElementById('auth-menu');
    if(!authMenu) return; // nav HTML이 없으면 패스
    
    if (currentUser) {
        authMenu.innerHTML = `<span style="color:#dcdde1; margin-right:15px;">👋 ${currentUser}님</span><a href="#" onclick="logout()" style="color:#ff7675;">로그아웃</a>`;
    } else {
        authMenu.innerHTML = `<a href="#" onclick="navigateTo('login')" style="color:#74b9ff;">🔑 로그인</a>`;
    }
}

// script.js 의 loadVotingScreen 함수를 이걸로 교체하세요!

async function loadVotingScreen() {
    app.innerHTML = `<div class="main-content"><h2>🗳️ 승부예측 (EPL 예정 경기)</h2><p>로딩중...</p></div>`;
    
    try {
        // 1. 서버를 통해 EPL 예정 경기 가져오기
        const res = await fetch(`${API_BASE}/soccer/PL/matches`);
        const matches = await res.json();
        
        let html = `
            <div class="main-content">
                <div style="text-align:center; margin-bottom:30px;">
                    <h2>🗳️ 이번 주 빅매치 승부예측</h2>
                    <p>여러분의 축구 지식을 뽐내보세요!</p>
                </div>
                <div class="vote-container">
        `;

        // 2. 각 경기별로 투표 카드 생성
        matches.forEach((m, index) => {
            // ID 생성 (vote-card-0, vote-card-1...)
            const cardId = `vote-card-${index}`;
            
            html += `
            <div class="vote-card" id="${cardId}">
                <div class="match-info">${m.date} ${m.time} | ${m.stadium || 'Stadium'}</div>
                <div class="match-teams">
                    <span class="team-name">${m.home}</span> 
                    <span style="font-size:14px; color:#aaa;">VS</span> 
                    <span class="team-name">${m.away}</span>
                </div>
                
                <div class="vote-btns">
                    <button class="vote-btn btn-home" onclick="castVote('${m.home}', '${m.away}', 'home', '${cardId}')">홈승</button>
                    <button class="vote-btn btn-draw" onclick="castVote('${m.home}', '${m.away}', 'draw', '${cardId}')">무승부</button>
                    <button class="vote-btn btn-away" onclick="castVote('${m.home}', '${m.away}', 'away', '${cardId}')">원정승</button>
                </div>
                <div class="vote-result-box" style="display:none;"></div>
            </div>`;
        });
        
        html += `</div></div>`;
        app.innerHTML = html;
        
    } catch (e) {
        app.innerHTML = `<div class="main-content"><h3>경기 일정을 불러오지 못했습니다.</h3></div>`;
    }
}

// 3. 투표 실행 함수 (script.js 맨 아래나 적당한 곳에 추가)
async function castVote(home, away, pick, cardId) {
    if (!currentUser) return alert('로그인이 필요한 기능입니다!');

    const card = document.getElementById(cardId);
    const resultBox = card.querySelector('.vote-result-box');
    const btnBox = card.querySelector('.vote-btns');

    try {
        const res = await fetch(`${API_BASE}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ home, away, pick })
        });
        
        const data = await res.json();
        
        // 투표 버튼 숨기고 결과 그래프 보여주기
        btnBox.style.display = 'none';
        resultBox.style.display = 'block';
        
        resultBox.innerHTML = `
            <div class="vote-result-bar">
                <div style="width:${data.home}%; background:#0097e6; height:100%;"></div>
                <div style="width:${data.draw}%; background:#7f8c8d; height:100%;"></div>
                <div style="width:${data.away}%; background:#e84118; height:100%;"></div>
            </div>
            <div class="result-txt">
                <span style="color:#0097e6">${data.home}%</span>
                <span style="color:#7f8c8d">${data.draw}%</span>
                <span style="color:#e84118">${data.away}%</span>
            </div>
            <p style="text-align:center; font-size:12px; margin-top:5px; color:#666;">총 ${data.total}명 참여</p>
        `;
        
    } catch (e) {
        alert('투표 중 오류가 발생했습니다.');
    }
}

function loadSoccerMenu(leagueCode, logoFile) {
    // 1. 리그 코드 변환
    let leagueName = '';
    if (leagueCode === 'PL') leagueName = 'epl';
    else if (leagueCode === 'BL1') leagueName = 'bundes';
    else if (leagueCode === 'PD') leagueName = 'laliga';
    else leagueName = 'ligue1';
    
    // 2. 화면 그리기 (순위/일정/결과 버튼)
    app.innerHTML = `
      <div class="main-content" style="text-align:center;">
        <img src="/${logoFile}" style="width:100px; margin-bottom:20px;" onerror="this.src='https://placehold.co/100?text=${leagueName}'">
        <h3>${leagueName.toUpperCase()} 정보를 선택하세요</h3>
        <div style="display:flex; flex-direction:column; align-items:center; gap: 10px; margin-top: 20px;">
            <button class="menu-btn" onclick="navigateTo('${leagueName}-rank')">🏆 순위 보기</button>
            <button class="menu-btn" onclick="navigateTo('${leagueName}-schedule')">📅 경기 일정</button>
            <button class="menu-btn" onclick="navigateTo('${leagueName}-results')">⚽ 경기 결과</button>
        </div>
        <div style="margin-top:20px;">
             <button class="btn-back" onclick="navigateTo('home')">메인으로</button>
        </div>
      </div>
    `;
}
// 초기 실행
checkLoginStatus();
const initialPage = location.pathname.substring(1) || 'home';
render(initialPage);