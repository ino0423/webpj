const API_BASE = 'http://localhost:3000/api';

// === 컴포넌트 정의 ===

const Home = { template: '#home-template' };

const LeagueMenu = {
    template: '#league-menu-template',
    props: ['code'],
    computed: {
        leagueName() {
            const map = { 'PL':'EPL', 'BL1':'분데스리가', 'PD':'라리가', 'FL1':'리그1' };
            return map[this.$route.params.code] || '리그';
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
    async mounted() { await this.loadData(); },
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

const AiAnalysis = {
    template: '#ai-template',
    data() {
        return { homeRank: 5, awayRank: 15, prediction: null, model: null, loading: false };
    },
    mounted() {
        setTimeout(() => this.initModel(), 1000);
    },
    methods: {
        async initModel() {
            this.loading = true;

            try {
                if (!window.tf) {
                    console.log("TensorFlow 로딩 대기 중...");
                    setTimeout(() => this.initModel(), 500);
                    return;
                }

                // 🚨 [여기가 핵심입니다!] 🚨
                // 순서를 바꿨습니다. CPU 설정을 가장 먼저 해야 에러가 안 납니다.
                
                // 1. "나 CPU 쓸 거야!" 라고 먼저 선언 (그래픽카드 초기화 시도 자체를 막음)
                await window.tf.setBackend('cpu'); 
                
                // 2. 그 다음에 준비 완료 기다리기
                await window.tf.ready();

                console.log("현재 백엔드:", window.tf.getBackend()); // 'cpu'가 찍혀야 성공

                // 3. 모델 정의
                this.model = window.tf.sequential();
                this.model.add(window.tf.layers.dense({units: 8, inputShape: [2], activation: 'relu'}));
                this.model.add(window.tf.layers.dense({units: 1, activation: 'sigmoid'}));
                
                this.model.compile({loss: 'meanSquaredError', optimizer: 'adam'});

                // 4. 학습 데이터
                const xs = window.tf.tensor2d([
                    [0.05, 1.0], [0.1, 0.9], [0.15, 0.75], 
                    [1.0, 0.05], [0.9, 0.1], [0.75, 0.15], 
                    [0.5, 0.5], [0.25, 0.25]
                ]);
                const ys = window.tf.tensor2d([
                    [0.9], [0.85], [0.8], 
                    [0.1], [0.15], [0.2], 
                    [0.5], [0.5]
                ]);

                console.log("학습 시작...");
                await this.model.fit(xs, ys, {epochs: 30});
                console.log("학습 완료!");
                
                this.loading = false;

            } catch (e) {
                console.error(e);
                alert("AI 초기화 에러:\n" + e.message);
                this.loading = false;
            }
        },
        predict() {
            if (!this.model) return alert("모델이 준비되지 않았습니다.");
            if (this.loading) return alert('아직 학습 중입니다.');

            try {
                const h = Number(this.homeRank);
                const a = Number(this.awayRank);
                if (!h || !a || h < 1 || a < 1) return alert("1 이상의 순위를 입력하세요.");

                const input = window.tf.tensor2d([[h / 20, a / 20]]);
                const result = this.model.predict(input);
                const prob = result.dataSync()[0];
                
                this.prediction = (prob * 100).toFixed(1);

            } catch (e) {
                alert("예측 에러: " + e.message);
            }
        }
    }
};
const Portfolio = {
    template: '#portfolio-template',
    data() { return { projects: [] } },
    async mounted() {
        try {
            const res = await fetch(`${API_BASE}/portfolio`);
            if(!res.ok) throw new Error();
            this.projects = await res.json();
            // 데이터 매핑
            this.projects = this.projects.map(p => ({
                ...p, img: p.image_url, tech: p.tech_stack, desc: p.description, link: p.github_link
            }));
        } catch(e) { console.error(e); }
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
    { path: '/ai', component: AiAnalysis }, // AI 경로 추가
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