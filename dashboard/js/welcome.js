/* ==============================================
   WELCOME.JS — Welcome Screen Controller
   ============================================== */

import { getGreeting, formatDate, getDayOfPlan } from './utils/api.js';

const PLAN_START_DATE = '2026-06-01'; // Adjust to actual start date

const QUOTES = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "The important thing is not to stop questioning.", author: "Albert Einstein" },
    { text: "Somewhere, something incredible is waiting to be known.", author: "Carl Sagan" },
    { text: "Nature uses only the longest threads to weave her patterns.", author: "Richard Feynman" },
    { text: "What I cannot create, I do not understand.", author: "Richard Feynman" },
    { text: "The universe is under no obligation to make sense to you.", author: "Neil deGrasse Tyson" },
    { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "Per aspera ad astra — Through hardships to the stars.", author: "Latin Proverb" },
    { text: "Sapere aude — Dare to know.", author: "Horace" },
    { text: "Dum spiro, spero — While I breathe, I hope.", author: "Cicero" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
    { text: "Ad meliora — Towards better things.", author: "Latin Phrase" },
    { text: "Do not go where the path may lead; go instead where there is no path.", author: "Emerson" },
    { text: "Physics is like sex: sure, it may give some practical results, but that's not why we do it.", author: "Richard Feynman" },
    { text: "The only source of knowledge is experience.", author: "Albert Einstein" },
    { text: "Audentes fortuna iuvat — Fortune favors the bold.", author: "Virgil" },
];

export function initWelcome(onDismiss) {
    const overlay = document.getElementById('welcome-screen');
    const greetingEl = document.getElementById('welcome-greeting');
    const dateEl = document.getElementById('welcome-date');
    const dayBadgeEl = document.getElementById('welcome-day-badge');
    const quoteEl = document.getElementById('welcome-quote');

    if (!overlay) return;

    // Time-based greeting
    const greeting = getGreeting();
    greetingEl.innerHTML = `${greeting}, <span>Ajay</span>`;

    // Date
    dateEl.textContent = formatDate(new Date());

    // Day of plan counter
    const dayNum = getDayOfPlan(PLAN_START_DATE);
    if (dayNum <= 90) {
        const phaseInfo = getPhaseForDay(dayNum);
        dayBadgeEl.innerHTML = `
            <span class="day-num">Day ${dayNum}</span> of 90
            <span style="margin-left:8px;opacity:0.6">·</span>
            <span style="margin-left:8px;font-weight:400">${phaseInfo}</span>
        `;
    } else {
        // After 90-day plan
        dayBadgeEl.innerHTML = `<span>90-Day Plan Complete 🎉</span>`;
    }

    // Random quote (seeded by day)
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000*60*60*24));
    const quote = QUOTES[dayOfYear % QUOTES.length];
    quoteEl.innerHTML = `"${quote.text}"<br><span style="font-style:normal;color:var(--text-tertiary);font-size:0.72rem">— ${quote.author}</span>`;

    // Click to dismiss (wait for click, no auto-dismiss)
    function dismiss() {
        overlay.removeEventListener('click', dismiss);
        overlay.classList.add('dismissing');
        setTimeout(() => {
            overlay.style.display = 'none';
            if (onDismiss) onDismiss();
        }, 700);
    }

    overlay.addEventListener('click', dismiss);
}

function getPhaseForDay(day) {
    if (day <= 18) return 'Phase 1 — Linear Algebra';
    if (day <= 36) return 'Phase 2 — Differential Equations';
    if (day <= 60) return 'Phase 3 — E&M + Mechanics';
    if (day <= 78) return 'Phase 4 — QM + C++ + ECE';
    return 'Phase 5 — Integration & Launch';
}
