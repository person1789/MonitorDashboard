/* ==============================================
   FORMULAS.JS — Module 7: Formula Quick-Reference
   Auto-rotate + arrow button scrolling
   ============================================== */

export default {
    id: 'formulas',
    title: 'Formulas',
    icon: '📋',
    defaultSize: { w: 430, h: 330 },
    minSize: { w: 280, h: 200 },

    _container: null,
    _formulas: [],
    _page: 0,
    _perPage: 3,
    _rotateInterval: null,
    _autoRotate: true,

    async init(container) {
        this._container = container;
        try {
            const res = await fetch('data/formulas.json');
            const data = await res.json();
            this._formulas = data.formulas || [];
        } catch {
            this._formulas = [];
        }
        this.render();
        this._startAutoRotate();
    },

    render() {
        const total = this._formulas.length;
        const totalPages = Math.ceil(total / this._perPage);
        const start = this._page * this._perPage;
        const visible = this._formulas.slice(start, start + this._perPage);

        let html = '';
        for (const f of visible) {
            const color = this._subjectColor(f.subject);
            html += `
                <div class="formula-card">
                    <div class="formula-subject" style="color:${color}">${f.subject}</div>
                    <div class="formula-tex" id="formula-${f.id}"></div>
                    <div class="formula-name">${f.name}</div>
                </div>
            `;
        }

        html += `
            <div class="formula-nav">
                <button class="formula-nav-btn" id="formula-prev" title="Previous">◂</button>
                <span class="formula-page-info">${this._page + 1} / ${totalPages || 1}</span>
                <button class="formula-nav-btn" id="formula-next" title="Next">▸</button>
            </div>
        `;

        this._container.innerHTML = html;

        // Render KaTeX
        if (typeof katex !== 'undefined') {
            for (const f of visible) {
                const el = document.getElementById(`formula-${f.id}`);
                if (el) {
                    try {
                        katex.render(f.latex, el, { throwOnError: false, displayMode: true });
                    } catch {
                        el.textContent = f.latex;
                    }
                }
            }
        }

        // Bind nav buttons
        const prevBtn = document.getElementById('formula-prev');
        const nextBtn = document.getElementById('formula-next');
        if (prevBtn) prevBtn.addEventListener('click', () => { this._autoRotate = false; this._stopAutoRotate(); this._prevPage(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { this._autoRotate = false; this._stopAutoRotate(); this._nextPage(); });
    },

    _nextPage() {
        const totalPages = Math.ceil(this._formulas.length / this._perPage);
        this._page = (this._page + 1) % totalPages;
        this.render();
    },

    _prevPage() {
        const totalPages = Math.ceil(this._formulas.length / this._perPage);
        this._page = (this._page - 1 + totalPages) % totalPages;
        this.render();
    },

    _startAutoRotate() {
        this._stopAutoRotate();
        if (this._autoRotate) {
            this._rotateInterval = setInterval(() => {
                if (this._autoRotate) this._nextPage();
            }, 60000); // 60 seconds
        }
    },

    _stopAutoRotate() {
        if (this._rotateInterval) {
            clearInterval(this._rotateInterval);
            this._rotateInterval = null;
        }
    },

    _subjectColor(subject) {
        const map = {
            'Linear Algebra': '#34D399',
            'Calculus': '#34D399',
            'E&M': '#60A5FA',
            'Quantum Mechanics': '#A78BFA',
            'Classical Mechanics': '#60A5FA',
            'Thermodynamics': '#FB923C',
            'Probability': '#2DD4BF',
            'ODEs': '#34D399',
        };
        return map[subject] || '#94A3B8';
    },

    destroy() {
        this._stopAutoRotate();
    }
};
