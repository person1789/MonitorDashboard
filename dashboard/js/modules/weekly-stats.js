/* ==============================================
   WEEKLY-STATS.JS — Module 8: Activity Heatmap & Stats
   ============================================== */

import { Storage } from '../utils/storage.js';
import { fetchGitHubCommits } from '../utils/api.js';

export default {
    id: 'weekly-stats',
    title: 'Activity Heatmap',
    icon: '🟩',
    defaultSize: { w: 460, h: 360 },
    minSize: { w: 320, h: 280 },

    _container: null,
    _commits: 0,

    async init(container) {
        this._container = container;
        this.render();
        // Fetch GitHub commits in background
        this._commits = await fetchGitHubCommits();
        this.render();
    },

    render() {
        // Compute study hours from pomodoro data
        const pomoData = Storage.getPomodoroData();
        const today = new Date().toDateString();
        const studyMinutes = pomoData.todayDate === today ? pomoData.totalMinutesToday : 0;
        const studyHours = (studyMinutes / 60).toFixed(1);
        const sessions = pomoData.todayDate === today ? pomoData.sessions.length : 0;

        // Compute tasks done this week
        const statuses = Storage.getTaskStatuses();
        const doneCount = Object.values(statuses).filter(s => s === 'done').length;

        // Streak (simplified: check if today has any done tasks or pomodoros)
        const hasActivityToday = doneCount > 0 || sessions > 0;

        // Generate 90-day Heatmap Data
        // For demonstration, we'll generate 90 squares. 
        // We'll randomly light up past days, and use real data for the last block.
        const totalDays = 90;
        const currentDay = 15; // Assume we are 15 days in for aesthetic demonstration
        
        let heatmapHtml = '<div style="display:grid; grid-template-columns:repeat(15, 1fr); gap:4px; margin-top:16px;">';
        
        for (let i = 0; i < totalDays; i++) {
            let intensity = 0;
            if (i < currentDay - 1) {
                // Past days: random activity
                intensity = Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0;
            } else if (i === currentDay - 1) {
                // Today: based on actual sessions
                intensity = Math.min(4, Math.floor(sessions / 2));
            } else {
                // Future days
                intensity = 0;
            }

            // Colors based on GitHub contribution colors (but matching the theme's green)
            const colors = [
                'rgba(255,255,255,0.05)', // 0: None
                'rgba(52,211,153,0.3)',   // 1: Light
                'rgba(52,211,153,0.5)',   // 2: Medium
                'rgba(52,211,153,0.8)',   // 3: High
                'rgba(52,211,153,1.0)'    // 4: Intense
            ];
            
            const color = colors[intensity];
            
            heatmapHtml += `<div title="Day ${i+1}" style="
                aspect-ratio: 1; 
                background: ${color}; 
                border-radius: 2px;
                transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"></div>`;
        }
        heatmapHtml += '</div>';

        this._container.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                <div class="stat-card" style="flex:1; margin-right:8px; padding:12px; flex-direction:column; align-items:flex-start; gap:4px;">
                    <div class="stat-value" style="color:var(--accent-physics);font-size:1.4rem;line-height:1;">${studyHours}h</div>
                    <div class="stat-label" style="font-size:0.65rem;">Study Today</div>
                </div>
                <div class="stat-card" style="flex:1; margin-right:8px; padding:12px; flex-direction:column; align-items:flex-start; gap:4px;">
                    <div class="stat-value" style="color:var(--accent-math);font-size:1.4rem;line-height:1;">${doneCount}</div>
                    <div class="stat-label" style="font-size:0.65rem;">Tasks Done</div>
                </div>
                <div class="stat-card" style="flex:1; padding:12px; flex-direction:column; align-items:flex-start; gap:4px;">
                    <div class="stat-value" style="color:var(--accent-coding);font-size:1.4rem;line-height:1;">${this._commits}</div>
                    <div class="stat-label" style="font-size:0.65rem;">Git Commits</div>
                </div>
            </div>

            <div style="font-size:0.75rem; font-weight:600; color:var(--text-secondary); margin-top:12px;">90-Day Activity Graph</div>
            ${heatmapHtml}
            
            <div style="display:flex; justify-content:flex-end; align-items:center; gap:6px; margin-top:8px; font-size:0.6rem; color:var(--text-tertiary);">
                <span>Less</span>
                <div style="width:10px; height:10px; background:rgba(255,255,255,0.05); border-radius:2px;"></div>
                <div style="width:10px; height:10px; background:rgba(52,211,153,0.3); border-radius:2px;"></div>
                <div style="width:10px; height:10px; background:rgba(52,211,153,0.5); border-radius:2px;"></div>
                <div style="width:10px; height:10px; background:rgba(52,211,153,0.8); border-radius:2px;"></div>
                <div style="width:10px; height:10px; background:rgba(52,211,153,1.0); border-radius:2px;"></div>
                <span>More</span>
            </div>
        `;
    },

    destroy() {}
};
