/* ==============================================
   POMODORO.JS — Module 4: Study Timer
   ============================================== */

import { Storage } from '../utils/storage.js';

const DEFAULT_FOCUS = 25;
const DEFAULT_BREAK = 5;

export default {
    id: 'pomodoro',
    title: 'Pomodoro Timer',
    icon: '🍅',
    defaultSize: { w: 470, h: 255 },
    minSize: { w: 300, h: 220 },

    _container: null,
    _interval: null,
    _state: 'idle',         // idle | focus | break
    _focusMins: DEFAULT_FOCUS,
    _secondsLeft: DEFAULT_FOCUS * 60,
    _sessionsToday: 0,
    _totalMinutesToday: 0,
    _todayDate: '',

    init(container) {
        this._container = container;
        this._loadData();
        this.render();
    },

    _loadData() {
        const data = Storage.getPomodoroData();
        const today = new Date().toDateString();
        if (data.todayDate === today) {
            this._sessionsToday = data.sessions.length;
            this._totalMinutesToday = data.totalMinutesToday;
        } else {
            this._sessionsToday = 0;
            this._totalMinutesToday = 0;
        }
        this._todayDate = today;
    },

    render() {
        const mins = Math.floor(this._secondsLeft / 60);
        const secs = this._secondsLeft % 60;
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        const label = this._state === 'break' ? 'Break' : this._state === 'focus' ? 'Focus' : 'Ready';
        const totalHrs = (this._totalMinutesToday / 60).toFixed(1);

        this._container.innerHTML = `
            <div class="pomo-display">
                <div class="pomo-time-wrap" style="display:flex;align-items:center;justify-content:center;gap:12px;">
                    ${this._state === 'idle' ? `<button class="pomo-adj-btn" id="pomo-minus">−</button>` : ''}
                    <div class="pomo-time">${timeStr}</div>
                    ${this._state === 'idle' ? `<button class="pomo-adj-btn" id="pomo-plus">+</button>` : ''}
                </div>
                <div class="pomo-label">${label}</div>
                <div class="pomo-controls">
                    ${this._state === 'idle' ? `
                        <button class="pomo-btn pomo-btn--primary" id="pomo-start">Start Focus</button>
                    ` : `
                        <button class="pomo-btn" id="pomo-pause">${this._interval ? 'Pause' : 'Resume'}</button>
                        <button class="pomo-btn" id="pomo-reset">Reset</button>
                    `}
                </div>
                <div class="pomo-stats">
                    <div>
                        <div class="pomo-stat-value">${this._sessionsToday}</div>
                        <div class="pomo-stat-label">Sessions</div>
                    </div>
                    <div>
                        <div class="pomo-stat-value">${totalHrs}h</div>
                        <div class="pomo-stat-label">Study Time</div>
                    </div>
                </div>
            </div>
        `;

        // Bind
        const startBtn = document.getElementById('pomo-start');
        const pauseBtn = document.getElementById('pomo-pause');
        const resetBtn = document.getElementById('pomo-reset');
        const minusBtn = document.getElementById('pomo-minus');
        const plusBtn = document.getElementById('pomo-plus');

        if (startBtn) startBtn.addEventListener('click', () => this._startFocus());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this._togglePause());
        if (resetBtn) resetBtn.addEventListener('click', () => this._reset());
        if (minusBtn) minusBtn.addEventListener('click', () => this._adjustTime(-5));
        if (plusBtn) plusBtn.addEventListener('click', () => this._adjustTime(5));
    },

    _adjustTime(delta) {
        if (this._state !== 'idle') return;
        this._focusMins = Math.max(5, Math.min(120, this._focusMins + delta));
        this._secondsLeft = this._focusMins * 60;
        this.render();
    },

    _startFocus() {
        this._state = 'focus';
        this._secondsLeft = this._focusMins * 60;
        this._startTimer();
        this.render();
    },

    _startBreak() {
        this._state = 'break';
        this._secondsLeft = DEFAULT_BREAK * 60;
        this._startTimer();
        this.render();
    },

    _startTimer() {
        if (this._interval) clearInterval(this._interval);
        this._interval = setInterval(() => {
            this._secondsLeft--;
            if (this._secondsLeft <= 0) {
                this._onTimerEnd();
            }
            this.render();
        }, 1000);
    },

    _togglePause() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        } else {
            this._startTimer();
        }
        this.render();
    },

    _reset() {
        if (this._interval) clearInterval(this._interval);
        this._interval = null;
        this._state = 'idle';
        this._secondsLeft = this._focusMins * 60;
        this.render();
    },

    _onTimerEnd() {
        if (this._interval) clearInterval(this._interval);
        this._interval = null;

        if (this._state === 'focus') {
            // Session complete
            this._sessionsToday++;
            this._totalMinutesToday += this._focusMins;
            this._saveData();

            // Visual flash
            const panel = this._container.closest('.module-panel');
            if (panel) { panel.classList.add('pomo-flash'); setTimeout(() => panel.classList.remove('pomo-flash'), 2000); }

            // Start break
            this._startBreak();
        } else {
            // Break over
            this._state = 'idle';
            this._secondsLeft = this._focusMins * 60;
            this.render();
        }
    },

    _saveData() {
        Storage.savePomodoroData({
            sessions: Array(this._sessionsToday).fill(1),
            totalMinutesToday: this._totalMinutesToday,
            todayDate: this._todayDate
        });
    },

    destroy() {
        if (this._interval) clearInterval(this._interval);
    }
};
