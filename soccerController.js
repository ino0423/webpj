// controllers/soccerController.js
const axios = require('axios');

const FOOTBALL_API_KEY = '0fcade12f25e41d1a55d9fa90dddf468';
const BASE_URL = 'https://api.football-data.org/v4/competitions';
const headers = { 'X-Auth-Token': FOOTBALL_API_KEY };

exports.getStandings = async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/${req.params.league}/standings`, { headers });
        const table = response.data.standings[0].table.map(t => ({
            rank: t.position, name: t.team.name, p: t.playedGames, pts: t.points,
            w: t.won, d: t.draw, l: t.lost, gd: t.goalDifference
        }));
        res.json(table);
    } catch (err) { res.status(500).json({ message: 'API Error' }); }
};

exports.getMatches = async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/${req.params.league}/matches?status=SCHEDULED`, { headers });
        const matches = response.data.matches.slice(0, 10).map(m => ({
            date: m.utcDate.split('T')[0], time: m.utcDate.split('T')[1].slice(0, 5),
            home: m.homeTeam.name, away: m.awayTeam.name, stadium: `${m.matchday}R`
        }));
        res.json(matches);
    } catch (err) { res.status(500).json({ message: 'API Error' }); }
};

exports.getResults = async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/${req.params.league}/matches?status=FINISHED`, { headers });
        const results = response.data.matches.slice(-10).reverse().map(m => ({
            date: m.utcDate.split('T')[0], home: m.homeTeam.name, away: m.awayTeam.name,
            homeScore: m.score.fullTime.home, awayScore: m.score.fullTime.away
        }));
        res.json(results);
    } catch (err) { res.status(500).json({ message: 'API Error' }); }
};