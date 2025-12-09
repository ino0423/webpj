const API_BASE = 'http://localhost:3000/api';

// === 컴포넌트 정의 ===

const Home = { template: '#home-template' };

const LeagueMenu = {
    template: '#league-menu-template',
    props: ['code'],
    computed: {
        leagueName() {
            const map = { 'PL':'EPL', 'BL1':'분데스리가', 'PD':'라리가', 'FL1':'리그1' };
            return map[this.props?.code || this.$route.params.code] || '리그';
        },
        logo() {
            const map = { 'PL':'/epllogo.jpg', 'BL1':'/bdlogo.jpg', 'PD':'/laligalogo.jpg', 'FL1':'/ligue1logo.jpg' };
            return map[this.$route.params.code];
        }
    },
    data() { return { code: this.$route.params.code } }
};

const DataView = {
    template: '#data-view-template',
    data() { return { loading: true, dataList: [], type: '', title: '' } },
    computed: {
        logo() {
            const map = { 'PL':'/epllogo.jpg', 'BL1':'/bdlogo.jpg', 'PD':'/laligalogo.jpg', 'FL1':'/ligue1logo.jpg' };
            return map[this.$route.params.code];
        }
    },
    async mounted() {
        const { code, type } = this.$route.params;
        this.type = type;
        const endpoints = { 'rank': '', 'schedule': '/matches', 'results': '/results' };
        const titles = { 'rank': '순위', 'schedule': '일정', 'results': '결과' };
        
        this.title = titles[type];
        try {
            const res = await fetch(`${API_BASE}/soccer/${code}${endpoints[type]}`);
            this.dataList = await res.json();
        } catch (e) { alert('데이터 로드 실패'); }
        this.loading = false;
    }
};

const Vote = {
    template: '#vote-template',
    data() { return { matches: [] } },
    async mounted() {
        try {
            const res = await fetch(`${API_BASE}/soccer/PL/matches`);
            const data = await res.json();
            this.matches = data.map(m => ({ ...m, voted: false, result: null }));
        } catch(e) {}
    },
    methods: {
        async castVote(match, pick) {
            if (!localStorage.getItem('user_nickname')) return alert('로그인하세요!');
            try {
                const res = await fetch(`${API_BASE}/vote`, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ home: match.home, away: match.away, pick })
                });
                match.result = await res.json();
                match.voted = true;
            } catch(e) { alert('투표 오류'); }
        }
    }
};

const Board = {
    template: '#board-template',
    data() { return { posts: [], currentUser: localStorage.getItem('user_nickname') } },
    async mounted() {
        const res = await fetch(`${API_BASE}/board`);
        this.posts = await res.json();
    }
};

const PostDetail = {
    template: '#post-detail-template',
    data() { return { post: null, comments: [], newComment: '', currentUser: localStorage.getItem('user_nickname') } },
    computed: {
        isAuthor() { return this.post && this.currentUser === this.post.author; }
    },
    async mounted() {
        await this.loadData();
    },
    methods: {
        async loadData() {
            const id = this.$route.params.id;
            const res = await fetch(`${API_BASE}/board/${id}`);
            this.post = await res.json();
            const cRes = await fetch(`${API_BASE}/comments/${id}`);
            this.comments = await cRes.json();
        },
        async addComment() {
            if (!this.currentUser) return alert('로그인하세요');
            await fetch(`${API_BASE}/comments`, {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ postId: this.post.id, author: this.currentUser, content: this.newComment })
            });
            this.newComment = '';
            this.loadData();
        },
        async deletePost() {
            if(!confirm('삭제?')) return;
            await fetch(`${API_BASE}/board/${this.post.id}`, { 
                method: 'DELETE', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ user: this.currentUser })
            });
            this.$router.push('/board');
        }
    }
};

const Write = {
    template: '#write-template',
    data() { return { title: '', content: '' } },
    methods: {
        async submitPost() {
            const file = this.$refs.fileInput.files[0];
            const formData = new FormData();
            formData.append('title', this.title);
            formData.append('content', this.content);
            formData.append('author', localStorage.getItem('user_nickname'));
            if(file) formData.append('image', file);
            await fetch(`${API_BASE}/board`, { method: 'POST', body: formData });
            this.$router.push('/board');
        }
    }
};

const Login = {
    template: '#login-template',
    data() { return { username: '', password: '' } },
    methods: {
        async login() {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify(this)
            });
            const data = await res.json();
            if(data.success) {
                localStorage.setItem('user_nickname', data.nickname);
                // 루트 인스턴스의 상태 업데이트를 위해 새로고침 또는 이벤트 버스 사용 필요.
                // 여기서는 간단히 페이지 이동 후 상위 컴포넌트가 로컬스토리지 확인하도록 함.
                window.location.href = '/'; 
            } else alert(data.message);
        }
    }
};

const Register = {
    template: '#register-template',
    data() { return { username: '', password: '', nickname: '' } },
    methods: {
        async register() {
            const res = await fetch(`${API_BASE}/register`, {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify(this)
            });
            if(res.ok) { alert('가입 성공'); this.$router.push('/login'); }
            else alert('가입 실패');
        }
    }
};

const Portfolio = {
    template: '#portfolio-template',
    data() {
        return {
            projects: [
                { title: "⚽ 해외 축구 정보 센터", desc: "Vue.js + Node.js 풀스택 개발", tech: "Vue.js, Node.js, MySQL, MongoDB", img: "/soccer1.png" },
                { title: "💬 실시간 채팅", desc: "Python 소켓 프로그래밍", tech: "Python, Socket", img: null },
                { title: "🍷 와인 품질 예측", desc: "머신러닝 등급 분류 모델", tech: "Python, Scikit-learn", img: null }
            ]
        }
    }
};

// === 라우터 설정 ===
const routes = [
    { path: '/', component: Home },
    { path: '/soccer/:code', component: LeagueMenu },
    { path: '/soccer/:code/:type', component: DataView },
    { path: '/vote', component: Vote },
    { path: '/board', component: Board },
    { path: '/board/:id', component: PostDetail },
    { path: '/write', component: Write },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/portfolio', component: Portfolio }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes
});

// === 앱 실행 ===
const app = Vue.createApp({
    data() { return { currentUser: localStorage.getItem('user_nickname') } },
    methods: {
        logout() {
            localStorage.removeItem('user_nickname');
            this.currentUser = null;
            this.$router.push('/');
        }
    }
});

app.use(router);
app.mount('#app');