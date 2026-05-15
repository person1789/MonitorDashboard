/* ==============================================
   SCRATCHPAD.JS — Module 11: Quick Notes
   ============================================== */

export default {
    id: 'scratchpad',
    title: 'Scratchpad',
    icon: '📝',
    defaultSize: { w: 350, h: 400 },
    minSize: { w: 150, h: 150 },

    _container: null,

    init(container) {
        this._container = container;
        this._container.style.display = 'flex';
        this._container.style.flexDirection = 'column';
        this.render();
    },

    render() {
        const savedText = localStorage.getItem('dashboard_scratchpad') || '';

        this._container.innerHTML = `
            <textarea id="scratchpad-input" placeholder="Jot down notes, equations, or tasks..." spellcheck="false" style="
                flex: 1;
                width: 100%;
                background: transparent;
                border: none;
                color: var(--text-primary);
                font-family: inherit;
                font-size: 0.85rem;
                resize: none;
                outline: none;
                line-height: 1.5;
            ">${savedText}</textarea>
        `;

        const input = document.getElementById('scratchpad-input');
        if (input) {
            input.addEventListener('input', (e) => {
                localStorage.setItem('dashboard_scratchpad', e.target.value);
            });
        }
    },

    destroy() {}
};
