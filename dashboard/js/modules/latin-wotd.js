/* ==============================================
   LATIN-WOTD.JS — Module 9: Latin Word of the Day
   Full principal parts, gender, meaning via API
   ============================================== */

import { fetchLatinWord } from '../utils/api.js';

export default {
    id: 'latin-wotd',
    title: 'Latin Word of the Day',
    icon: '🌟',
    defaultSize: { w: 430, h: 305 },
    minSize: { w: 300, h: 200 },

    _container: null,
    _words: [],
    _wordData: null,

    async init(container) {
        this._container = container;
        try {
            const res = await fetch('data/latin-words.json');
            const data = await res.json();
            this._words = data.words || [];
        } catch {
            this._words = [];
        }
        await this._loadTodaysWord();
        this.render();
    },

    async _loadTodaysWord(forceRandom = false) {
        if (this._words.length === 0) {
            this._wordData = {
                word: 'veritas',
                principalParts: 'veritās, veritātis, f.',
                partOfSpeech: 'noun',
                gender: 'feminine',
                declension: '3rd declension',
                meanings: ['truth', 'reality', 'truthfulness']
            };
            return;
        }

        // Pick word based on day of year for consistency, or random if forced
        let index = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)) % this._words.length;
        if (forceRandom) {
            index = Math.floor(Math.random() * this._words.length);
        }
        const todayWord = this._words[index];

        // Use local data first (it's more reliable and has curated principal parts)
        this._wordData = todayWord;

        // Try API enrichment
        try {
            const apiData = await fetchLatinWord(todayWord.word);
            if (apiData && apiData.meanings && apiData.meanings.length > 0 && apiData.meanings[0] !== '(Offline — check connection)') {
                // Merge API meanings if they add value
                if (apiData.meanings.length > this._wordData.meanings.length) {
                    this._wordData.apiMeanings = apiData.meanings;
                }
            }
        } catch { /* use local data */ }
    },

    render() {
        const w = this._wordData;
        if (!w) {
            this._container.innerHTML = '<p style="padding:16px;color:var(--text-tertiary);">Loading...</p>';
            return;
        }

        const genderIcon = { masculine: '♂', feminine: '♀', neuter: '⚬' };
        const genderLabel = w.gender ? w.gender.charAt(0).toUpperCase() + w.gender.slice(1) : '';

        this._container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div class="latin-word">${w.word}</div>
                <button id="latin-refresh" title="New Word" style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);font-size:1.1rem;padding:0;transition:color 0.2s;">🔄</button>
            </div>
            <div class="latin-parts">${w.principalParts}</div>

            <div class="latin-meta">
                ${w.partOfSpeech ? `<span class="latin-tag">${w.partOfSpeech}</span>` : ''}
                ${w.gender ? `<span class="latin-tag">${genderIcon[w.gender] || ''} ${genderLabel}</span>` : ''}
                ${w.declension ? `<span class="latin-tag">${w.declension}</span>` : ''}
                ${w.conjugation ? `<span class="latin-tag">${w.conjugation}</span>` : ''}
            </div>

            <div class="latin-meaning">
                ${w.meanings.map((m, i) => `<strong>${i + 1}.</strong> ${m}`).join('<br>')}
            </div>

            ${w.example ? `
                <div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05);">
                    <div style="font-size:0.65rem;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">Example</div>
                    <div style="font-size:0.78rem;font-style:italic;color:var(--text-secondary);">${w.example}</div>
                    ${w.exampleTranslation ? `<div style="font-size:0.72rem;color:var(--text-tertiary);margin-top:2px;">${w.exampleTranslation}</div>` : ''}
                </div>
            ` : ''}

            ${w.apiMeanings ? `
                <div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.04);">
                    <div style="font-size:0.6rem;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">Whitaker's Words</div>
                    <div style="font-size:0.72rem;color:var(--text-tertiary);line-height:1.5;">${w.apiMeanings.join('; ')}</div>
                </div>
            ` : ''}
        `;

        const refreshBtn = document.getElementById('latin-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.style.opacity = '0.5';
                await this._loadTodaysWord(true);
                this.render();
            });
        }
    },

    destroy() {}
};
