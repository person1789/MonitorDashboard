/* ==============================================
   SERVER.JS — Express Server with SSE
   Serves dashboard + phone standby page
   ============================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ---- State ----
let studySession = { active: false, subject: '', task: '', timerMinutes: 0, timerEnd: 0 };
const sseClients = [];

// ---- SSE Broadcast ----
function broadcast(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    sseClients.forEach(res => res.write(payload));
}

// ---- API Routes ----

// SSE endpoint — both dashboard and phone connect here
app.get('/api/events', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });
    res.write('\n');

    sseClients.push(res);
    console.log(`[SSE] Client connected (${sseClients.length} total)`);

    req.on('close', () => {
        const idx = sseClients.indexOf(res);
        if (idx !== -1) sseClients.splice(idx, 1);
        console.log(`[SSE] Client disconnected (${sseClients.length} total)`);
    });
});

// Start or stop a study session
app.post('/api/study', (req, res) => {
    const { active, subject, task, timerMinutes } = req.body;

    if (active) {
        studySession = {
            active: true,
            subject: subject || 'General',
            task: task || '',
            timerMinutes: timerMinutes || 25,
            timerEnd: Date.now() + (timerMinutes || 25) * 60 * 1000
        };
        console.log(`[Study] Started: ${studySession.subject} — ${studySession.timerMinutes}min`);
    } else {
        studySession = { active: false, subject: '', task: '', timerMinutes: 0, timerEnd: 0 };
        console.log('[Study] Ended');
    }

    broadcast({ type: 'study', ...studySession });
    res.json({ ok: true, session: studySession });
});

// Get current state (for reconnects)
app.get('/api/status', (req, res) => {
    res.json({ session: studySession });
});

// ---- Serve Static Files ----

// Phone standby page
app.get('/phone', (req, res) => {
    res.sendFile(path.join(__dirname, 'phone.html'));
});

// Dashboard static files (index.html, css/, js/, data/)
app.use(express.static(__dirname));

// ---- Start ----
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ╔══════════════════════════════════════════╗`);
    console.log(`  ║   Command Center Server                  ║`);
    console.log(`  ║                                          ║`);
    console.log(`  ║   Dashboard:  http://localhost:${PORT}      ║`);
    console.log(`  ║   Phone:      http://localhost:${PORT}/phone ║`);
    console.log(`  ║                                          ║`);
    console.log(`  ╚══════════════════════════════════════════╝\n`);
});
