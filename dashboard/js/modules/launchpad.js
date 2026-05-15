/* ==============================================
   LAUNCHPAD.JS — Module 12: Resource Links
   ============================================== */

export default {
    id: 'launchpad',
    title: 'Launchpad',
    icon: '🚀',
    defaultSize: { w: 350, h: 280 },
    minSize: { w: 150, h: 150 },

    _container: null,
    
    _links: [
        { name: 'Canvas', icon: '🎓', url: 'https://canvas.osu.edu', color: '#EF4444' },
        { name: 'Overleaf', icon: '📄', url: 'https://www.overleaf.com', color: '#34D399' },
        { name: 'GitHub', icon: '🐙', url: 'https://github.com', color: '#94A3B8' },
        { name: 'Desmos', icon: '📈', url: 'https://www.desmos.com/calculator', color: '#60A5FA' },
        { name: 'Wolfram', icon: '🐺', url: 'https://www.wolframalpha.com', color: '#F97316' },
        { name: 'LeetCode', icon: '💻', url: 'https://leetcode.com', color: '#FBBF24' }
    ],

    init(container) {
        this._container = container;
        this.render();
    },

    render() {
        let html = '<div class="launchpad-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(110px, 1fr));gap:12px;">';
        
        for (const link of this._links) {
            html += `
                <a href="${link.url}" target="_blank" class="launchpad-btn" style="
                    display:flex; align-items:center; gap:8px;
                    padding: 10px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: var(--r-md);
                    text-decoration: none;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                    box-sizing: border-box;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                " onmouseover="this.style.background='rgba(255,255,255,0.08)';this.style.borderColor='${link.color}50';this.style.color='var(--text-primary)';" onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.borderColor='rgba(255,255,255,0.05)';this.style.color='var(--text-secondary)';">
                    <span style="font-size:1.2rem;">${link.icon}</span>
                    <span style="font-size:0.8rem;font-weight:500;text-overflow:ellipsis;overflow:hidden;">${link.name}</span>
                </a>
            `;
        }
        
        html += '</div>';
        this._container.innerHTML = html;
    },

    destroy() {}
};
