/* ==============================================
   CIRCUIT-SIM.JS — Module 20: Circuit Simulator
   Embeds Falstad Circuit Simulator
   ============================================== */

export default {
    id: 'circuit-sim',
    title: 'Circuit Simulator',
    icon: '⚡',
    defaultSize: { w: 650, h: 480 },
    minSize: { w: 450, h: 350 },

    _container: null,

    init(container) {
        this._container = container;
        this._container.style.padding = '0';
        this.render();
    },

    render() {
        this._container.innerHTML = `
            <iframe
                src="https://www.falstad.com/circuit/circuitjs.html"
                style="width:100%;height:100%;border:none;border-radius:inherit;"
                title="Falstad Circuit Simulator"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                allow="clipboard-read; clipboard-write"
            ></iframe>
        `;
    },

    destroy() {}
};
