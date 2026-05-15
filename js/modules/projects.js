/* ==============================================
   PROJECTS.JS — Module 5: Project Portfolio
   ============================================== */

import { Storage } from '../utils/storage.js';

const STATUS_LIST = ['not-started', 'in-progress', 'complete'];
const STATUS_LABELS = { 'not-started': 'Not Started', 'in-progress': 'In Progress', 'complete': 'Complete' };
const STATUS_PCT = { 'not-started': 0, 'in-progress': 50, 'complete': 100 };

export default {
    id: 'projects',
    title: 'Projects',
    icon: '💻',
    defaultSize: { w: 490, h: 330 },
    minSize: { w: 300, h: 200 },

    _container: null,
    _projects: [],
    _statuses: {},

    async init(container) {
        this._container = container;
        this._statuses = Storage.getProjectStatuses();
        try {
            const res = await fetch('data/projects.json');
            const data = await res.json();
            this._projects = data.projects || [];
        } catch { this._projects = []; }
        this.render();
    },

    render() {
        const total = this._projects.length;
        const done = this._projects.filter(p => this._getStatus(p.id) === 'complete').length;
        const inProg = this._projects.filter(p => this._getStatus(p.id) === 'in-progress').length;

        let html = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                <span style="font-size:0.72rem;color:var(--text-secondary);font-weight:500;">${done}/${total} complete · ${inProg} in progress</span>
                <div class="phase-bar" style="width:80px;">
                    <div class="phase-bar-fill" style="width:${total > 0 ? (done / total) * 100 : 0}%;background:var(--accent-coding);"></div>
                </div>
            </div>
            <div class="project-grid">
        `;

        for (const p of this._projects) {
            const status = this._getStatus(p.id);
            const pct = STATUS_PCT[status];
            const langColor = this._langColor(p.language);

            html += `
                <div class="project-card" data-project-id="${p.id}" title="${p.description || p.name} — Click to cycle status">
                    <div class="project-name">${p.name}</div>
                    <span class="project-lang" style="color:${langColor}">${p.language}</span>
                    <div class="project-status">
                        <div class="project-status-fill" style="width:${pct}%;background:${langColor};"></div>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        this._container.innerHTML = html;

        // Bind clicks
        this._container.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.projectId;
                this._cycleStatus(id);
            });
        });
    },

    _getStatus(id) { return this._statuses[id] || 'not-started'; },

    _cycleStatus(id) {
        const current = this._getStatus(id);
        const idx = STATUS_LIST.indexOf(current);
        const next = STATUS_LIST[(idx + 1) % STATUS_LIST.length];
        this._statuses[id] = next;
        Storage.saveProjectStatus(id, next);
        this.render();
    },

    _langColor(lang) {
        const map = { Python: '#3B82F6', 'C++': '#F472B6', Both: '#A78BFA' };
        return map[lang] || '#94A3B8';
    },

    destroy() {}
};
