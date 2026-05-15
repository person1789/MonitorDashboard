/* ==============================================
   CLOCK-WEATHER.JS — Module 1
   ============================================== */

import { fetchWeather, getGreeting, formatTime, formatDate, getDayOfPlan } from '../utils/api.js';

const PLAN_START_DATE = '2026-06-01';

export default {
    id: 'clock-weather',
    title: 'Clock & Weather',
    icon: '🕐',
    defaultSize: { w: 460, h: 165 },
    minSize: { w: 300, h: 130 },

    _interval: null,
    _weatherInterval: null,
    _container: null,

    init(container) {
        this._container = container;
        this.render();
        this._tick();
        this._interval = setInterval(() => this._tick(), 1000);
        this._loadWeather();
        this._weatherInterval = setInterval(() => this._loadWeather(), 30 * 60 * 1000);
    },

    render() {
        this._container.innerHTML = `
            <div class="clock-greeting" id="cw-greeting"></div>
            <div style="display:flex;align-items:flex-end;gap:16px;">
                <div style="flex:1">
                    <div class="clock-time" id="cw-time"></div>
                    <div class="clock-date" id="cw-date"></div>
                    <div class="day-badge-inline" id="cw-day-badge"></div>
                </div>
                <div id="cw-weather" style="text-align:right;">
                    <div class="weather-icon" id="cw-weather-icon">🌤️</div>
                    <div class="weather-temp" id="cw-weather-temp">--°</div>
                    <div class="weather-desc" id="cw-weather-desc">Loading...</div>
                </div>
            </div>
        `;
    },

    _tick() {
        const now = new Date();
        const t = formatTime(now);

        const timeEl = document.getElementById('cw-time');
        if (timeEl) timeEl.innerHTML = `${t.h}:${t.m}<span class="seconds">:${t.s} ${t.ampm}</span>`;

        const dateEl = document.getElementById('cw-date');
        if (dateEl) dateEl.textContent = formatDate(now);

        const greetEl = document.getElementById('cw-greeting');
        if (greetEl) greetEl.textContent = getGreeting() + ', Ajay';

        const dayEl = document.getElementById('cw-day-badge');
        if (dayEl) {
            const day = getDayOfPlan(PLAN_START_DATE);
            if (day <= 90) {
                const phase = this._getPhase(day);
                dayEl.innerHTML = `<strong>Day ${day}</strong> / 90 &nbsp;·&nbsp; ${phase}`;
            } else {
                dayEl.innerHTML = `90-Day Plan Complete 🎉`;
            }
        }
    },

    async _loadWeather() {
        const w = await fetchWeather();
        const iconEl = document.getElementById('cw-weather-icon');
        const tempEl = document.getElementById('cw-weather-temp');
        const descEl = document.getElementById('cw-weather-desc');
        if (iconEl) iconEl.textContent = w.icon;
        if (tempEl) tempEl.textContent = w.temp + '°F';
        if (descEl) descEl.textContent = w.description;
    },

    _getPhase(day) {
        if (day <= 18) return 'Linear Algebra';
        if (day <= 36) return 'Diff. Equations';
        if (day <= 60) return 'E&M + Mechanics';
        if (day <= 78) return 'QM + C++ + ECE';
        return 'Integration';
    },

    destroy() {
        if (this._interval) clearInterval(this._interval);
        if (this._weatherInterval) clearInterval(this._weatherInterval);
    }
};
