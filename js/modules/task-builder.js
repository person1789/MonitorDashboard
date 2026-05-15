/* ==============================================
   TASK-BUILDER.JS — Module 15: Task Creator & Manager
   Create, edit, and organize 90-Day Plan tasks
   ============================================== */

import { Storage } from '../utils/storage.js';

const SUBJECTS = ['Math', 'Physics', 'ECE', 'Coding', 'Latin', 'Stats', 'General'];
const SUBJECT_COLORS = {
    math: '#34D399', physics: '#60A5FA', ece: '#A78BFA',
    coding: '#F472B6', latin: '#FBBF24', stats: '#FB923C', general: '#94A3B8'
};

function getColor(subj) {
    return SUBJECT_COLORS[subj?.toLowerCase()] || '#94A3B8';
}

export default {
    id: 'task-builder',
    title: 'Task Builder',
    icon: '✏️',
    defaultSize: { w: 480, h: 460 },
    minSize: { w: 350, h: 300 },

    _container: null,
    _view: 'list',          // list | add | edit
    _tasks: [],             // Full task list from tasks.json + custom
    _customTasks: [],       // User-created tasks (persisted in localStorage)
    _filterDay: 0,          // 0 = all
    _filterSubject: '',
    _editingTask: null,     // Task being edited
    _sortBy: 'day',         // day | subject

    async init(container) {
        this._container = container;
        // Load original tasks from JSON
        try {
            const res = await fetch('data/tasks.json');
            const data = await res.json();
            this._tasks = data.tasks || [];
        } catch {
            this._tasks = [];
        }
        // Load custom tasks from localStorage
        const saved = localStorage.getItem('dashboard_custom_tasks');
        if (saved) {
            try { this._customTasks = JSON.parse(saved); } catch {}
        }
        this.render();
    },

    _getAllTasks() {
        return [...this._tasks, ...this._customTasks];
    },

    render() {
        const tabs = `
            <div class="cb-tabs">
                <button class="cb-tab ${this._view === 'list' ? 'active' : ''}" data-view="list">📋 Tasks</button>
                <button class="cb-tab ${this._view === 'add' ? 'active' : ''}" data-view="add">➕ New Task</button>
            </div>
        `;

        let content = '';
        if (this._view === 'list') {
            content = this._renderList();
        } else if (this._view === 'add' || this._view === 'edit') {
            content = this._renderForm();
        }

        this._container.innerHTML = tabs + content;
        this._bindEvents();
    },

    /* ---- Task List View ---- */
    _renderList() {
        const allTasks = this._getAllTasks();
        const statuses = Storage.getTaskStatuses();

        // Filters
        const dayOptions = '<option value="0">All Days</option>' +
            Array.from({ length: 90 }, (_, i) => i + 1)
                .filter(d => allTasks.some(t => t.day === d))
                .map(d => `<option value="${d}" ${this._filterDay === d ? 'selected' : ''}>Day ${d}</option>`)
                .join('');

        const subjectOptions = '<option value="">All Subjects</option>' +
            SUBJECTS.map(s => `<option value="${s}" ${this._filterSubject === s ? 'selected' : ''}>${s}</option>`).join('');

        // Apply filters
        let filtered = allTasks;
        if (this._filterDay > 0) filtered = filtered.filter(t => t.day === this._filterDay);
        if (this._filterSubject) filtered = filtered.filter(t => t.subject === this._filterSubject);

        // Sort
        if (this._sortBy === 'day') {
            filtered.sort((a, b) => a.day - b.day || a.id.localeCompare(b.id));
        } else {
            filtered.sort((a, b) => a.subject.localeCompare(b.subject) || a.day - b.day);
        }

        // Stats
        const totalAll = allTasks.length;
        const doneCount = allTasks.filter(t => statuses[t.id] === 'done').length;
        const customCount = this._customTasks.length;

        const taskRows = filtered.length > 0
            ? filtered.map(t => this._renderTaskRow(t, statuses)).join('')
            : '<div style="text-align:center;padding:24px;color:var(--text-tertiary);font-size:0.75rem;">No tasks match your filters.</div>';

        return `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span class="tb-stats">${doneCount}/${totalAll} done · ${customCount} custom</span>
                <div style="display:flex;gap:4px;">
                    <button class="cb-btn tb-sort-btn" data-sort="day" title="Sort by day">📅</button>
                    <button class="cb-btn tb-sort-btn" data-sort="subject" title="Sort by subject">🏷️</button>
                </div>
            </div>
            <div class="tb-filters">
                <select id="tb-filter-day" class="cb-select">${dayOptions}</select>
                <select id="tb-filter-subject" class="cb-select">${subjectOptions}</select>
            </div>
            <div class="tb-task-list" style="overflow-y:auto; max-height:calc(100% - 120px);">
                ${taskRows}
            </div>
        `;
    },

    _renderTaskRow(task, statuses) {
        const status = statuses[task.id] || 'todo';
        const color = getColor(task.subject);
        const isCustom = this._customTasks.some(t => t.id === task.id);
        const statusDot = status === 'done' ? '✓' : status === 'skipped' ? '→' : status === 'revisit' ? '↻' : '○';
        const statusColor = status === 'done' ? '#34D399' : status === 'skipped' ? '#FB923C' : status === 'revisit' ? '#60A5FA' : 'var(--text-tertiary)';

        return `
            <div class="tb-row">
                <span class="tb-status" style="color:${statusColor};" data-task-id="${task.id}" title="Click to cycle status">${statusDot}</span>
                <span class="tb-day">D${task.day}</span>
                <span class="tb-desc ${status === 'done' ? 'tb-done' : ''}">${task.description}</span>
                <span class="tb-subj" style="color:${color};background:${color}18;">${task.subject}</span>
                ${task.estimatedMinutes ? `<span class="tb-time">${task.estimatedMinutes}m</span>` : ''}
                ${isCustom ? `
                    <button class="tb-action-btn tb-edit-btn" data-task-id="${task.id}" title="Edit">✎</button>
                    <button class="tb-action-btn tb-del-btn" data-task-id="${task.id}" title="Delete">✕</button>
                ` : ''}
            </div>
        `;
    },

    /* ---- Add/Edit Form ---- */
    _renderForm() {
        const t = this._editingTask || {};
        const isEdit = this._view === 'edit';
        const title = isEdit ? 'Edit Task' : 'New Task';

        const subjectOptions = SUBJECTS.map(s =>
            `<option value="${s}" ${t.subject === s ? 'selected' : ''}>${s}</option>`
        ).join('');

        return `
            <div class="tb-form">
                <div class="tb-form-title">${title}</div>

                <label class="tb-label">Day (1–90)</label>
                <input id="tb-day" class="cb-input" type="number" min="1" max="90" value="${t.day || 1}" />

                <label class="tb-label">Subject</label>
                <select id="tb-subject" class="cb-select" style="max-width:none;width:100%;">${subjectOptions}</select>

                <label class="tb-label">Description</label>
                <textarea id="tb-desc" class="cb-input" rows="3" style="resize:vertical;min-height:60px;">${t.description || ''}</textarea>

                <label class="tb-label">Estimated Minutes</label>
                <input id="tb-minutes" class="cb-input" type="number" min="5" max="480" step="5" value="${t.estimatedMinutes || 30}" />

                <div style="display:flex;gap:8px;margin-top:14px;">
                    <button id="tb-save" class="cb-btn cb-btn--primary" style="flex:1;">
                        ${isEdit ? '💾 Save Changes' : '➕ Add Task'}
                    </button>
                    <button id="tb-cancel" class="cb-btn" style="flex:0.5;">Cancel</button>
                </div>
            </div>
        `;
    },

    /* ---- Event Binding ---- */
    _bindEvents() {
        // Tab switching
        this._container.querySelectorAll('.cb-tab[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                this._view = btn.dataset.view;
                this._editingTask = null;
                this.render();
            });
        });

        // Filters
        const dayFilter = this._container.querySelector('#tb-filter-day');
        const subjFilter = this._container.querySelector('#tb-filter-subject');
        if (dayFilter) dayFilter.addEventListener('change', e => { this._filterDay = parseInt(e.target.value); this.render(); });
        if (subjFilter) subjFilter.addEventListener('change', e => { this._filterSubject = e.target.value; this.render(); });

        // Sort
        this._container.querySelectorAll('.tb-sort-btn').forEach(btn => {
            btn.addEventListener('click', () => { this._sortBy = btn.dataset.sort; this.render(); });
        });

        // Status cycling
        this._container.querySelectorAll('.tb-status').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.taskId;
                const statuses = Storage.getTaskStatuses();
                const cycle = ['todo', 'done', 'skipped', 'revisit'];
                const current = statuses[id] || 'todo';
                const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
                Storage.saveTaskStatus(id, next);
                this.render();
            });
        });

        // Edit buttons
        this._container.querySelectorAll('.tb-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.taskId;
                this._editingTask = this._customTasks.find(t => t.id === id);
                this._view = 'edit';
                this.render();
            });
        });

        // Delete buttons
        this._container.querySelectorAll('.tb-del-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.taskId;
                this._customTasks = this._customTasks.filter(t => t.id !== id);
                this._saveCustomTasks();
                this.render();
            });
        });

        // Save button (add/edit form)
        const saveBtn = this._container.querySelector('#tb-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this._saveTask());
        }

        // Cancel
        const cancelBtn = this._container.querySelector('#tb-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this._view = 'list';
                this._editingTask = null;
                this.render();
            });
        }
    },

    _saveTask() {
        const day = parseInt(this._container.querySelector('#tb-day')?.value) || 1;
        const subject = this._container.querySelector('#tb-subject')?.value || 'General';
        const description = this._container.querySelector('#tb-desc')?.value?.trim();
        const estimatedMinutes = parseInt(this._container.querySelector('#tb-minutes')?.value) || 30;

        if (!description) return;

        if (this._view === 'edit' && this._editingTask) {
            // Update existing
            const idx = this._customTasks.findIndex(t => t.id === this._editingTask.id);
            if (idx !== -1) {
                this._customTasks[idx] = { ...this._customTasks[idx], day, subject, description, estimatedMinutes };
            }
        } else {
            // Create new
            const id = 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            this._customTasks.push({ id, day, subject, description, estimatedMinutes });
        }

        this._saveCustomTasks();
        this._view = 'list';
        this._editingTask = null;
        this.render();
    },

    _saveCustomTasks() {
        localStorage.setItem('dashboard_custom_tasks', JSON.stringify(this._customTasks));
    },

    destroy() {}
};
