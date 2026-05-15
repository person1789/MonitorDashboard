/* ==============================================
   SCHEDULE.JS — Module 3: Course Schedule Grid
   ============================================== */

export default {
    id: 'schedule',
    title: 'Schedule',
    icon: '🗓',
    defaultSize: { w: 470, h: 380 },
    minSize: { w: 350, h: 250 },

    _container: null,
    _schedule: null,

    async init(container) {
        this._container = container;
        try {
            const res = await fetch('data/schedule.json');
            this._schedule = await res.json();
        } catch {
            this._schedule = { semester: 'Summer 2026', blocks: [] };
        }
        this.render();
    },

    render() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0
        const hours = this._getHourRange();

        let html = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                <span style="font-size:0.72rem;font-weight:600;color:var(--text-secondary);">${this._schedule.semester || 'Schedule'}</span>
                ${this._getNextSession()}
            </div>
            <div class="schedule-grid" style="grid-template-columns: 44px repeat(${days.length}, 1fr);">
                <div></div>
                ${days.map((d, i) => `<div class="schedule-day-header ${i === todayIdx ? 'today' : ''}">${d}</div>`).join('')}
        `;

        for (const hour of hours) {
            const label = hour <= 12 ? `${hour}am` : `${hour - 12}pm`;
            if (hour === 12) {
                html += `<div class="schedule-time">12pm</div>`;
            } else {
                html += `<div class="schedule-time">${label}</div>`;
            }

            for (let d = 0; d < days.length; d++) {
                const block = this._getBlock(days[d], hour);
                if (block) {
                    const color = this._subjectColor(block.subject);
                    html += `<div class="schedule-block" style="background:${color}15;color:${color};border-left:2px solid ${color};">${block.name}</div>`;
                } else {
                    html += `<div></div>`;
                }
            }
        }

        html += '</div>';
        this._container.innerHTML = html;
    },

    _getBlock(dayName, hour) {
        if (!this._schedule.blocks) return null;
        return this._schedule.blocks.find(b => {
            const bDay = b.day.substring(0, 3);
            const bHour = parseInt(b.startTime.split(':')[0]);
            return bDay === dayName && bHour === hour;
        });
    },

    _getHourRange() {
        if (!this._schedule.blocks || this._schedule.blocks.length === 0) {
            return [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
        }
        let min = 24, max = 0;
        for (const b of this._schedule.blocks) {
            const sh = parseInt(b.startTime.split(':')[0]);
            const eh = parseInt(b.endTime.split(':')[0]);
            if (sh < min) min = sh;
            if (eh > max) max = eh;
        }
        const hours = [];
        for (let h = Math.max(6, min - 1); h <= Math.min(22, max); h++) hours.push(h);
        return hours;
    },

    _getNextSession() {
        if (!this._schedule.blocks || this._schedule.blocks.length === 0) return '';
        const now = new Date();
        const currentHour = now.getHours();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[now.getDay()];

        const upcoming = this._schedule.blocks.find(b => {
            const bHour = parseInt(b.startTime.split(':')[0]);
            return b.day === today && bHour > currentHour;
        });

        if (upcoming) {
            return `<span style="font-size:0.65rem;color:var(--accent-physics);">Next: ${upcoming.name} at ${upcoming.startTime}</span>`;
        }
        return '';
    },

    _subjectColor(subject) {
        const map = { math: '#34D399', physics: '#60A5FA', ece: '#A78BFA', latin: '#FBBF24', coding: '#F472B6' };
        return map[subject?.toLowerCase()] || '#94A3B8';
    },

    destroy() {}
};
