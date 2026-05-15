/* ==============================================
   STORAGE.JS — Persistence Layer
   localStorage + JSON file helpers
   ============================================== */

const STORAGE_PREFIX = 'ajay-dash-';

export const Storage = {
    /* ---- Layout ---- */
    getLayout() {
        try {
            const raw = localStorage.getItem(STORAGE_PREFIX + 'layout');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    },

    saveLayout(layout) {
        try {
            localStorage.setItem(STORAGE_PREFIX + 'layout', JSON.stringify(layout));
            return true;
        } catch { return false; }
    },

    /* ---- Task Statuses ---- */
    getTaskStatuses() {
        try {
            const raw = localStorage.getItem(STORAGE_PREFIX + 'task-statuses');
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    },

    saveTaskStatus(taskId, status) {
        const statuses = this.getTaskStatuses();
        statuses[taskId] = status;
        try {
            localStorage.setItem(STORAGE_PREFIX + 'task-statuses', JSON.stringify(statuses));
        } catch { /* ignore */ }
    },

    /* ---- Pomodoro Data ---- */
    getPomodoroData() {
        try {
            const raw = localStorage.getItem(STORAGE_PREFIX + 'pomodoro');
            return raw ? JSON.parse(raw) : { sessions: [], totalMinutesToday: 0, todayDate: '' };
        } catch { return { sessions: [], totalMinutesToday: 0, todayDate: '' }; }
    },

    savePomodoroData(data) {
        try {
            localStorage.setItem(STORAGE_PREFIX + 'pomodoro', JSON.stringify(data));
        } catch { /* ignore */ }
    },

    /* ---- Project Statuses ---- */
    getProjectStatuses() {
        try {
            const raw = localStorage.getItem(STORAGE_PREFIX + 'project-statuses');
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    },

    saveProjectStatus(projectId, status) {
        const statuses = this.getProjectStatuses();
        statuses[projectId] = status;
        try {
            localStorage.setItem(STORAGE_PREFIX + 'project-statuses', JSON.stringify(statuses));
        } catch { /* ignore */ }
    },

    /* ---- Weather Cache ---- */
    getCachedWeather() {
        try {
            const raw = localStorage.getItem(STORAGE_PREFIX + 'weather');
            if (!raw) return null;
            const data = JSON.parse(raw);
            // Cache for 30 minutes
            if (Date.now() - data.timestamp > 30 * 60 * 1000) return null;
            return data;
        } catch { return null; }
    },

    cacheWeather(data) {
        try {
            localStorage.setItem(STORAGE_PREFIX + 'weather', JSON.stringify({
                ...data,
                timestamp: Date.now()
            }));
        } catch { /* ignore */ }
    },

    /* ---- Latin WOTD Cache ---- */
    getCachedLatin() {
        try {
            const raw = localStorage.getItem(STORAGE_PREFIX + 'latin');
            if (!raw) return null;
            const data = JSON.parse(raw);
            // Cache for 24 hours
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) return null;
            return data;
        } catch { return null; }
    },

    cacheLatin(data) {
        try {
            localStorage.setItem(STORAGE_PREFIX + 'latin', JSON.stringify({
                ...data,
                timestamp: Date.now()
            }));
        } catch { /* ignore */ }
    },

    /* ---- Welcome Seen ---- */
    hasSeenWelcome() {
        return localStorage.getItem(STORAGE_PREFIX + 'welcome-seen') === 'true';
    },

    markWelcomeSeen() {
        localStorage.setItem(STORAGE_PREFIX + 'welcome-seen', 'true');
    },

    /* ---- Generic ---- */
    get(key) {
        try {
            const raw = localStorage.getItem(STORAGE_PREFIX + key);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    },

    set(key, value) {
        try {
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        } catch { /* ignore */ }
    }
};
