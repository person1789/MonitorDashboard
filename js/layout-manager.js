/* ==============================================
   LAYOUT-MANAGER.JS — Drag, Resize, Snap, Persist
   ============================================== */

import { Storage } from './utils/storage.js';

const GRID_SIZE = 10;          // Snap grid in px
const MIN_W = 200;
const MIN_H = 120;
const CANVAS_PAD = 16;         // padding inside dashboard

// All module default positions (everything hidden by default in raw default)
const ALL_MODULES_HIDDEN = {
    'clock-weather':    { x: 0,   y: 0,   w: 460, h: 165, visible: false },
    'ninety-day':       { x: 0,   y: 175, w: 460, h: 470, visible: false },
    'schedule':         { x: 470, y: 0,   w: 470, h: 380, visible: false },
    'pomodoro':         { x: 470, y: 390, w: 470, h: 255, visible: false },
    'formulas':         { x: 950, y: 0,   w: 430, h: 330, visible: false },
    'latin-wotd':       { x: 950, y: 340, w: 430, h: 305, visible: false },
    'projects':         { x: 1390,y: 0,   w: 490, h: 330, visible: false },
    'research':         { x: 1390,y: 340, w: 490, h: 305, visible: false },
    'weekly-stats':     { x: 0,   y: 655, w: 460, h: 310, visible: false },
    'github':           { x: 0,   y: 0,   w: 700, h: 500, visible: false },
    'scratchpad':       { x: 0,   y: 0,   w: 480, h: 400, visible: false },
    'launchpad':        { x: 0,   y: 0,   w: 460, h: 320, visible: false },
    'desmos':           { x: 0,   y: 0,   w: 600, h: 450, visible: false },
    'course-builder':   { x: 0,   y: 0,   w: 700, h: 520, visible: false },
    'task-builder':     { x: 0,   y: 0,   w: 480, h: 460, visible: false },
    'flashcards':       { x: 0,   y: 0,   w: 420, h: 380, visible: false },
    'arxiv-feed':       { x: 0,   y: 0,   w: 460, h: 420, visible: false },
    'deep-work':        { x: 0,   y: 0,   w: 480, h: 400, visible: false },
    'system-monitor':   { x: 0,   y: 0,   w: 380, h: 320, visible: false },
    'circuit-sim':      { x: 0,   y: 0,   w: 650, h: 480, visible: false },
    'degree-progress':  { x: 0,   y: 0,   w: 460, h: 440, visible: false },
};

function makeLayout(overrides) {
    const modules = JSON.parse(JSON.stringify(ALL_MODULES_HIDDEN));
    for (const [id, props] of Object.entries(overrides)) {
        Object.assign(modules[id], props, { visible: true });
    }
    return { version: 1, modules };
}

// Default layout for 1920×1080
const DEFAULT_LAYOUT = makeLayout({
    'clock-weather':  { x: 0,   y: 0,   w: 460,  h: 165 },
    'ninety-day':     { x: 0,   y: 175, w: 460,  h: 470 },
    'schedule':       { x: 470, y: 0,   w: 470,  h: 380 },
    'pomodoro':       { x: 470, y: 390, w: 470,  h: 255 },
    'formulas':       { x: 950, y: 0,   w: 430,  h: 330 },
    'latin-wotd':     { x: 950, y: 340, w: 430,  h: 305 },
});

// Named preset layouts
const PRESET_LAYOUTS = {
    'Study Mode': makeLayout({
        'clock-weather':  { x: 0,   y: 0,   w: 400,  h: 165 },
        'pomodoro':       { x: 0,   y: 175, w: 400,  h: 260 },
        'deep-work':      { x: 0,   y: 445, w: 400,  h: 390 },
        'ninety-day':     { x: 410, y: 0,   w: 480,  h: 500 },
        'flashcards':     { x: 410, y: 510, w: 480,  h: 325 },
        'formulas':       { x: 900, y: 0,   w: 430,  h: 330 },
        'scratchpad':     { x: 900, y: 340, w: 430,  h: 495 },
    }),
    'Circuit Lab': makeLayout({
        'circuit-sim':    { x: 0,   y: 0,   w: 960,  h: 700 },
        'clock-weather':  { x: 970, y: 0,   w: 400,  h: 165 },
        'formulas':       { x: 970, y: 175, w: 400,  h: 330 },
        'scratchpad':     { x: 970, y: 515, w: 400,  h: 320 },
    }),
    'Focus Timer': makeLayout({
        'pomodoro':       { x: 380, y: 150, w: 550,  h: 340 },
        'clock-weather':  { x: 380, y: 500, w: 550,  h: 180 },
        'deep-work':      { x: 940, y: 150, w: 480,  h: 530 },
    }),
    'Research': makeLayout({
        'arxiv-feed':     { x: 0,   y: 0,   w: 480,  h: 520 },
        'desmos':         { x: 490, y: 0,   w: 580,  h: 520 },
        'scratchpad':     { x: 1080,y: 0,   w: 400,  h: 520 },
        'flashcards':     { x: 0,   y: 530, w: 480,  h: 320 },
        'formulas':       { x: 490, y: 530, w: 490,  h: 320 },
        'system-monitor': { x: 1080,y: 530, w: 400,  h: 320 },
    }),
    'Overview': makeLayout({
        'clock-weather':  { x: 0,   y: 0,   w: 380,  h: 165 },
        'degree-progress':{ x: 0,   y: 175, w: 380,  h: 400 },
        'weekly-stats':   { x: 0,   y: 585, w: 380,  h: 280 },
        'schedule':       { x: 390, y: 0,   w: 480,  h: 380 },
        'ninety-day':     { x: 390, y: 390, w: 480,  h: 475 },
        'deep-work':      { x: 880, y: 0,   w: 480,  h: 380 },
        'system-monitor': { x: 880, y: 390, w: 380,  h: 280 },
        'course-builder': { x: 880, y: 680, w: 500,  h: 185 },
    }),
};

export class LayoutManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.panels = new Map();      // moduleId → DOM element
        this.layout = null;
        this.layoutMode = false;
        this.dragging = null;
        this.resizing = null;
        this.backupLayout = null;     // for cancel

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
    }

    /* ---- Initialization ---- */

    loadLayout() {
        this.layout = Storage.getLayout() || JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
        return this.layout;
    }

    getModuleLayout(id) {
        return this.layout.modules[id] || null;
    }

    isModuleVisible(id) {
        const m = this.layout.modules[id];
        return m ? m.visible : false;
    }

    /* ---- Register Panels ---- */

    registerPanel(id, panelEl) {
        this.panels.set(id, panelEl);
        this._applyPosition(id);
    }

    _applyPosition(id) {
        const el = this.panels.get(id);
        const m = this.layout.modules[id];
        if (!el || !m) return;

        el.style.left   = m.x + 'px';
        el.style.top    = m.y + 'px';
        el.style.width  = m.w + 'px';
        el.style.height = m.h + 'px';
    }

    applyAllPositions() {
        for (const id of this.panels.keys()) {
            this._applyPosition(id);
        }
    }

    /* ---- Layout Mode ---- */

    enterLayoutMode() {
        this.layoutMode = true;
        this.backupLayout = JSON.parse(JSON.stringify(this.layout));
        document.body.classList.add('layout-active');

        const overlay = document.getElementById('layout-overlay');
        if (overlay) { overlay.style.display = ''; overlay.classList.add('active'); }

        // Show size info on panels
        this.panels.forEach((el, id) => {
            const m = this.layout.modules[id];
            if (!m) return;
            let info = el.querySelector('.module-size-info');
            if (!info) {
                info = document.createElement('div');
                info.className = 'module-size-info';
                el.appendChild(info);
            }
            info.textContent = `${m.w}×${m.h}`;
        });

        // Bind global mouse events for drag/resize
        document.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('mouseup', this._onMouseUp);
    }

    exitLayoutMode(save) {
        if (save) {
            Storage.saveLayout(this.layout);
        } else if (this.backupLayout) {
            this.layout = this.backupLayout;
            this.applyAllPositions();
        }

        this.layoutMode = false;
        this.backupLayout = null;
        document.body.classList.remove('layout-active');

        const overlay = document.getElementById('layout-overlay');
        if (overlay) { overlay.classList.remove('active'); setTimeout(() => overlay.style.display = 'none', 400); }

        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('mouseup', this._onMouseUp);
    }

    resetLayout() {
        this.layout = JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
        this.applyAllPositions();
        // Update size info
        this.panels.forEach((el, id) => {
            const info = el.querySelector('.module-size-info');
            const m = this.layout.modules[id];
            if (info && m) info.textContent = `${m.w}×${m.h}`;
        });
    }

    /* ---- Preset Layouts ---- */

    /* ---- Preset Layouts ---- */

    _getCustomPresets() {
        return Storage.get('custom-presets') || {};
    }

    getPresetNames() {
        const custom = this._getCustomPresets();
        return {
            default: Object.keys(PRESET_LAYOUTS),
            custom: Object.keys(custom)
        };
    }

    applyPreset(name, isCustom = false) {
        let preset;
        if (isCustom) {
            preset = this._getCustomPresets()[name];
        } else {
            preset = PRESET_LAYOUTS[name];
        }
        
        if (!preset) return;
        this.layout = JSON.parse(JSON.stringify(preset));
        this.applyAllPositions();
        this.panels.forEach((el, id) => {
            const info = el.querySelector('.module-size-info');
            const m = this.layout.modules[id];
            if (info && m) info.textContent = `${m.w}×${m.h}`;
        });
    }

    saveAsPreset(name) {
        const custom = this._getCustomPresets();
        custom[name] = JSON.parse(JSON.stringify(this.layout));
        Storage.set('custom-presets', custom);
    }

    deletePreset(name) {
        const custom = this._getCustomPresets();
        delete custom[name];
        Storage.set('custom-presets', custom);
    }

    /* ---- Toggle Module Visibility ---- */

    toggleModule(id, visible) {
        if (!this.layout.modules[id]) return;
        this.layout.modules[id].visible = visible;
    }

    /* ---- Drag ---- */

    startDrag(id, mouseX, mouseY) {
        if (!this.layoutMode) return;
        const el = this.panels.get(id);
        const m = this.layout.modules[id];
        if (!el || !m) return;

        el.classList.add('dragging');
        this.dragging = {
            id,
            startX: mouseX,
            startY: mouseY,
            origX: m.x,
            origY: m.y
        };
    }

    /* ---- Resize ---- */

    startResize(id, direction, mouseX, mouseY) {
        if (!this.layoutMode) return;
        const el = this.panels.get(id);
        const m = this.layout.modules[id];
        if (!el || !m) return;

        el.classList.add('resizing');
        this.resizing = {
            id, direction,
            startX: mouseX,
            startY: mouseY,
            origX: m.x, origY: m.y,
            origW: m.w, origH: m.h
        };
    }

    /* ---- Mouse Handling ---- */

    _onMouseMove(e) {
        if (this.dragging) {
            const d = this.dragging;
            const m = this.layout.modules[d.id];
            const el = this.panels.get(d.id);

            let nx = d.origX + (e.clientX - d.startX);
            let ny = d.origY + (e.clientY - d.startY);

            // Snap to grid
            nx = Math.round(nx / GRID_SIZE) * GRID_SIZE;
            ny = Math.round(ny / GRID_SIZE) * GRID_SIZE;

            // Clamp to canvas
            const canvasRect = this.canvas.getBoundingClientRect();
            nx = Math.max(0, Math.min(nx, canvasRect.width - m.w));
            ny = Math.max(0, Math.min(ny, canvasRect.height - m.h));

            m.x = nx; m.y = ny;
            el.style.left = nx + 'px';
            el.style.top  = ny + 'px';
        }

        if (this.resizing) {
            const r = this.resizing;
            const m = this.layout.modules[r.id];
            const el = this.panels.get(r.id);
            const dx = e.clientX - r.startX;
            const dy = e.clientY - r.startY;

            if (r.direction.includes('e')) {
                m.w = Math.max(MIN_W, Math.round((r.origW + dx) / GRID_SIZE) * GRID_SIZE);
            }
            if (r.direction.includes('s')) {
                m.h = Math.max(MIN_H, Math.round((r.origH + dy) / GRID_SIZE) * GRID_SIZE);
            }
            if (r.direction.includes('w')) {
                const nw = Math.max(MIN_W, Math.round((r.origW - dx) / GRID_SIZE) * GRID_SIZE);
                m.x = r.origX + (r.origW - nw);
                m.w = nw;
                el.style.left = m.x + 'px';
            }
            if (r.direction.includes('n')) {
                const nh = Math.max(MIN_H, Math.round((r.origH - dy) / GRID_SIZE) * GRID_SIZE);
                m.y = r.origY + (r.origH - nh);
                m.h = nh;
                el.style.top = m.y + 'px';
            }

            el.style.width  = m.w + 'px';
            el.style.height = m.h + 'px';

            // Update size info
            const info = el.querySelector('.module-size-info');
            if (info) info.textContent = `${m.w}×${m.h}`;
        }
    }

    _onMouseUp() {
        if (this.dragging) {
            const el = this.panels.get(this.dragging.id);
            if (el) el.classList.remove('dragging');
            this.dragging = null;
        }
        if (this.resizing) {
            const el = this.panels.get(this.resizing.id);
            if (el) el.classList.remove('resizing');
            this.resizing = null;
        }
    }
}
