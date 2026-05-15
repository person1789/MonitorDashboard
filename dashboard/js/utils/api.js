/* ==============================================
   API.JS — External API Helpers
   Weather (OpenWeatherMap) + Latin (Whitaker's Words)
   ============================================== */

import { Storage } from './storage.js';

// ---- OpenWeatherMap ----
// User: replace with your API key from https://openweathermap.org/api
const WEATHER_API_KEY = 'df9c39c2354cb68a75e96e0815598730';
const WEATHER_CITY = 'Columbus,OH,US';

export async function fetchWeather() {
    // Check cache first
    const cached = Storage.getCachedWeather();
    if (cached) return cached;

    if (WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
        // Return fallback if no API key
        return {
            temp: '--',
            description: 'Set API key',
            icon: '🌤️',
            feelsLike: '--',
            humidity: '--'
        };
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${WEATHER_CITY}&appid=${WEATHER_API_KEY}&units=imperial`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
        const data = await res.json();

        const weather = {
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            icon: getWeatherEmoji(data.weather[0].icon),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity
        };

        Storage.cacheWeather(weather);
        return weather;
    } catch (err) {
        console.warn('Weather fetch failed:', err);
        return { temp: '--', description: 'Unavailable', icon: '☁️', feelsLike: '--', humidity: '--' };
    }
}

function getWeatherEmoji(iconCode) {
    const map = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '🌨️', '13n': '🌨️',
        '50d': '🌫️', '50n': '🌫️',
    };
    return map[iconCode] || '🌤️';
}

// ---- Latin Word of the Day (Whitaker's Words via latin.71m.us) ----

export async function fetchLatinWord(word) {
    const cached = Storage.getCachedLatin();
    if (cached && cached.word === word) return cached;

    try {
        const url = `https://latin.71m.us/latin/${encodeURIComponent(word)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Latin API error: ${res.status}`);
        const data = await res.json();

        if (!data || !data.length) {
            return buildFallbackLatin(word);
        }

        // Parse Whitaker's Words response
        const entry = data[0];
        const result = {
            word: word,
            principalParts: entry.forms ? entry.forms.join(', ') : word,
            partOfSpeech: entry.pos || 'unknown',
            gender: entry.gender || null,
            declension: entry.declension || entry.conjugation || null,
            meanings: entry.meanings || ['(meaning unavailable)'],
            raw: entry
        };

        Storage.cacheLatin(result);
        return result;
    } catch (err) {
        console.warn('Latin API fetch failed:', err);
        return buildFallbackLatin(word);
    }
}

function buildFallbackLatin(word) {
    return {
        word: word,
        principalParts: word,
        partOfSpeech: 'unknown',
        gender: null,
        declension: null,
        meanings: ['(Offline — check connection)'],
        raw: null
    };
}

// ---- GitHub API (for weekly stats) ----

const GITHUB_USERNAME = 'person1789'; // From context

export async function fetchGitHubCommits() {
    try {
        const since = new Date();
        since.setDate(since.getDate() - 7);
        const url = `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`;
        const res = await fetch(url);
        if (!res.ok) return 0;
        const events = await res.json();

        let commitCount = 0;
        for (const event of events) {
            if (event.type === 'PushEvent' && new Date(event.created_at) >= since) {
                commitCount += event.payload.commits ? event.payload.commits.length : 0;
            }
        }
        return commitCount;
    } catch {
        return 0;
    }
}

// ---- Time Helpers ----

export function getGreeting() {
    const h = new Date().getHours();
    if (h < 5)  return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
}

export function getDayOfPlan(startDateStr) {
    const start = new Date(startDateStr);
    const now = new Date();
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
}

export function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

export function formatTime(date) {
    const h = date.getHours();
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    const h12 = h % 12 || 12;
    return { h: String(h12), m, s, ampm: h >= 12 ? 'PM' : 'AM' };
}
