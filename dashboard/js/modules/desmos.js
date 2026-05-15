/* ==============================================
   DESMOS.JS — Module 13: Desmos Calculator
   Fixed: Use non-embed URL so equation panel is visible
   ============================================== */

export default {
    id: 'desmos',
    title: 'Graphing Calculator',
    icon: '📈',
    defaultSize: { w: 600, h: 450 },
    minSize: { w: 400, h: 300 },

    _container: null,

    init(container) {
        this._container = container;
        this._container.style.padding = '0';
        this.render();
    },

    render() {
        // Use the full calculator URL (not ?embed) so the equation sidebar is visible
        this._container.innerHTML = `
            <iframe
                src="https://www.desmos.com/calculator"
                style="width:100%;height:100%;border:none;border-radius:inherit;"
                title="Desmos Graphing Calculator"
                allow="clipboard-read; clipboard-write"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            ></iframe>
        `;
    },

    destroy() {}
};
