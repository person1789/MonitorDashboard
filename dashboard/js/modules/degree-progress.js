/* ==============================================
   DEGREE-PROGRESS.JS — Module 21: Degree & GPA Tracker
   Triple major progress visualization
   ============================================== */

import { Storage } from '../utils/storage.js';

const DEGREES = [
    {
        name: 'EECE',
        fullName: 'Electrical & Computer Engineering',
        color: '#A78BFA',
        totalCredits: 130,
        required: [
            { course: 'ENGR 1181', credits: 2, status: 'planned' },
            { course: 'ENGR 1182', credits: 2, status: 'planned' },
            { course: 'CSE 1222', credits: 3, status: 'planned' },
            { course: 'ECE 2020', credits: 3, status: 'planned' },
            { course: 'ECE 2060', credits: 3, status: 'planned' },
            { course: 'ECE 2100', credits: 3, status: 'planned' },
            { course: 'ECE 3010', credits: 3, status: 'planned' },
            { course: 'ECE 3080', credits: 3, status: 'planned' },
            { course: 'ECE 4900', credits: 3, status: 'planned' },
            { course: 'ECE 4901', credits: 3, status: 'planned' },
            { course: 'MATH 1172', credits: 5, status: 'ap' },
            { course: 'MATH 2153', credits: 4, status: 'ap' },
            { course: 'PHYSICS 1250', credits: 5, status: 'ap' },
            { course: 'PHYSICS 1251', credits: 5, status: 'ap' },
        ]
    },
    {
        name: 'Physics',
        fullName: 'Physics (BS)',
        color: '#60A5FA',
        totalCredits: 121,
        required: [
            { course: 'PHYSICS 1250', credits: 5, status: 'ap' },
            { course: 'PHYSICS 1251', credits: 5, status: 'ap' },
            { course: 'PHYSICS 1270', credits: 2, status: 'planned' },
            { course: 'PHYSICS 2300', credits: 3, status: 'planned' },
            { course: 'PHYSICS 2301', credits: 3, status: 'planned' },
            { course: 'PHYSICS 3700', credits: 3, status: 'planned' },
            { course: 'PHYSICS 5500', credits: 3, status: 'planned' },
            { course: 'PHYSICS 5400H', credits: 3, status: 'planned' },
            { course: 'PHYSICS 5401H', credits: 3, status: 'planned' },
            { course: 'PHYSICS 5600', credits: 3, status: 'planned' },
            { course: 'LATIN 1101', credits: 3, status: 'planned' },
            { course: 'LATIN 1102', credits: 3, status: 'planned' },
            { course: 'LATIN 2101', credits: 3, status: 'planned' },
        ]
    },
    {
        name: 'Math',
        fullName: 'Math Applied-Physics (BS)',
        color: '#34D399',
        totalCredits: 121,
        required: [
            { course: 'MATH 1172', credits: 5, status: 'ap' },
            { course: 'MATH 2153', credits: 4, status: 'ap' },
            { course: 'MATH 2255', credits: 3, status: 'planned' },
            { course: 'MATH 2568', credits: 3, status: 'planned' },
            { course: 'MATH 3345', credits: 3, status: 'planned' },
            { course: 'MATH 3607', credits: 3, status: 'planned' },
            { course: 'MATH 4530', credits: 3, status: 'planned' },
            { course: 'MATH 4547', credits: 3, status: 'planned' },
            { course: 'MATH 4548', credits: 3, status: 'planned' },
            { course: 'MATH 4552', credits: 3, status: 'planned' },
            { course: 'MATH 4557', credits: 3, status: 'planned' },
        ]
    }
];

const STATUS_COLORS = {
    complete: '#34D399',
    'in-progress': '#60A5FA',
    planned: 'rgba(255,255,255,0.15)',
    ap: '#FBBF24',
};
const STATUS_LABELS = {
    complete: '✓ Done',
    'in-progress': '◔ In Progress',
    planned: '○ Planned',
    ap: '★ AP/Transfer',
};

export default {
    id: 'degree-progress',
    title: 'Degree Progress',
    icon: '🎓',
    defaultSize: { w: 460, h: 440 },
    minSize: { w: 340, h: 300 },

    _container: null,
    _degrees: [],
    _activeDegree: 0,
    _gpa: { total: 0, points: 0, credits: 0 },
    _view: 'overview',   // overview | courses

    init(container) {
        this._container = container;
        // Load saved statuses
        this._degrees = JSON.parse(JSON.stringify(DEGREES));
        const saved = Storage.get('degree-statuses');
        if (saved) {
            for (const deg of this._degrees) {
                for (const course of deg.required) {
                    if (saved[course.course]) course.status = saved[course.course];
                }
            }
        }
        this._gpa = Storage.get('gpa-data') || { total: 0, points: 0, credits: 0 };
        this.render();
    },

    render() {
        if (this._view === 'courses') return this._renderCourses();
        this._renderOverview();
    },

    _renderOverview() {
        const degreeCards = this._degrees.map((deg, i) => {
            const completed = deg.required.filter(c => c.status === 'complete' || c.status === 'ap');
            const creditsEarned = completed.reduce((s, c) => s + c.credits, 0);
            const totalReq = deg.required.reduce((s, c) => s + c.credits, 0);
            const pct = totalReq > 0 ? Math.round((creditsEarned / totalReq) * 100) : 0;

            return `
                <div class="dp-degree-card" data-deg="${i}" style="border-left:3px solid ${deg.color};">
                    <div class="dp-degree-header">
                        <div>
                            <div class="dp-degree-name" style="color:${deg.color}">${deg.name}</div>
                            <div class="dp-degree-full">${deg.fullName}</div>
                        </div>
                        <div class="dp-pct" style="color:${deg.color}">${pct}%</div>
                    </div>
                    <div class="sm-bar-wrap" style="margin:6px 0;">
                        <div class="sm-bar" style="width:${pct}%;background:${deg.color};"></div>
                    </div>
                    <div style="font-size:0.6rem;color:var(--text-tertiary);">${creditsEarned} / ${totalReq} tracked credits</div>
                </div>
            `;
        }).join('');

        // GPA section
        const gpaVal = this._gpa.credits > 0 ? (this._gpa.points / this._gpa.credits).toFixed(2) : '—';

        this._container.innerHTML = `
            <div class="dp-gpa-section">
                <div>
                    <div style="font-size:0.62rem;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.05em;">Cumulative GPA</div>
                    <div style="font-size:1.4rem;font-weight:700;color:var(--text-primary);">${gpaVal}</div>
                </div>
                <button class="cb-btn" id="dp-edit-gpa">Edit GPA</button>
            </div>
            <div style="font-size:0.68rem;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;margin:12px 0 8px;">Degree Progress</div>
            <div class="dp-degrees">${degreeCards}</div>
        `;

        // Bind
        this._container.querySelectorAll('.dp-degree-card').forEach(el => {
            el.addEventListener('click', () => {
                this._activeDegree = parseInt(el.dataset.deg);
                this._view = 'courses';
                this.render();
            });
        });

        this._container.querySelector('#dp-edit-gpa')?.addEventListener('click', () => {
            const pts = prompt('Total quality points:', String(this._gpa.points));
            const creds = prompt('Total credit hours:', String(this._gpa.credits));
            if (pts !== null && creds !== null) {
                this._gpa = { points: parseFloat(pts) || 0, credits: parseFloat(creds) || 0 };
                Storage.set('gpa-data', this._gpa);
                this.render();
            }
        });
    },

    _renderCourses() {
        const deg = this._degrees[this._activeDegree];
        const rows = deg.required.map(c => {
            const statusColor = STATUS_COLORS[c.status] || STATUS_COLORS.planned;
            const statusLabel = STATUS_LABELS[c.status] || '○ Planned';
            return `
                <div class="dp-course-row" data-course="${c.course}">
                    <span class="dp-course-status" style="color:${statusColor};" title="Click to cycle">${statusLabel.charAt(0)}</span>
                    <span class="dp-course-name">${c.course}</span>
                    <span class="dp-course-credits">${c.credits} cr</span>
                    <span class="dp-course-badge" style="color:${statusColor};background:${statusColor}18;">${statusLabel.substring(2)}</span>
                </div>
            `;
        }).join('');

        this._container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <button class="cb-btn" id="dp-back">← Overview</button>
                <span style="font-size:0.72rem;font-weight:600;color:${deg.color};">${deg.name} Courses</span>
            </div>
            <div style="overflow-y:auto;max-height:calc(100% - 50px);">${rows}</div>
        `;

        this._container.querySelector('#dp-back')?.addEventListener('click', () => { this._view = 'overview'; this.render(); });

        // Cycle course status on click
        const cycle = ['planned', 'in-progress', 'complete', 'ap'];
        this._container.querySelectorAll('.dp-course-row').forEach(el => {
            el.addEventListener('click', () => {
                const courseName = el.dataset.course;
                const course = deg.required.find(c => c.course === courseName);
                if (!course) return;
                const idx = cycle.indexOf(course.status);
                course.status = cycle[(idx + 1) % cycle.length];
                // Save
                const saved = Storage.get('degree-statuses') || {};
                saved[courseName] = course.status;
                Storage.set('degree-statuses', saved);
                this.render();
            });
        });
    },

    destroy() {}
};
