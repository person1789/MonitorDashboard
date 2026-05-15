/* ==============================================
   DEEP-WORK.JS — Module 18: Deep Work Analytics
   Tracks study time by subject, integrates with Pomodoro
   ============================================== */

import { Storage } from '../utils/storage.js';

const SUBJECTS = ['Math', 'Physics', 'ECE', 'Coding', 'Latin', 'General'];
const SUBJECT_COLORS = {
    Math: '#34D399', Physics: '#60A5FA', ECE: '#A78BFA',
    Coding: '#F472B6', Latin: '#FBBF24', General: '#94A3B8'
};
const DAILY_GOAL_MINS = 210; // 3.5 hours

export default {
    id: 'deep-work',
    title: 'Deep Work Analytics',
    icon: '📊',
    defaultSize: { w: 480, h: 400 },
    minSize: { w: 360, h: 300 },

    _container: null,
    _logs: [],          // { date, subject, minutes }
    _activeSubject: '',
    _view: 'dashboard', // dashboard | log

    init(container) {
        this._container = container;
        this._logs = Storage.get('deep-work-logs') || [];
        this.render();
    },

    render() {
        if (this._view === 'log') return this._renderLog();
        this._renderDashboard();
    },

    _renderDashboard() {
        const today = new Date().toDateString();
        const todayLogs = this._logs.filter(l => l.date === today);
        const todayTotal = todayLogs.reduce((sum, l) => sum + l.minutes, 0);
        const goalPct = Math.min(100, Math.round((todayTotal / DAILY_GOAL_MINS) * 100));

        // Per-subject breakdown for today
        const bySubject = {};
        SUBJECTS.forEach(s => bySubject[s] = 0);
        todayLogs.forEach(l => bySubject[l.subject] = (bySubject[l.subject] || 0) + l.minutes);

        // Weekly data (last 7 days)
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toDateString();
            const dayLabel = d.toLocaleDateString('en', { weekday: 'short' });
            const mins = this._logs.filter(l => l.date === dateStr).reduce((s, l) => s + l.minutes, 0);
            weekData.push({ label: dayLabel, mins, date: dateStr });
        }
        const maxWeek = Math.max(...weekData.map(d => d.mins), DAILY_GOAL_MINS);

        // Pull from Pomodoro automatically
        const pomoData = Storage.getPomodoroData();
        const pomoToday = pomoData.todayDate === today ? pomoData.totalMinutesToday : 0;

        // Bar chart
        const bars = weekData.map(d => {
            const h = maxWeek > 0 ? (d.mins / maxWeek) * 100 : 0;
            const isToday = d.date === today;
            return `
                <div class="dw-bar-col">
                    <div class="dw-bar-val">${d.mins > 0 ? Math.round(d.mins) + 'm' : ''}</div>
                    <div class="dw-bar" style="height:${h}%;background:${isToday ? 'var(--accent-physics)' : 'rgba(96,165,250,0.3)'};"></div>
                    <div class="dw-bar-label ${isToday ? 'dw-today' : ''}">${d.label}</div>
                </div>
            `;
        }).join('');

        // Subject breakdown bars
        const subjectBars = SUBJECTS.map(s => {
            const mins = bySubject[s];
            if (mins === 0 && todayTotal === 0) return '';
            const pct = todayTotal > 0 ? (mins / todayTotal) * 100 : 0;
            return `
                <div class="dw-subj-row">
                    <span class="dw-subj-name" style="color:${SUBJECT_COLORS[s]}">${s}</span>
                    <div class="dw-subj-bar-wrap">
                        <div class="dw-subj-bar" style="width:${pct}%;background:${SUBJECT_COLORS[s]};"></div>
                    </div>
                    <span class="dw-subj-mins">${mins}m</span>
                </div>
            `;
        }).filter(Boolean).join('');

        // Subject selector for quick log
        const subjOptions = SUBJECTS.map(s => `<option value="${s}" ${this._activeSubject === s ? 'selected' : ''}>${s}</option>`).join('');

        this._container.innerHTML = `
            <div class="dw-top">
                <div class="dw-goal-ring">
                    <svg width="56" height="56" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="5"/>
                        <circle cx="28" cy="28" r="24" fill="none" stroke="var(--accent-physics)" stroke-width="5"
                            stroke-dasharray="${(goalPct / 100) * 150.8} 150.8"
                            stroke-linecap="round" transform="rotate(-90 28 28)"
                            style="transition:stroke-dasharray 0.6s var(--ease-out)"/>
                    </svg>
                    <div class="dw-goal-text">${goalPct}%</div>
                </div>
                <div>
                    <div style="font-size:1.1rem;font-weight:700;color:var(--text-primary);">${(todayTotal / 60).toFixed(1)}h</div>
                    <div style="font-size:0.65rem;color:var(--text-tertiary);">of ${(DAILY_GOAL_MINS / 60).toFixed(1)}h goal</div>
                    ${pomoToday > 0 ? `<div style="font-size:0.58rem;color:var(--accent-physics);margin-top:2px;">🍅 ${pomoToday}m from Pomodoro</div>` : ''}
                </div>
                <div style="margin-left:auto;display:flex;gap:4px;">
                    <button class="cb-btn" id="dw-log-view">📝 Log</button>
                </div>
            </div>

            <div style="margin:12px 0 8px;font-size:0.68rem;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;">Quick Log</div>
            <div style="display:flex;gap:6px;margin-bottom:12px;">
                <select id="dw-subj" class="cb-select" style="max-width:none;flex:1;">${subjOptions}</select>
                <input id="dw-mins" class="cb-input" type="number" min="5" max="480" step="5" value="30" style="width:70px;" placeholder="mins" />
                <button id="dw-add" class="cb-btn cb-btn--primary">+ Log</button>
            </div>

            ${subjectBars ? `
                <div style="margin-bottom:12px;">${subjectBars}</div>
            ` : ''}

            <div style="font-size:0.68rem;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;margin-bottom:6px;">This Week</div>
            <div class="dw-chart">${bars}</div>
        `;

        this._bind();
    },

    _renderLog() {
        const recent = [...this._logs].reverse().slice(0, 30);
        const rows = recent.map(l => `
            <div class="tb-row">
                <span class="tb-day">${new Date(l.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                <span class="tb-subj" style="color:${SUBJECT_COLORS[l.subject] || '#94A3B8'};background:${SUBJECT_COLORS[l.subject] || '#94A3B8'}18;">${l.subject}</span>
                <span class="tb-time" style="flex:1;text-align:right;">${l.minutes}m</span>
            </div>
        `).join('');

        this._container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <button class="cb-btn" id="dw-back">← Dashboard</button>
                <span style="font-size:0.72rem;color:var(--text-secondary);font-weight:600;">Recent Logs</span>
            </div>
            <div style="overflow-y:auto;max-height:calc(100% - 50px);">${rows || '<div style="text-align:center;padding:24px;color:var(--text-tertiary);">No study sessions logged yet.</div>'}</div>
        `;
        this._container.querySelector('#dw-back')?.addEventListener('click', () => { this._view = 'dashboard'; this.render(); });
    },

    _bind() {
        this._container.querySelector('#dw-log-view')?.addEventListener('click', () => { this._view = 'log'; this.render(); });
        this._container.querySelector('#dw-add')?.addEventListener('click', () => {
            const subj = this._container.querySelector('#dw-subj')?.value;
            const mins = parseInt(this._container.querySelector('#dw-mins')?.value) || 0;
            if (subj && mins > 0) {
                this._logs.push({ date: new Date().toDateString(), subject: subj, minutes: mins });
                Storage.set('deep-work-logs', this._logs);
                this.render();
            }
        });
    },

    destroy() {}
};
