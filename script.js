const app = document.getElementById('app');
const title = document.getElementById('page-title');
const API_BASE = 'http://localhost:3000/api'; 

// 로그인 정보 불러오기
let currentUser = localStorage.getItem('user_nickname');

// 초기 실행
checkLoginStatus();
router('home');

// --- [1] 인증 관리 ---
function checkLoginStatus() {
    const authMenu = document.querySelector('nav #auth-menu') || createAuthMenu();
    if (currentUser) {
        authMenu.innerHTML = `<span style="color:#dcdde1; margin-right:15px;">👋 ${currentUser}님</span><a href="#" onclick="logout()" style="color:#ff7675;">로그아웃</a>`;
    } else {
        authMenu.innerHTML = `<a href="#" onclick="router('login')" style="color:#74b9ff;">🔑 로그인</a>`;
    }
}
function createAuthMenu() {
    const nav = document.querySelector('nav');
    const div = document.createElement('div');
    div.id = 'auth-menu'; div.style.marginLeft = 'auto'; div.style.paddingRight = '20px';
    nav.appendChild(div); return div;
}
function logout() { localStorage.removeItem('user_nickname'); currentUser=null; alert('로그아웃'); checkLoginStatus(); router('home'); }

// --- [2] 라우터 ---
function router(page, param=null) {
    window.scrollTo(0, 0);
    switch(page) {
        case 'home': title.innerText = "⚽ 해외 축구 정보 메인"; app.innerHTML = renderHome(); break;
        
        // 축구 메뉴
        case 'epl': title.innerText="🇬🇧 EPL"; loadSoccerMenu('PL','epllogo.jpg'); break;
        case 'bundes': title.innerText="🇩🇪 분데스"; loadSoccerMenu('BL1','bdlogo.jpg'); break;
        case 'laliga': title.innerText="🇪🇸 라리가"; loadSoccerMenu('PD','laligalogo.jpg'); break;
        case 'ligue1': title.innerText="🇫🇷 리그1"; loadSoccerMenu('FL1','ligue1logo.jpg'); break;

        // 축구 상세
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

        // 기능
        case 'vote': title.innerText="🗳️ 승부예측"; loadVotingScreen(); break;
        case 'board': title.innerText="📝 자유게시판"; loadBoard(); break;
        case 'post-detail': title.innerText="📄 게시글 보기"; loadPostDetail(param); break;
        case 'write': title.innerText="🖊️ 글쓰기"; renderWriteForm(); break;
        case 'login': title.innerText="🔑 로그인"; renderLogin(); break;
        case 'register': title.innerText="✨ 회원가입"; renderRegister(); break;

        default: router('home');
    }
}

// --- [3] 게시판 (이미지 포함) ---
async function loadBoard() {
    app.innerHTML = '<h3>로딩 중...</h3>';
    try {
        const res = await fetch(`${API_BASE}/board`);
        const posts = await res.json();
        let rows = posts.map(p => `<tr><td>${p.id}</td><td style="text-align:left;padding-left:15px;"><span class="post-title-link" onclick="router('post-detail',${p.id})">${p.title}</span> ${p.image_url ? '📷' : ''}</td><td>${p.author}</td><td>${p.date}</td></tr>`).join('');
        if(!rows) rows = `<tr><td colspan="4">글이 없습니다.</td></tr>`;
        
        app.innerHTML = `<div class="main-content" style="text-align:center;"><div style="text-align:right;margin-bottom:10px;"><button class="menu-btn btn-home" onclick="router('write')" style="width:auto;padding:10px 20px;">🖊️ 글쓰기</button></div><table><thead><tr><th width="10%">번호</th><th>제목</th><th width="15%">작성자</th><th width="15%">날짜</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    } catch(e) { app.innerHTML = '<h3>로딩 실패</h3>'; }
}

async function loadPostDetail(id) {
    app.innerHTML = '<h3>로딩 중...</h3>';
    try {
        const res = await fetch(`${API_BASE}/board/${id}`);
        const p = await res.json();
        let btn = (currentUser && p.author === currentUser) ? `<button onclick="deletePost(${p.id})" style="background:#ff7675;color:white;border:none;padding:8px 15px;border-radius:5px;cursor:pointer;">삭제</button>` : '';
        let imgHtml = p.image_url ? `<img src="http://localhost:3000/uploads/${p.image_url}" style="max-width:100%;margin-bottom:20px;border-radius:10px;">` : '';

        app.innerHTML = `<div class="main-content"><div class="post-detail-box"><div class="detail-header"><h2>${p.title}</h2><div style="color:#888;display:flex;justify-content:space-between;"><span>작성자: <strong>${p.author}</strong></span><span>${p.date}</span></div></div><div class="detail-content">${imgHtml}<div style="white-space:pre-wrap;">${p.content}</div></div><div style="margin-top:30px;text-align:center;border-top:1px solid #eee;padding-top:20px;"><button class="menu-btn" onclick="router('board')" style="width:auto;padding:8px 20px;margin-right:10px;">목록</button>${btn}</div></div></div>`;
    } catch(e) { app.innerHTML = '<h3>글을 불러올 수 없습니다.</h3>'; }
}

async function deletePost(id) {
    if(!confirm("삭제하시겠습니까?")) return;
    const res = await fetch(`${API_BASE}/board/${id}`, { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({user:currentUser}) });
    const data = await res.json();
    if(data.success) { alert('삭제됨'); router('board'); } else alert(data.message);
}

function renderWriteForm() {
    if(!currentUser) { alert("로그인 필요"); return router('login'); }
    app.innerHTML = `<div class="main-content" style="max-width:700px;margin:0 auto;"><h2>🖊️ 글쓰기</h2><input type="text" id="post-title" placeholder="제목" class="input-field"><div style="margin-bottom:15px;"><label>📷 사진 첨부: </label><input type="file" id="post-image" accept="image/*"></div><textarea id="post-content" placeholder="내용" class="input-field" style="height:300px;"></textarea><div style="text-align:center;margin-top:20px;"><button class="menu-btn btn-home" onclick="submitPost()" style="width:48%;">등록</button> <button class="menu-btn btn-red" onclick="router('board')" style="width:48%;">취소</button></div></div>`;
}

async function submitPost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const file = document.getElementById('post-image').files[0];
    if(!title || !content) return alert("내용을 입력하세요.");

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('author', currentUser);
    if(file) formData.append('image', file);

    const res = await fetch(`${API_BASE}/board`, { method: 'POST', body: formData });
    const data = await res.json();
    if(data.success) { alert("등록 완료"); router('board'); } else alert("실패");
}

// --- [4] 렌더링 & 데이터 로딩 (축구) ---
function renderHome() { return `<div class="flex-box"><div class="side-img"><img src="soccer1.png"></div><div class="main-content" style="flex:1;margin:0 20px;text-align:center;"><h2>🔥 축구 뉴스</h2><iframe width="100%" height="350" src="https://www.youtube.com/embed/-lqU6Z9iE0Y" frameborder="0"></iframe></div><div class="side-img"><img src="soccer1.png"></div></div>`; }

function loadSoccerMenu(code, logo) {
    let name = code==='PL'?'epl':(code==='BL1'?'bundes':(code==='PD'?'laliga':'ligue1'));
    app.innerHTML = `<div class="main-content" style="text-align:center;"><img src="${logo}" width="150"><h2>메뉴 선택</h2><div style="margin-top:30px;"><button class="menu-btn" onclick="router('${name}-rank')">순위</button><button class="menu-btn" onclick="router('${name}-schedule')">일정</button><button class="menu-btn btn-red" onclick="router('${name}-results')">결과</button></div></div>`;
}

function renderTableLayout(logo, thead, tbody) {
    return `<div class="main-content"><div style="text-align:center;margin-bottom:20px;"><img src="${logo}" style="max-width:120px;"></div><table><thead>${thead}</thead><tbody>${tbody}</tbody></table><div style="text-align:center;"><div class="btn-back" onclick="router('home')">메인으로</div></div></div>`;
}

async function loadSoccerData(code, t, l) {
    title.innerText=t; app.innerHTML='<h3>로딩 중...</h3>';
    try { const r=await fetch(`${API_BASE}/soccer/${code}`); const d=await r.json();
    let rows=d.map(x=>`<tr><td>${x.rank}</td><td>${x.name}</td><td>${x.p}</td><td><strong>${x.pts}</strong></td><td>${x.w}</td><td>${x.d}</td><td>${x.l}</td><td>${x.gd}</td></tr>`).join('');
    app.innerHTML=renderTableLayout(l,`<tr><th>순위</th><th>팀</th><th>경기</th><th>승점</th><th>승</th><th>무</th><th>패</th><th>득실</th></tr>`,rows); } catch(e){app.innerHTML='<h3>실패</h3>';}
}
async function loadSoccerSchedule(code, t, l) {
    title.innerText=t; app.innerHTML='<h3>로딩 중...</h3>';
    try { const r=await fetch(`${API_BASE}/soccer/${code}/matches`); const d=await r.json();
    let rows=d.map(x=>`<tr><td>${x.date}</td><td>${x.time}</td><td style="color:blue">${x.home}</td><td>vs</td><td style="color:red">${x.away}</td><td>${x.stadium}</td></tr>`).join('');
    app.innerHTML=renderTableLayout(l,`<tr><th>날짜</th><th>시간</th><th>홈</th><th></th><th>원정</th><th>라운드</th></tr>`,rows); } catch(e){app.innerHTML='<h3>실패</h3>';}
}
async function loadSoccerResults(code, t, l) {
    title.innerText=t; app.innerHTML='<h3>로딩 중...</h3>';
    try { const r=await fetch(`${API_BASE}/soccer/${code}/results`); const d=await r.json();
    let rows=d.map(x=>`<tr><td>${x.date}</td><td style="text-align:right;font-weight:bold;">${x.home}</td><td style="text-align:center;font-weight:bold;">${x.homeScore}:${x.awayScore}</td><td style="text-align:left;font-weight:bold;">${x.away}</td></tr>`).join('');
    app.innerHTML=renderTableLayout(l,`<tr><th>날짜</th><th colspan="3">스코어</th></tr>`,rows); } catch(e){app.innerHTML='<h3>실패</h3>';}
}

// --- [5] 승부예측 & 로그인 ---
async function loadVotingScreen() {
    app.innerHTML='<h3>로딩 중...</h3>';
    try { const r=await fetch(`${API_BASE}/soccer/PL/matches`); const m=await r.json();
    let h=`<div style="max-width:700px;margin:0 auto;">`;
    m.forEach((x,i)=>{ h+=`<div class="vote-card"><div class="match-info">${x.date} ${x.time}</div><div class="match-teams"><span style="color:blue">${x.home}</span> VS <span style="color:red">${x.away}</span></div><div id="b-${i}" class="vote-btns"><button class="vote-btn btn-home" onclick="castVote('${x.home}','${x.away}','home',${i})">승</button><button class="vote-btn btn-draw" onclick="castVote('${x.home}','${x.away}','draw',${i})">무</button><button class="vote-btn btn-away" onclick="castVote('${x.home}','${x.away}','away',${i})">패</button></div><div id="r-${i}" style="display:none;">결과 로딩...</div></div>`; });
    app.innerHTML=h+'</div>'; } catch(e){app.innerHTML='<h3>실패</h3>';}
}
async function castVote(h,a,p,i) {
    document.getElementById(`b-${i}`).style.display='none'; const rd=document.getElementById(`r-${i}`); rd.style.display='block';
    const r=await fetch(`${API_BASE}/vote`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({home:h,away:a,pick:p})});
    const d=await r.json();
    rd.innerHTML=`<div class="vote-result-bar"><div style="background:blue;width:${d.home}%"></div><div style="background:gray;width:${d.draw}%"></div><div style="background:red;width:${d.away}%"></div></div><div class="result-txt"><span style="color:blue">${d.home}%</span><span>${d.draw}%</span><span style="color:red">${d.away}%</span></div><p>총 ${d.total}명</p>`;
}

function renderLogin() { app.innerHTML=`<div class="main-content" style="max-width:400px;margin:0 auto;text-align:center;"><h2>로그인</h2><input id="lid" placeholder="ID" class="input-field"><input type="password" id="lpw" placeholder="PW" class="input-field"><button class="menu-btn btn-home" onclick="goLogin()" style="width:100%;">접속</button><p style="margin-top:20px;"><a href="#" onclick="router('register')">회원가입</a></p></div>`; }
async function goLogin() {
    const i=document.getElementById('lid').value, p=document.getElementById('lpw').value;
    const r=await fetch(`${API_BASE}/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:i,password:p})});
    const d=await r.json();
    if(d.success){localStorage.setItem('user_nickname',d.nickname); currentUser=d.nickname; alert('환영합니다'); checkLoginStatus(); router('home');} else alert(d.message);
}
function renderRegister() { app.innerHTML=`<div class="main-content" style="max-width:400px;margin:0 auto;text-align:center;"><h2>회원가입</h2><input id="rid" placeholder="ID" class="input-field"><input type="password" id="rpw" placeholder="PW" class="input-field"><input id="rnick" placeholder="닉네임" class="input-field"><button class="menu-btn btn-away" onclick="goReg()" style="width:100%;">가입</button></div>`; }
async function goReg() {
    const i=document.getElementById('rid').value, p=document.getElementById('rpw').value, n=document.getElementById('rnick').value;
    if(!i||!p||!n) return alert('입력하세요');
    const r=await fetch(`${API_BASE}/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:i,password:p,nickname:n})});
    const d=await r.json(); alert(d.message); if(r.ok) router('login');
}