/* ==============================================
   RESEARCH.JS — Module 6: Research Tracker
   ============================================== */

export default {
    id: 'research',
    title: 'Research',
    icon: '🔬',
    defaultSize: { w: 490, h: 305 },
    minSize: { w: 300, h: 200 },

    _container: null,
    _data: null,

    async init(container) {
        this._container = container;
        try {
            const res = await fetch('data/research.json');
            this._data = await res.json();
        } catch {
            this._data = { professors: [], skills: [], reading: [] };
        }
        this.render();
    },

    render() {
        const d = this._data;
        let html = '';

        // Professors
        if (d.professors && d.professors.length > 0) {
            html += `<div class="research-section">
                <div class="research-section-title">Professor Outreach</div>`;
            for (const p of d.professors) {
                const statusColor = this._statusColor(p.status);
                html += `
                    <div class="professor-row">
                        <span class="professor-name">${p.name}</span>
                        <span style="font-size:0.65rem;color:var(--text-tertiary);">${p.lab || ''}</span>
                        <span class="professor-status" style="background:${statusColor}18;color:${statusColor}">${p.status}</span>
                    </div>`;
            }
            html += '</div>';
        }

        // Skills
        if (d.skills && d.skills.length > 0) {
            html += `<div class="research-section">
                <div class="research-section-title">Research Skills</div>`;
            for (const s of d.skills.slice(0, 8)) {
                const pct = s.goal > 0 ? Math.min(100, (s.current / s.goal) * 100) : 0;
                html += `
                    <div class="skill-row">
                        <span class="skill-name">${s.name}</span>
                        <div class="skill-bar">
                            <div class="skill-bar-fill" style="width:${pct}%"></div>
                        </div>
                        <span style="font-size:0.6rem;color:var(--text-tertiary);min-width:30px;text-align:right;">${s.current}/${s.goal}</span>
                    </div>`;
            }
            html += '</div>';
        }

        // Reading
        if (d.reading && d.reading.length > 0) {
            html += `<div class="research-section">
                <div class="research-section-title">Reading List</div>`;
            for (const r of d.reading) {
                const dotClass = r.status === 'Done' ? 'done' : r.status === 'Reading' ? 'wip' : 'todo';
                html += `
                    <div style="display:flex;align-items:center;gap:8px;padding:3px 0;font-size:0.72rem;">
                        <div class="status-dot status-dot--${dotClass}"></div>
                        <span style="color:var(--text-primary);flex:1;">${r.title}</span>
                        <span style="color:var(--text-tertiary);font-size:0.62rem;">${r.status}</span>
                    </div>`;
            }
            html += '</div>';
        }

        this._container.innerHTML = html || '<p style="color:var(--text-tertiary);font-size:0.78rem;">No research data loaded</p>';
    },

    _statusColor(status) {
        const map = {
            'Not Contacted': '#94A3B8',
            'Emailed': '#FBBF24',
            'Responded': '#34D399',
            'Meeting Scheduled': '#60A5FA',
        };
        return map[status] || '#94A3B8';
    },

    destroy() {}
};
