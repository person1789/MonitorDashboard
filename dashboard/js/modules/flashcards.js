/* ==============================================
   FLASHCARDS.JS — Module 16: Active Recall Trainer
   Spaced repetition flashcard system
   ============================================== */

import { Storage } from '../utils/storage.js';

const DEFAULT_DECKS = {
    'Latin Vocab': [
        { front: 'amor, amōris (m.)', back: 'love' },
        { front: 'bellum, bellī (n.)', back: 'war' },
        { front: 'caelum, caelī (n.)', back: 'sky, heaven' },
        { front: 'deus, deī (m.)', back: 'god' },
        { front: 'fēmina, fēminae (f.)', back: 'woman' },
        { front: 'homō, hominis (m.)', back: 'person, human' },
        { front: 'imperium, imperiī (n.)', back: 'power, empire' },
        { front: 'lux, lūcis (f.)', back: 'light' },
        { front: 'māter, mātris (f.)', back: 'mother' },
        { front: 'nox, noctis (f.)', back: 'night' },
        { front: 'pater, patris (m.)', back: 'father' },
        { front: 'rēx, rēgis (m.)', back: 'king' },
        { front: 'terra, terrae (f.)', back: 'earth, land' },
        { front: 'vir, virī (m.)', back: 'man' },
        { front: 'virtūs, virtūtis (f.)', back: 'virtue, courage' },
    ],
    'Physics Formulas': [
        { front: 'Newton\'s 2nd Law', back: 'F = ma' },
        { front: 'Kinetic Energy', back: 'KE = ½mv²' },
        { front: 'Gravitational PE', back: 'U = mgh' },
        { front: 'Coulomb\'s Law', back: 'F = kq₁q₂/r²' },
        { front: 'Gauss\'s Law', back: '∮ E·dA = Q_enc / ε₀' },
        { front: 'Schrödinger Equation', back: 'iℏ ∂ψ/∂t = Ĥψ' },
        { front: 'Maxwell-Faraday', back: '∇ × E = −∂B/∂t' },
        { front: 'Wave Equation', back: '∂²ψ/∂x² = (1/v²)∂²ψ/∂t²' },
        { front: 'Lorentz Force', back: 'F = q(E + v × B)' },
        { front: 'Ohm\'s Law', back: 'V = IR' },
    ],
    'Math Theorems': [
        { front: 'Fundamental Theorem of Calculus', back: '∫ₐᵇ f(x)dx = F(b) − F(a)' },
        { front: 'Eigenvalue Equation', back: 'Av = λv' },
        { front: 'Determinant (2×2)', back: 'det = ad − bc' },
        { front: 'Euler\'s Formula', back: 'e^(iθ) = cos θ + i sin θ' },
        { front: 'Taylor Series', back: 'f(x) = Σ f⁽ⁿ⁾(a)/n! · (x−a)ⁿ' },
        { front: 'L\'Hôpital\'s Rule', back: 'lim f/g = lim f\'/g\' (if 0/0 or ∞/∞)' },
        { front: 'Green\'s Theorem', back: '∮ F·dr = ∬ (∂Q/∂x − ∂P/∂y) dA' },
        { front: 'Stokes\' Theorem', back: '∮ F·dr = ∬ (∇×F)·dS' },
    ],
    'ECE Fundamentals': [
        { front: 'KVL', back: 'Sum of voltages around a closed loop = 0' },
        { front: 'KCL', back: 'Sum of currents at a node = 0' },
        { front: 'Capacitor V-I', back: 'i = C dv/dt' },
        { front: 'Inductor V-I', back: 'v = L di/dt' },
        { front: 'RC Time Constant', back: 'τ = RC' },
        { front: 'Thévenin Theorem', back: 'Any linear circuit → V_th + R_th in series' },
        { front: 'Op-Amp Golden Rules', back: 'V+ = V−, I_in = 0 (negative feedback)' },
        { front: 'Power', back: 'P = IV = I²R = V²/R' },
    ]
};

export default {
    id: 'flashcards',
    title: 'Flashcards',
    icon: '🧠',
    defaultSize: { w: 420, h: 380 },
    minSize: { w: 300, h: 260 },

    _container: null,
    _decks: {},
    _currentDeck: 'Latin Vocab',
    _cardIndex: 0,
    _flipped: false,
    _stats: {},        // { deckName: { easy: 0, good: 0, hard: 0, reviewed: 0 } }
    _view: 'card',     // card | decks

    init(container) {
        this._container = container;
        // Load decks (default + user-added from localStorage)
        this._decks = JSON.parse(JSON.stringify(DEFAULT_DECKS));
        const custom = Storage.get('flashcard-decks');
        if (custom) Object.assign(this._decks, custom);
        this._stats = Storage.get('flashcard-stats') || {};
        this._shuffle();
        this.render();
    },

    _shuffle() {
        const cards = this._decks[this._currentDeck];
        if (!cards) return;
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        this._cardIndex = 0;
        this._flipped = false;
    },

    render() {
        if (this._view === 'decks') return this._renderDecks();
        const cards = this._decks[this._currentDeck] || [];
        const card = cards[this._cardIndex];
        const deckNames = Object.keys(this._decks);
        const stats = this._stats[this._currentDeck] || { easy: 0, good: 0, hard: 0, reviewed: 0 };
        const progress = cards.length > 0 ? `${this._cardIndex + 1} / ${cards.length}` : '0 / 0';

        this._container.innerHTML = `
            <div class="fc-header">
                <button class="cb-btn fc-deck-btn" id="fc-show-decks">📚 Decks</button>
                <span class="fc-progress">${progress}</span>
                <button class="cb-btn" id="fc-shuffle" title="Shuffle">🔀</button>
            </div>
            ${card ? `
                <div class="fc-card ${this._flipped ? 'fc-flipped' : ''}" id="fc-card">
                    <div class="fc-card-inner">
                        <div class="fc-front">
                            <div class="fc-card-label">Question</div>
                            <div class="fc-card-text">${card.front}</div>
                            <div class="fc-hint">Click to reveal</div>
                        </div>
                        <div class="fc-back">
                            <div class="fc-card-label">Answer</div>
                            <div class="fc-card-text">${card.back}</div>
                        </div>
                    </div>
                </div>
                ${this._flipped ? `
                    <div class="fc-rating">
                        <button class="cb-btn fc-rate fc-hard" data-rate="hard">😰 Hard</button>
                        <button class="cb-btn fc-rate fc-good" data-rate="good">👍 Good</button>
                        <button class="cb-btn fc-rate fc-easy" data-rate="easy">⚡ Easy</button>
                    </div>
                ` : ''}
            ` : '<div style="text-align:center;padding:40px;color:var(--text-tertiary);">No cards in this deck.</div>'}
            <div class="fc-stats-bar">
                <span style="color:#34D399;">Easy: ${stats.easy}</span>
                <span style="color:#60A5FA;">Good: ${stats.good}</span>
                <span style="color:#FB923C;">Hard: ${stats.hard}</span>
            </div>
        `;

        this._bindEvents();
    },

    _renderDecks() {
        const deckNames = Object.keys(this._decks);
        const cards = deckNames.map(name => {
            const count = this._decks[name].length;
            const stats = this._stats[name] || { reviewed: 0 };
            const isActive = name === this._currentDeck;
            return `
                <div class="fc-deck-card ${isActive ? 'fc-active' : ''}" data-deck="${name}">
                    <div class="fc-deck-name">${name}</div>
                    <div class="fc-deck-meta">${count} cards · ${stats.reviewed || 0} reviewed</div>
                </div>
            `;
        }).join('');

        this._container.innerHTML = `
            <div class="fc-header">
                <button class="cb-btn" id="fc-back-card">← Back</button>
                <span style="font-size:0.72rem;color:var(--text-secondary);font-weight:600;">Choose a Deck</span>
            </div>
            <div class="fc-deck-list">${cards}</div>
        `;

        this._container.querySelector('#fc-back-card')?.addEventListener('click', () => {
            this._view = 'card';
            this.render();
        });
        this._container.querySelectorAll('.fc-deck-card').forEach(el => {
            el.addEventListener('click', () => {
                this._currentDeck = el.dataset.deck;
                this._view = 'card';
                this._shuffle();
                this.render();
            });
        });
    },

    _bindEvents() {
        const card = this._container.querySelector('#fc-card');
        if (card) card.addEventListener('click', () => { this._flipped = !this._flipped; this.render(); });

        this._container.querySelector('#fc-show-decks')?.addEventListener('click', () => { this._view = 'decks'; this.render(); });
        this._container.querySelector('#fc-shuffle')?.addEventListener('click', () => { this._shuffle(); this.render(); });

        this._container.querySelectorAll('.fc-rate').forEach(btn => {
            btn.addEventListener('click', () => {
                const rate = btn.dataset.rate;
                if (!this._stats[this._currentDeck]) this._stats[this._currentDeck] = { easy: 0, good: 0, hard: 0, reviewed: 0 };
                this._stats[this._currentDeck][rate]++;
                this._stats[this._currentDeck].reviewed++;
                Storage.set('flashcard-stats', this._stats);
                this._nextCard();
            });
        });
    },

    _nextCard() {
        const cards = this._decks[this._currentDeck] || [];
        this._cardIndex = (this._cardIndex + 1) % cards.length;
        this._flipped = false;
        this.render();
    },

    destroy() {}
};
