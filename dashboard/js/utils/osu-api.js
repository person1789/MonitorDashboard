/* ==============================================
   OSU-API.JS — Ohio State Course Data Fetcher
   Endpoint: content.osu.edu/v2/classes/search
   ============================================== */

const BASE_URL = 'https://content.osu.edu/v2/classes/search';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

// Term codes follow pattern: 12XX where XX encodes semester
// Autumn = X8, Spring = X2, Summer = X4
const TERMS = [
    { code: '1268', label: 'Autumn 2026' },
    { code: '1272', label: 'Spring 2027' },
    { code: '1274', label: 'Summer 2027' },
    { code: '1278', label: 'Autumn 2027' },
    { code: '1282', label: 'Spring 2028' },
];

const SUBJECTS = [
    { code: 'ece',     label: 'ECE' },
    { code: 'physics', label: 'Physics' },
    { code: 'math',    label: 'Math' },
    { code: 'latin',   label: 'Latin' },
    { code: 'stat',    label: 'Statistics' },
    { code: 'cse',     label: 'CSE' },
    { code: 'engr',    label: 'Engineering' },
];

/**
 * Fetch courses from OSU content API.
 * @param {string} query - Search term (e.g. "1250" or "calculus")
 * @param {string} term - Term code (e.g. "1268")
 * @param {string} [subject] - Subject filter (e.g. "physics")
 * @returns {Promise<Array>} Parsed course objects
 */
export async function fetchOSUCourses(query, term, subject = '') {
    const cacheKey = `osu_courses_${query}_${term}_${subject}`;
    const cached = _getCache(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
        q: query,
        campus: 'col',
        term: term,
        'academic-career': 'ugrd',
        p: '1'
    });
    if (subject) params.set('subject', subject);

    try {
        const allCourses = [];
        let page = 1;
        let totalPages = 1;

        // Fetch first page to get total
        const url = `${BASE_URL}?${params.toString()}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`OSU API error: ${resp.status}`);
        const json = await resp.json();

        totalPages = Math.min(json.data.totalPages, 3); // Cap at 3 pages (600 results)
        allCourses.push(..._parseCourses(json.data.courses));

        // Fetch remaining pages if needed
        for (let p = 2; p <= totalPages; p++) {
            params.set('p', String(p));
            const r = await fetch(`${BASE_URL}?${params.toString()}`);
            if (!r.ok) break;
            const j = await r.json();
            allCourses.push(..._parseCourses(j.data.courses));
        }

        _setCache(cacheKey, allCourses);
        return allCourses;
    } catch (err) {
        console.error('OSU API fetch failed:', err);
        return [];
    }
}

/**
 * Parse raw API course+section data into clean objects.
 */
function _parseCourses(rawCourses) {
    if (!rawCourses || !Array.isArray(rawCourses)) return [];

    return rawCourses.map(entry => {
        const c = entry.course;
        const sections = (entry.sections || []).map(sec => {
            const meeting = sec.meetings && sec.meetings[0] ? sec.meetings[0] : {};
            const days = [];
            if (meeting.monday) days.push('Mon');
            if (meeting.tuesday) days.push('Tue');
            if (meeting.wednesday) days.push('Wed');
            if (meeting.thursday) days.push('Thu');
            if (meeting.friday) days.push('Fri');

            return {
                classNumber: sec.classNumber,
                section: sec.section,
                component: sec.component,           // Lecture, Recitation, Laboratory
                days: days,
                startTime: meeting.startTime || null,
                endTime: meeting.endTime || null,
                room: meeting.buildingDescriptionShort || '',
                roomFull: meeting.buildingDescription || '',
                enrollmentStatus: sec.enrollmentStatus, // Open, Closed, Waitlist
                enrollmentTotal: sec.enrollmentTotal || 0,
                waitlistTotal: sec.waitlistTotal || 0,
                instructionMode: sec.instructionMode || 'In Person',
            };
        });

        return {
            courseId: c.courseId,
            subject: c.subject,
            catalogNumber: c.catalogNumber,
            title: c.title,
            description: c.description || '',
            credits: c.maxUnits || 0,
            component: c.primaryComponent,
            term: c.term,
            sections: sections,
        };
    });
}

/**
 * Parse a time string like "10:20 am" into minutes from midnight.
 */
export function parseTime(timeStr) {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
    if (!match) return 0;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const ampm = match[3].toLowerCase();
    if (ampm === 'pm' && h !== 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    return h * 60 + m;
}

/**
 * Format minutes from midnight back to a display string.
 */
export function formatTimeFromMinutes(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? 'pm' : 'am';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
}

/* ---- Cache helpers ---- */
function _getCache(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL) {
            localStorage.removeItem(key);
            return null;
        }
        return data;
    } catch { return null; }
}

function _setCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
    } catch { /* storage full, ignore */ }
}

export { TERMS, SUBJECTS };
