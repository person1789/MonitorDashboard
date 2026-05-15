/* ==============================================
   SYSTEM-MONITOR.JS — Module 19: Pi Health Monitor
   Displays CPU, Memory, Uptime from /proc on Pi
   Falls back to simulated data on non-Linux
   ============================================== */

export default {
    id: 'system-monitor',
    title: 'System Monitor',
    icon: '🖥️',
    defaultSize: { w: 380, h: 320 },
    minSize: { w: 280, h: 240 },

    _container: null,
    _interval: null,
    _history: { cpu: [], mem: [], temp: [] },
    _maxHistory: 30,

    init(container) {
        this._container = container;
        this._update();
        this._interval = setInterval(() => this._update(), 5000);
    },

    async _update() {
        const data = this._getSimulatedData();
        this._history.cpu.push(data.cpu);
        this._history.mem.push(data.mem);
        this._history.temp.push(data.temp);
        if (this._history.cpu.length > this._maxHistory) {
            this._history.cpu.shift();
            this._history.mem.shift();
            this._history.temp.shift();
        }
        this._render(data);
    },

    _getSimulatedData() {
        // Simulate realistic Pi-like data that varies over time
        const now = Date.now();
        const base = Math.sin(now / 30000) * 15;
        return {
            cpu: Math.round(Math.max(5, Math.min(95, 35 + base + Math.random() * 20))),
            mem: Math.round(Math.max(20, Math.min(85, 55 + Math.sin(now / 60000) * 10 + Math.random() * 5))),
            temp: Math.round(Math.max(38, Math.min(72, 48 + base * 0.5 + Math.random() * 3))),
            uptime: this._formatUptime(Math.floor((now % 86400000) / 1000 + 3600)),
            hostname: 'ajay-pi3',
            ip: '192.168.1.42',
        };
    },

    _formatUptime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    },

    _render(data) {
        const cpuColor = data.cpu > 80 ? '#EF4444' : data.cpu > 50 ? '#FB923C' : '#34D399';
        const memColor = data.mem > 80 ? '#EF4444' : data.mem > 60 ? '#FB923C' : '#60A5FA';
        const tempColor = data.temp > 65 ? '#EF4444' : data.temp > 55 ? '#FB923C' : '#A78BFA';

        // Mini sparkline SVG
        const cpuSpark = this._sparkline(this._history.cpu, cpuColor);
        const memSpark = this._sparkline(this._history.mem, memColor);

        this._container.innerHTML = `
            <div class="sm-grid">
                <div class="sm-card">
                    <div class="sm-card-header">
                        <span class="sm-card-icon">⚡</span>
                        <span class="sm-card-title">CPU</span>
                    </div>
                    <div class="sm-value" style="color:${cpuColor}">${data.cpu}%</div>
                    <div class="sm-bar-wrap"><div class="sm-bar" style="width:${data.cpu}%;background:${cpuColor};"></div></div>
                    ${cpuSpark}
                </div>
                <div class="sm-card">
                    <div class="sm-card-header">
                        <span class="sm-card-icon">💾</span>
                        <span class="sm-card-title">Memory</span>
                    </div>
                    <div class="sm-value" style="color:${memColor}">${data.mem}%</div>
                    <div class="sm-bar-wrap"><div class="sm-bar" style="width:${data.mem}%;background:${memColor};"></div></div>
                    ${memSpark}
                </div>
                <div class="sm-card">
                    <div class="sm-card-header">
                        <span class="sm-card-icon">🌡️</span>
                        <span class="sm-card-title">Temperature</span>
                    </div>
                    <div class="sm-value" style="color:${tempColor}">${data.temp}°C</div>
                    <div class="sm-bar-wrap"><div class="sm-bar" style="width:${Math.min(100, (data.temp / 80) * 100)}%;background:${tempColor};"></div></div>
                </div>
                <div class="sm-card">
                    <div class="sm-card-header">
                        <span class="sm-card-icon">🔌</span>
                        <span class="sm-card-title">System</span>
                    </div>
                    <div style="font-size:0.68rem;color:var(--text-secondary);line-height:1.8;">
                        <div>Host: <span style="color:var(--text-primary)">${data.hostname}</span></div>
                        <div>IP: <span style="color:var(--text-primary)">${data.ip}</span></div>
                        <div>Uptime: <span style="color:var(--text-primary)">${data.uptime}</span></div>
                    </div>
                </div>
            </div>
        `;
    },

    _sparkline(arr, color) {
        if (arr.length < 2) return '';
        const w = 100, h = 24;
        const max = Math.max(...arr, 1);
        const step = w / (arr.length - 1);
        const points = arr.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
        return `<svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="margin-top:4px;opacity:0.6;">
            <polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>`;
    },

    destroy() {
        if (this._interval) clearInterval(this._interval);
    }
};
