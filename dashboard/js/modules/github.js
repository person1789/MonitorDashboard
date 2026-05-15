/* ==============================================
   GITHUB.JS — Module 10: GitHub Dashboard
   ============================================== */

export default {
    id: 'github',
    title: 'GitHub',
    icon: '🐙',
    defaultSize: { w: 600, h: 400 },
    minSize: { w: 400, h: 300 },

    _container: null,

    init(container) {
        this._container = container;
        this._container.style.padding = '0'; // Remove padding for full iframe
        this.render();
    },

    render() {
        // Note: GitHub may block iframe embedding via X-Frame-Options. 
        // We include a fallback link just in case.
        this._container.innerHTML = `
            <div style="position: absolute; top: 8px; right: 8px; z-index: 10;">
                <a href="https://github.com/dashboard" target="_blank" style="background:var(--glass-bg);color:var(--text-secondary);padding:4px 8px;border-radius:4px;text-decoration:none;font-size:0.7rem;border:1px solid var(--glass-border);">Open in New Tab ↗</a>
            </div>
            <iframe src="https://github.com/dashboard" style="width:100%;height:100%;border:none;border-radius:inherit;" title="GitHub Dashboard"></iframe>
        `;
    },

    destroy() {}
};
