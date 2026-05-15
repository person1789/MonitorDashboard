/* ==============================================
   COURSE-BUILDER.JS — Module 14: OSU Course Builder
   Search, select, and auto-schedule OSU courses
   ============================================== */

import { fetchOSUCourses, TERMS, SUBJECTS, parseTime, formatTimeFromMinutes } from '../utils/osu-api.js';
import { solveSchedule } from '../utils/schedule-solver.js';

const SUBJECT_COLORS = {
    PHYSICS: '#60A5FA',
    MATH:    '#34D399',
    ECE:     '#A78BFA',
    LATIN:   '#FBBF24',
    CSE:     '#F472B6',
    STAT:    '#FB923C',
    ENGR:    '#94A3B8',
};

function getSubjectColor(subj) {
    return SUBJECT_COLORS[subj?.toUpperCase()] || '#94A3B8';
}

export default {
    id: 'course-builder',
    title: 'Course Builder',
    icon: '🗓',
    defaultSize: { w: 700, h: 520 },
    minSize: { w: 500, h: 400 },

    _container: null,
    _view: 'search',       // search | mycourses | schedule
    _term: '1268',          // Default: Autumn 2026
    _subject: '',
    _query: '',
    _results: [],
    _selectedCourses: [],   // Array of course objects user has added
    _solutions: [],         // Solver results
    _activeSolution: 0,     // Which of the top-3 is shown
    _loading: false,

    init(container) {
        this._container = container;
        // Load saved selected courses from localStorage
        const saved = localStorage.getItem('dashboard_cb_courses');
        if (saved) {
            try { this._selectedCourses = JSON.parse(saved); } catch {}
        }
        this.render();
    },

    render() {
        const termOptions = TERMS.map(t =>
            `<option value="${t.code}" ${t.code === this._term ? 'selected' : ''}>${t.label}</option>`
        ).join('');

        const subjectOptions = '<option value="">All Subjects</option>' + SUBJECTS.map(s =>
            `<option value="${s.code}" ${s.code === this._subject ? 'selected' : ''}>${s.label}</option>`
        ).join('');

        // Tab bar
        const tabs = `
            <div class="cb-tabs">
                <button class="cb-tab ${this._view === 'search' ? 'active' : ''}" data-view="search">🔍 Search</button>
                <button class="cb-tab ${this._view === 'mycourses' ? 'active' : ''}" data-view="mycourses">📚 My Courses (${this._selectedCourses.length})</button>
                <button class="cb-tab ${this._view === 'schedule' ? 'active' : ''}" data-view="schedule">📅 Schedule</button>
            </div>
        `;

        let content = '';
        if (this._view === 'search') {
            content = this._renderSearch(termOptions, subjectOptions);
        } else if (this._view === 'mycourses') {
            content = this._renderMyCourses();
        } else if (this._view === 'schedule') {
            content = this._renderSchedule();
        }

        this._container.innerHTML = tabs + content;
        this._bindEvents();
    },

    /* ---- Search View ---- */
    _renderSearch(termOptions, subjectOptions) {
        const resultsHtml = this._loading
            ? '<div style="text-align:center;padding:24px;color:var(--text-tertiary);">Loading courses from OSU...</div>'
            : this._results.length > 0
                ? this._results.map(c => this._renderCourseCard(c)).join('')
                : this._query
                    ? '<div style="text-align:center;padding:24px;color:var(--text-tertiary);">No courses found. Try a different search.</div>'
                    : '<div style="text-align:center;padding:24px;color:var(--text-tertiary);">Search for courses by name or number above.</div>';

        return `
            <div class="cb-search-bar">
                <select id="cb-term" class="cb-select">${termOptions}</select>
                <select id="cb-subject" class="cb-select">${subjectOptions}</select>
                <input id="cb-query" class="cb-input" type="text" placeholder="Course name or number..." value="${this._query}" />
                <button id="cb-search-btn" class="cb-btn cb-btn--primary">Search</button>
            </div>
            <div class="cb-results" style="overflow-y:auto; max-height:calc(100% - 100px);">
                ${resultsHtml}
            </div>
        `;
    },

    _renderCourseCard(course) {
        const isAdded = this._selectedCourses.some(c => c.courseId === course.courseId);
        const color = getSubjectColor(course.subject);
        const sectionCount = course.sections.length;
        const openCount = course.sections.filter(s => s.enrollmentStatus === 'Open').length;
        const closedCount = sectionCount - openCount;

        return `
            <div class="cb-course-card" style="border-left: 3px solid ${color};">
                <div class="cb-card-header">
                    <div>
                        <span class="cb-card-subj" style="color:${color};">${course.subject} ${course.catalogNumber}</span>
                        <span class="cb-card-credits">${course.credits} cr</span>
                    </div>
                    ${isAdded
                        ? `<button class="cb-btn cb-btn--added" disabled>✓ Added</button>`
                        : `<button class="cb-btn cb-btn--add" data-courseid="${course.courseId}">+ Add</button>`
                    }
                </div>
                <div class="cb-card-title">${course.title}</div>
                <div class="cb-card-meta">
                    <span>${sectionCount} sections</span>
                    <span style="color:#34D399;">${openCount} open</span>
                    ${closedCount > 0 ? `<span style="color:#EF4444;">${closedCount} closed</span>` : ''}
                </div>
            </div>
        `;
    },

    /* ---- My Courses View ---- */
    _renderMyCourses() {
        if (this._selectedCourses.length === 0) {
            return `<div style="text-align:center;padding:40px;color:var(--text-tertiary);">
                No courses added yet. Use the Search tab to find and add courses.
            </div>`;
        }

        const cards = this._selectedCourses.map(c => {
            const color = getSubjectColor(c.subject);
            const components = {};
            c.sections.forEach(s => {
                if (!components[s.component]) components[s.component] = 0;
                components[s.component]++;
            });
            const compStr = Object.entries(components).map(([k, v]) => `${v} ${k}`).join(' · ');

            return `
                <div class="cb-course-card" style="border-left: 3px solid ${color};">
                    <div class="cb-card-header">
                        <div>
                            <span class="cb-card-subj" style="color:${color};">${c.subject} ${c.catalogNumber}</span>
                            <span class="cb-card-credits">${c.credits} cr</span>
                        </div>
                        <button class="cb-btn cb-btn--remove" data-courseid="${c.courseId}">✕ Remove</button>
                    </div>
                    <div class="cb-card-title">${c.title}</div>
                    <div class="cb-card-meta">${compStr}</div>
                </div>
            `;
        }).join('');

        const totalCredits = this._selectedCourses.reduce((sum, c) => sum + c.credits, 0);

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span style="font-size:0.75rem;color:var(--text-secondary);">Total: ${totalCredits} credits</span>
                <button id="cb-solve-btn" class="cb-btn cb-btn--primary">⚡ Find Best Schedules</button>
            </div>
            <div class="cb-results" style="overflow-y:auto; max-height:calc(100% - 100px);">
                ${cards}
            </div>
        `;
    },

    /* ---- Schedule View ---- */
    _renderSchedule() {
        if (this._solutions.length === 0) {
            return `<div style="text-align:center;padding:40px;color:var(--text-tertiary);">
                No schedule generated yet. Add courses and click "Find Best Schedules" in My Courses.
            </div>`;
        }

        const sol = this._solutions[this._activeSolution];

        // Solution picker
        const picker = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <div class="cb-solution-nav">
                    ${this._solutions.map((s, i) => `
                        <button class="cb-tab ${i === this._activeSolution ? 'active' : ''}" data-sol="${i}">
                            Option ${i + 1}
                        </button>
                    `).join('')}
                </div>
                <span style="font-size:0.65rem;color:var(--text-tertiary);">Gap score: ${sol.score} min</span>
            </div>
        `;

        // Build weekly grid
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const startHour = 8;
        const endHour = 21;
        const hourHeight = 28;
        const totalHeight = (endHour - startHour) * hourHeight;

        // Collect all blocks
        const blocks = [];
        for (const entry of sol.courses) {
            for (const sec of entry.sections) {
                if (!sec.startTime || !sec.endTime) continue;
                const start = parseTime(sec.startTime);
                const end = parseTime(sec.endTime);
                for (const d of sec.days) {
                    const dayIdx = days.indexOf(d);
                    if (dayIdx === -1) continue;
                    blocks.push({
                        dayIdx,
                        start,
                        end,
                        label: `${entry.course.subject} ${entry.course.catalogNumber}`,
                        component: sec.component,
                        room: sec.room,
                        color: getSubjectColor(entry.course.subject),
                        status: sec.enrollmentStatus,
                    });
                }
            }
        }

        // Time labels
        let timeLabels = '';
        for (let h = startHour; h < endHour; h++) {
            const ampm = h >= 12 ? 'pm' : 'am';
            const dh = h > 12 ? h - 12 : h;
            timeLabels += `<div class="cb-grid-time" style="top:${(h - startHour) * hourHeight}px;">${dh}${ampm}</div>`;
        }

        // Block elements
        const blockEls = blocks.map(b => {
            const top = ((b.start / 60) - startHour) * hourHeight;
            const height = ((b.end - b.start) / 60) * hourHeight;
            const left = `calc(${b.dayIdx} * (100% / 5))`;
            const width = `calc(100% / 5 - 4px)`;
            const opacity = b.status === 'Closed' ? '0.5' : '1';
            const closedBadge = b.status === 'Closed' ? '<span style="font-size:0.5rem;color:#EF4444;">CLOSED</span>' : '';

            return `<div class="cb-grid-block" style="
                position:absolute;
                top:${top}px; left:${left}; width:${width}; height:${height}px;
                background:${b.color}22; border:1px solid ${b.color}66;
                border-radius:4px; padding:2px 4px; overflow:hidden;
                font-size:0.55rem; color:var(--text-primary); opacity:${opacity};
                box-sizing:border-box;
            ">
                <div style="font-weight:600;">${b.label}</div>
                <div style="color:var(--text-tertiary);">${b.component}</div>
                <div style="color:var(--text-tertiary);">${b.room}</div>
                ${closedBadge}
            </div>`;
        }).join('');

        // Day headers
        const dayHeaders = days.map(d => `<div class="cb-grid-day">${d}</div>`).join('');

        // Grid lines
        let gridLines = '';
        for (let h = startHour; h < endHour; h++) {
            gridLines += `<div class="cb-grid-line" style="top:${(h - startHour) * hourHeight}px;"></div>`;
        }

        return picker + `
            <div class="cb-grid-container" style="overflow-y:auto; max-height:calc(100% - 60px);">
                <div class="cb-grid-header">${dayHeaders}</div>
                <div class="cb-grid" style="position:relative; height:${totalHeight}px; margin-left:40px;">
                    <div class="cb-grid-times">${timeLabels}</div>
                    ${gridLines}
                    ${blockEls}
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
                this.render();
            });
        });

        // Solution navigation
        this._container.querySelectorAll('.cb-tab[data-sol]').forEach(btn => {
            btn.addEventListener('click', () => {
                this._activeSolution = parseInt(btn.dataset.sol);
                this.render();
            });
        });

        // Search
        const searchBtn = this._container.querySelector('#cb-search-btn');
        const queryInput = this._container.querySelector('#cb-query');
        const termSelect = this._container.querySelector('#cb-term');
        const subjectSelect = this._container.querySelector('#cb-subject');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this._doSearch());
        }
        if (queryInput) {
            queryInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this._doSearch();
            });
        }
        if (termSelect) {
            termSelect.addEventListener('change', (e) => { this._term = e.target.value; });
        }
        if (subjectSelect) {
            subjectSelect.addEventListener('change', (e) => { this._subject = e.target.value; });
        }

        // Add course buttons
        this._container.querySelectorAll('.cb-btn--add').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.courseid;
                const course = this._results.find(c => c.courseId === id);
                if (course && !this._selectedCourses.some(c => c.courseId === id)) {
                    this._selectedCourses.push(course);
                    this._saveCourses();
                    this.render();
                }
            });
        });

        // Remove course buttons
        this._container.querySelectorAll('.cb-btn--remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.courseid;
                this._selectedCourses = this._selectedCourses.filter(c => c.courseId !== id);
                this._saveCourses();
                this.render();
            });
        });

        // Solve button
        const solveBtn = this._container.querySelector('#cb-solve-btn');
        if (solveBtn) {
            solveBtn.addEventListener('click', () => {
                this._solutions = solveSchedule(this._selectedCourses, 3);
                this._activeSolution = 0;
                this._view = 'schedule';
                this.render();
            });
        }
    },

    async _doSearch() {
        const queryInput = this._container.querySelector('#cb-query');
        this._query = queryInput ? queryInput.value.trim() : '';
        if (!this._query) return;

        this._loading = true;
        this.render();

        this._results = await fetchOSUCourses(this._query, this._term, this._subject);
        this._loading = false;
        this.render();
    },

    _saveCourses() {
        localStorage.setItem('dashboard_cb_courses', JSON.stringify(this._selectedCourses));
    },

    destroy() {}
};
