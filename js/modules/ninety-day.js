/* ==============================================
   NINETY-DAY.JS — Module 2: 90-Day Plan Tracker
   ============================================== */

import { Storage } from '../utils/storage.js';
import { getDayOfPlan } from '../utils/api.js';

const PLAN_START_DATE = '2026-06-01';
const STATUS_CYCLE = ['todo', 'done', 'skipped', 'revisit'];
const STATUS_ICONS = { done: '✓', skipped: '→', revisit: '↻', todo: '' };

export default {
    id: 'ninety-day',
    title: '90-Day Plan',
    icon: '📐',
    defaultSize: { w: 460, h: 470 },
    minSize: { w: 340, h: 300 },

    _container: null,
    _tasks: [],
    _statuses: {},

    async init(container) {
        this._container = container;
        this._statuses = Storage.getTaskStatuses();
        try {
            const res = await fetch('data/tasks.json');
            const data = await res.json();
            this._tasks = data.tasks || [];
        } catch {
            this._tasks = [];
        }
        this.render();
    },

    render() {
        const currentDay = getDayOfPlan(PLAN_START_DATE);
        const todayTasks = this._tasks.filter(t => t.day === currentDay);
        const tomorrowTasks = this._tasks.filter(t => t.day === currentDay + 1);
        const totalTasks = this._tasks.length;
        const doneTasks = this._tasks.filter(t => this._getStatus(t.id) === 'done').length;
        const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

        // Phase info
        const phase = this._getPhaseInfo(currentDay);

        this._container.innerHTML = `
            <div class="phase-bar-wrap">
                <div class="phase-label">
                    <span>${phase.name}</span>
                    <span>Day ${Math.min(currentDay, phase.end)} / ${phase.end}</span>
                </div>
                <div class="phase-bar">
                    <div class="phase-bar-fill" style="width:${phase.pct}%"></div>
                </div>
            </div>

            <div class="progress-ring-wrap">
                <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="4"/>
                    <circle cx="22" cy="22" r="18" fill="none" stroke="var(--accent-physics)" stroke-width="4"
                        stroke-dasharray="${(pct / 100) * 113} 113"
                        stroke-linecap="round" transform="rotate(-90 22 22)"
                        style="transition:stroke-dasharray 0.6s var(--ease-out)"/>
                </svg>
                <div>
                    <div class="progress-ring-pct">${pct}%</div>
                    <div class="progress-ring-label">${doneTasks} / ${totalTasks} tasks</div>
                </div>
            </div>

            <div class="section-label" style="font-size:0.68rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);margin-bottom:6px;">
                Today — Day ${currentDay}
            </div>
            <div id="today-tasks">
                ${todayTasks.length > 0 ? todayTasks.map(t => this._renderTask(t)).join('') : '<p style="font-size:0.78rem;color:var(--text-tertiary);padding:8px 0;">No tasks for today</p>'}
            </div>

            ${tomorrowTasks.length > 0 ? `
            <div class="tomorrow-preview">
                <div class="tomorrow-label">Tomorrow — Day ${currentDay + 1}</div>
                ${tomorrowTasks.map(t => this._renderTask(t, true)).join('')}
            </div>` : ''}
        `;

        // Bind click handlers
        this._container.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = cb.dataset.taskId;
                this._cycleStatus(id);
            });
        });
    },

    _renderTask(task, dimmed = false) {
        const status = this._getStatus(task.id);
        const subjectClass = this._subjectClass(task.subject);
        const subjectColor = this._subjectColor(task.subject);

        return `
            <div class="task-item" ${dimmed ? 'style="opacity:0.5;pointer-events:none"' : ''}>
                <div class="task-checkbox ${status}" data-task-id="${task.id}" title="Click to change status">
                    ${STATUS_ICONS[status] || ''}
                </div>
                <div class="task-text ${status === 'done' ? 'completed' : ''}">${task.description}</div>
                <span class="task-subject badge--${subjectClass}" style="background:${subjectColor}20;color:${subjectColor}">${task.subject}</span>
            </div>
        `;
    },

    _getStatus(taskId) {
        return this._statuses[taskId] || 'todo';
    },

    _cycleStatus(taskId) {
        const current = this._getStatus(taskId);
        const idx = STATUS_CYCLE.indexOf(current);
        const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
        this._statuses[taskId] = next;
        Storage.saveTaskStatus(taskId, next);
        this.render();
    },

    _getPhaseInfo(day) {
        const phases = [
            { name: 'Phase 1 — Linear Algebra', start: 1, end: 18 },
            { name: 'Phase 2 — Diff. Equations', start: 19, end: 36 },
            { name: 'Phase 3 — E&M + Mechanics', start: 37, end: 60 },
            { name: 'Phase 4 — QM + C++ + ECE', start: 61, end: 78 },
            { name: 'Phase 5 — Integration', start: 79, end: 90 },
        ];
        const phase = phases.find(p => day >= p.start && day <= p.end) || phases[phases.length - 1];
        const pct = Math.min(100, Math.round(((day - phase.start) / (phase.end - phase.start + 1)) * 100));
        return { ...phase, pct };
    },

    _subjectClass(subject) {
        const map = { math: 'math', physics: 'physics', ece: 'ece', latin: 'latin', coding: 'coding', c: 'coding', python: 'coding' };
        return map[subject?.toLowerCase()] || 'general';
    },

    _subjectColor(subject) {
        const map = { math: '#34D399', physics: '#60A5FA', ece: '#A78BFA', latin: '#FBBF24', coding: '#F472B6', c: '#F472B6', python: '#F472B6' };
        return map[subject?.toLowerCase()] || '#94A3B8';
    },

    destroy() {}
};
