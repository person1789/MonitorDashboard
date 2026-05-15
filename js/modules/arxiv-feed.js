/* ==============================================
   ARXIV-FEED.JS — Module 17: ArXiv Research Feed
   Live preprint feed for physics, math, ECE
   Uses CORS proxy since ArXiv blocks browser fetch
   ============================================== */

const CATEGORIES = [
    { code: 'quant-ph',   label: 'Quantum Physics',    color: '#A78BFA' },
    { code: 'cond-mat',   label: 'Condensed Matter',    color: '#60A5FA' },
    { code: 'math-ph',    label: 'Math Physics',        color: '#34D399' },
    { code: 'eess.SP',    label: 'Signal Processing',   color: '#F472B6' },
    { code: 'physics.app-ph', label: 'Applied Physics', color: '#FB923C' },
];

// ArXiv RSS feeds work through CORS proxies
const CORS_PROXIES = [
    { url: 'https://api.allorigins.win/get?url=', type: 'json' },
    { url: 'https://api.codetabs.com/v1/proxy?quest=', type: 'raw' },
    { url: 'https://corsproxy.io/?', type: 'raw' }
];
const ARXIV_API = 'https://export.arxiv.org/api/query';
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

export default {
    id: 'arxiv-feed',
    title: 'ArXiv Feed',
    icon: '📄',
    defaultSize: { w: 460, h: 420 },
    minSize: { w: 340, h: 300 },

    _container: null,
    _category: 'quant-ph',
    _papers: [],
    _loading: false,
    _error: '',

    init(container) {
        this._container = container;
        this._loadCached();
        this.render();
        if (this._papers.length === 0) this._fetchPapers();
    },

    _loadCached() {
        try {
            const raw = localStorage.getItem('arxiv_cache_' + this._category);
            if (raw) {
                const { ts, data } = JSON.parse(raw);
                if (Date.now() - ts < CACHE_TTL) {
                    this._papers = data;
                }
            }
        } catch {}
    },

    async _fetchPapers() {
        this._loading = true;
        this._error = '';
        this.render();

        const query = encodeURIComponent(`${ARXIV_API}?search_query=cat:${this._category}&sortBy=submittedDate&sortOrder=descending&max_results=15`);

        let success = false;
        for (const proxy of CORS_PROXIES) {
            try {
                const url = proxy.url + query;
                const resp = await fetch(url);
                if (!resp.ok) continue;
                
                let text = '';
                if (proxy.type === 'json') {
                    const json = await resp.json();
                    text = json.contents;
                } else {
                    text = await resp.text();
                }

                const parsed = this._parseAtom(text);
                if (parsed.length > 0) {
                    this._papers = parsed;
                    localStorage.setItem('arxiv_cache_' + this._category, JSON.stringify({ ts: Date.now(), data: this._papers }));
                    success = true;
                    break;
                }
            } catch (err) {
                console.warn('ArXiv proxy failed:', proxy.url, err.message);
            }
        }

        // Fallback: try direct fetch (works in Electron/kiosk)
        if (!success) {
            try {
                const resp = await fetch(`${ARXIV_API}?search_query=cat:${this._category}&sortBy=submittedDate&sortOrder=descending&max_results=15`);
                const text = await resp.text();
                const parsed = this._parseAtom(text);
                if (parsed.length > 0) {
                    this._papers = parsed;
                    localStorage.setItem('arxiv_cache_' + this._category, JSON.stringify({ ts: Date.now(), data: this._papers }));
                    success = true;
                }
            } catch {}
        }

        if (!success && this._papers.length === 0) {
            this._error = 'Could not reach ArXiv. Check your connection or try again.';
        }

        this._loading = false;
        this.render();
    },

    _parseAtom(xml) {
        if (!xml || xml.length < 100) return [];
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xml, 'text/xml');
            if (doc.querySelector('parsererror')) return [];
            const entries = doc.querySelectorAll('entry');
            const papers = [];
            entries.forEach(entry => {
                const title = entry.querySelector('title')?.textContent?.trim().replace(/\n/g, ' ') || '';
                const summary = entry.querySelector('summary')?.textContent?.trim().replace(/\n/g, ' ') || '';
                const link = entry.querySelector('id')?.textContent?.trim() || '';
                const published = entry.querySelector('published')?.textContent?.trim() || '';
                const authors = [];
                entry.querySelectorAll('author name').forEach(n => authors.push(n.textContent.trim()));
                if (title) {
                    papers.push({
                        title,
                        summary: summary.substring(0, 200) + (summary.length > 200 ? '...' : ''),
                        link,
                        published: published.substring(0, 10),
                        authors: authors.slice(0, 3)
                    });
                }
            });
            return papers;
        } catch { return []; }
    },

    render() {
        const catSelector = CATEGORIES.map(c =>
            `<option value="${c.code}" ${c.code === this._category ? 'selected' : ''}>${c.label}</option>`
        ).join('');

        let content;
        if (this._loading) {
            content = '<div style="text-align:center;padding:30px;color:var(--text-tertiary);">Fetching latest papers from ArXiv...</div>';
        } else if (this._error) {
            content = `<div style="text-align:center;padding:30px;color:var(--text-tertiary);">
                <div style="margin-bottom:8px;">${this._error}</div>
                <button class="cb-btn cb-btn--primary" id="arxiv-retry">Retry</button>
            </div>`;
        } else if (this._papers.length > 0) {
            content = this._papers.map(p => `
                <a href="${p.link}" target="_blank" class="arxiv-paper" style="text-decoration:none;display:block;">
                    <div class="arxiv-title">${p.title}</div>
                    <div class="arxiv-authors">${p.authors.join(', ')}${p.authors.length >= 3 ? ' et al.' : ''}</div>
                    <div class="arxiv-abstract">${p.summary}</div>
                    <div class="arxiv-date">${p.published}</div>
                </a>
            `).join('');
        } else {
            content = '<div style="text-align:center;padding:30px;color:var(--text-tertiary);">No papers found. Try another category.</div>';
        }

        this._container.innerHTML = `
            <div style="display:flex;gap:6px;margin-bottom:10px;align-items:center;">
                <select id="arxiv-cat" class="cb-select" style="max-width:none;flex:1;">${catSelector}</select>
                <button class="cb-btn cb-btn--primary" id="arxiv-refresh">↻ Refresh</button>
            </div>
            <div style="overflow-y:auto;max-height:calc(100% - 50px);">
                ${content}
            </div>
        `;

        this._container.querySelector('#arxiv-cat')?.addEventListener('change', e => {
            this._category = e.target.value;
            this._papers = [];
            this._error = '';
            this._loadCached();
            if (this._papers.length === 0) this._fetchPapers();
            else this.render();
        });
        this._container.querySelector('#arxiv-refresh')?.addEventListener('click', () => {
            localStorage.removeItem('arxiv_cache_' + this._category);
            this._papers = [];
            this._error = '';
            this._fetchPapers();
        });
        this._container.querySelector('#arxiv-retry')?.addEventListener('click', () => {
            this._papers = [];
            this._error = '';
            this._fetchPapers();
        });
    },

    destroy() {}
};
