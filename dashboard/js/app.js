/* ==============================================
   APP.JS — Main Entry Point & Module Orchestrator
   ============================================== */

import { LayoutManager } from './layout-manager.js';
import { initWelcome } from './welcome.js';

// Module imports
import clockWeather from './modules/clock-weather.js';
import ninetyDay from './modules/ninety-day.js';
import schedule from './modules/schedule.js';
import pomodoro from './modules/pomodoro.js';
import formulas from './modules/formulas.js';
import latinWotd from './modules/latin-wotd.js';
import projects from './modules/projects.js';
import research from './modules/research.js';
import weeklyStats from './modules/weekly-stats.js';
import github from './modules/github.js';
import scratchpad from './modules/scratchpad.js';
import launchpad from './modules/launchpad.js';
import desmos from './modules/desmos.js';
import courseBuilder from './modules/course-builder.js';
import taskBuilder from './modules/task-builder.js';
import flashcards from './modules/flashcards.js';
import arxivFeed from './modules/arxiv-feed.js';
import deepWork from './modules/deep-work.js';
import systemMonitor from './modules/system-monitor.js';
import circuitSim from './modules/circuit-sim.js';
import degreeProgress from './modules/degree-progress.js';

// ---- Module Registry ----
const MODULE_DEFS = [
    clockWeather, ninetyDay, schedule, pomodoro,
    projects, research, formulas, weeklyStats, latinWotd, github, scratchpad, launchpad, desmos,
    courseBuilder, taskBuilder, flashcards, arxivFeed, deepWork, systemMonitor, circuitSim, degreeProgress
];

const moduleInstances = new Map();
const canvas = document.getElementById('module-canvas');
const layoutMgr = new LayoutManager(canvas);

// ---- Boot Sequence ----
async function boot() {
    // 1. Load layout
    layoutMgr.loadLayout();

    // Ensure all defined modules exist in the layout object
    // (Crucial for modules added after a layout was saved)
    for (const def of MODULE_DEFS) {
        if (!layoutMgr.layout.modules[def.id]) {
            layoutMgr.layout.modules[def.id] = {
                x: window.innerWidth / 2 - def.defaultSize.w / 2 || 100,
                y: window.innerHeight / 2 - def.defaultSize.h / 2 || 100,
                w: def.defaultSize.w,
                h: def.defaultSize.h,
                visible: false
            };
        }
    }

    // 2. Show welcome screen, wait for click
    initWelcome(() => {
        showDashboard();
    });
}

async function showDashboard() {
    const dashboard = document.getElementById('dashboard');
    dashboard.style.display = '';

    // 3. Create visible modules
    for (const def of MODULE_DEFS) {
        if (layoutMgr.isModuleVisible(def.id)) {
            await createModule(def);
        }
    }

    // 4. Wire up layout mode
    wireLayoutMode();

    // 5. Wire up Focus mode (phone sync)
    wireFocusMode();
    connectToServer();
}

// ---- Module Lifecycle ----

async function createModule(def, animate = true) {
    if (moduleInstances.has(def.id)) return;

    // Create panel DOM
    const panel = document.createElement('div');
    panel.className = 'module-panel' + (animate ? ' entering' : '');
    panel.id = `panel-${def.id}`;
    panel.style.animationDelay = `${moduleInstances.size * 0.08}s`;

    // Header
    const header = document.createElement('div');
    header.className = 'module-header';
    header.innerHTML = `
        <span class="module-header-icon">${def.icon}</span>
        <span class="module-header-title">${def.title}</span>
        <div class="module-header-actions">
            <button class="module-header-btn" title="Remove module" data-action="remove">&times;</button>
        </div>
    `;

    // Drag from header
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.module-header-btn')) return;
        layoutMgr.startDrag(def.id, e.clientX, e.clientY);
    });

    // Remove button
    header.querySelector('[data-action="remove"]').addEventListener('click', () => {
        removeModule(def.id);
    });

    // Content
    const content = document.createElement('div');
    content.className = 'module-content';

    // Resize handles
    const handles = ['e', 's', 'se', 'w', 'n'];
    for (const dir of handles) {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-handle--${dir}`;
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            layoutMgr.startResize(def.id, dir, e.clientX, e.clientY);
        });
        panel.appendChild(handle);
    }

    panel.appendChild(header);
    panel.appendChild(content);
    canvas.appendChild(panel);

    // Register with layout manager
    layoutMgr.registerPanel(def.id, panel);

    // Initialize module
    const instance = Object.create(def);
    moduleInstances.set(def.id, instance);
    try {
        await instance.init(content);
    } catch (err) {
        console.error(`Failed to init module ${def.id}:`, err);
        content.innerHTML = `<p style="color:var(--st-skip);font-size:0.78rem;padding:8px;">Module error: ${err.message}</p>`;
    }
}

function removeModule(id) {
    const instance = moduleInstances.get(id);
    if (instance && instance.destroy) instance.destroy();
    moduleInstances.delete(id);

    const panel = document.getElementById(`panel-${id}`);
    if (panel) {
        panel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        panel.style.opacity = '0';
        panel.style.transform = 'scale(0.95)';
        setTimeout(() => panel.remove(), 300);
    }

    layoutMgr.toggleModule(id, false);
}

// ---- Layout Mode ----

function wireLayoutMode() {
    const fabBtn = document.getElementById('btn-layout-mode');
    const saveBtn = document.getElementById('btn-save-layout');
    const cancelBtn = document.getElementById('btn-cancel-layout');
    const resetBtn = document.getElementById('btn-reset-layout');
    const addBtn = document.getElementById('btn-add-module');
    const closeTrayBtn = document.getElementById('btn-close-tray');
    const presetSelect = document.getElementById('btn-preset-layout');
    const savePresetBtn = document.getElementById('btn-save-preset');

    const updatePresetDropdown = () => {
        presetSelect.innerHTML = '<option value="">⚡ Presets</option>';
        const presets = layoutMgr.getPresetNames();
        
        const defOpt = document.createElement('optgroup');
        defOpt.label = 'Default';
        presets.default.forEach(name => {
            const opt = document.createElement('option');
            opt.value = `default:${name}`;
            opt.textContent = name;
            defOpt.appendChild(opt);
        });
        presetSelect.appendChild(defOpt);

        if (presets.custom.length > 0) {
            const custOpt = document.createElement('optgroup');
            custOpt.label = 'Custom';
            presets.custom.forEach(name => {
                const opt = document.createElement('option');
                opt.value = `custom:${name}`;
                opt.textContent = name;
                custOpt.appendChild(opt);
            });
            presetSelect.appendChild(custOpt);
        }
    };

    updatePresetDropdown();

    fabBtn.addEventListener('click', () => {
        layoutMgr.enterLayoutMode();
        fabBtn.style.display = 'none';
    });

    saveBtn.addEventListener('click', () => {
        layoutMgr.exitLayoutMode(true);
        fabBtn.style.display = '';
    });

    cancelBtn.addEventListener('click', () => {
        layoutMgr.exitLayoutMode(false);
        fabBtn.style.display = '';
    });

    resetBtn.addEventListener('click', () => {
        layoutMgr.resetLayout();
        rebuildModules();
    });

    presetSelect.addEventListener('change', () => {
        const val = presetSelect.value;
        if (!val) return;
        const [type, name] = val.split(':');
        layoutMgr.applyPreset(name, type === 'custom');
        rebuildModules();
        presetSelect.value = ''; // Reset dropdown
    });

    savePresetBtn?.addEventListener('click', () => {
        const name = prompt('Enter a name for this layout preset:');
        if (name) {
            layoutMgr.saveAsPreset(name);
            updatePresetDropdown();
        }
    });

    addBtn.addEventListener('click', () => showModuleTray());
    closeTrayBtn.addEventListener('click', () => hideModuleTray());
}

function showModuleTray() {
    const tray = document.getElementById('module-tray');
    const grid = document.getElementById('module-tray-grid');
    tray.style.display = '';

    grid.innerHTML = MODULE_DEFS.map(def => {
        const isVisible = layoutMgr.isModuleVisible(def.id);
        return `
            <div class="module-tray-item ${isVisible ? 'active' : ''}" data-module-id="${def.id}">
                <div class="module-tray-item-icon">${def.icon}</div>
                <div class="module-tray-item-name">${def.title}</div>
                <div class="module-tray-item-status">${isVisible ? 'Visible' : 'Hidden'}</div>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.module-tray-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.moduleId;
            const isVisible = layoutMgr.isModuleVisible(id);

            if (isVisible) {
                removeModule(id);
            } else {
                layoutMgr.toggleModule(id, true);
                const def = MODULE_DEFS.find(d => d.id === id);
                if (def) createModule(def);
            }

            // Refresh tray
            showModuleTray();
        });
    });
}

function hideModuleTray() {
    document.getElementById('module-tray').style.display = 'none';
}

async function rebuildModules() {
    // Destroy all current modules
    for (const [id, instance] of moduleInstances) {
        if (instance.destroy) instance.destroy();
        const panel = document.getElementById(`panel-${id}`);
        if (panel) panel.remove();
    }
    moduleInstances.clear();

    // Recreate visible ones
    for (const def of MODULE_DEFS) {
        if (layoutMgr.isModuleVisible(def.id)) {
            await createModule(def, false);
        }
    }
}

// ---- Focus Mode (Phone Sync via Firebase) ----

const firebaseConfig = {
    apiKey: "AIzaSyASVdJsoEQTajPrXBvZWuNDCyyg5arDQek",
    authDomain: "dashboard-4d62c.firebaseapp.com",
    projectId: "dashboard-4d62c",
    databaseURL: "https://dashboard-4d62c-default-rtdb.firebaseio.com",
    storageBucket: "dashboard-4d62c.firebasestorage.app",
    messagingSenderId: "364307656847",
    appId: "1:364307656847:web:cd61a1ef49101961c640fa",
    measurementId: "G-8DDSN730Z4"
};

// Initialize Firebase
let db = null;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log('[Firebase] Initialized successfully');
} catch (e) {
    console.error('[Firebase] Initialization failed:', e);
}

let focusActive = false;
let selectedDuration = 25;

function wireFocusMode() {
    const focusFab = document.getElementById('btn-focus');
    const popover = document.getElementById('focus-popover');
    const startBtn = document.getElementById('focus-start');
    const subjectSelect = document.getElementById('focus-subject');
    const taskInput = document.getElementById('focus-task');
    const durBtns = document.querySelectorAll('.focus-dur-btn');

    if (!focusFab) return;

    // Duration buttons
    durBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            durBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedDuration = parseInt(btn.dataset.min);
        });
    });

    // Toggle popover
    focusFab.addEventListener('click', () => {
        if (focusActive) {
            endFocusSession();
        } else {
            popover.classList.toggle('visible');
        }
    });

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
        if (!popover.contains(e.target) && !focusFab.contains(e.target)) {
            popover.classList.remove('visible');
        }
    });

    // Start session
    startBtn.addEventListener('click', () => {
        const subject = subjectSelect.value;
        const task = taskInput.value.trim();
        startFocusSession(subject, task, selectedDuration);
        popover.classList.remove('visible');
    });
}

async function startFocusSession(subject, task, minutes) {
    if (!db) return;
    
    const sessionData = {
        active: true,
        subject: subject || 'General',
        task: task || '',
        timerMinutes: minutes || 25,
        timerEnd: Date.now() + (minutes || 25) * 60 * 1000,
        timestamp: Date.now()
    };

    try {
        await db.ref('studySession').set(sessionData);
    } catch (err) {
        console.error('[Focus] Firebase error:', err);
    }
}

async function endFocusSession() {
    if (!db) return;
    try {
        await db.ref('studySession').update({ active: false });
    } catch (err) {
        console.error('[Focus] Firebase error:', err);
    }
}

function initFirebaseSync() {
    if (!db) return;

    db.ref('studySession').on('value', (snapshot) => {
        const data = snapshot.val();
        const focusFab = document.getElementById('btn-focus');
        if (!focusFab) return;

        if (data && data.active) {
            focusActive = true;
            focusFab.classList.add('active');
            focusFab.title = 'End Focus Session';
        } else {
            focusActive = false;
            focusFab.classList.remove('active');
            focusFab.title = 'Start Focus Session';
        }
    });
}

// Re-map start function to use new sync name
function connectToServer() {
    initFirebaseSync();
}

// ---- Start ----
boot();

