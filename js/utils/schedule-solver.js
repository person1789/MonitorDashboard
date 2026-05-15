/* ==============================================
   SCHEDULE-SOLVER.JS — Constraint Satisfaction
   Finds non-conflicting section combinations
   ============================================== */

import { parseTime } from './osu-api.js';

const DAY_MAP = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4 };

/**
 * A time block represents one section meeting.
 */
function toBlocks(section) {
    if (!section.startTime || !section.endTime || section.days.length === 0) return [];
    const start = parseTime(section.startTime);
    const end = parseTime(section.endTime);
    return section.days.map(d => ({
        day: DAY_MAP[d] ?? -1,
        start,
        end,
        section,
    }));
}

/**
 * Check if two blocks overlap.
 */
function overlaps(a, b) {
    if (a.day !== b.day) return false;
    return a.start < b.end && b.start < a.end;
}

/**
 * Check if a set of blocks has any internal conflicts.
 */
function hasConflict(blocks) {
    for (let i = 0; i < blocks.length; i++) {
        for (let j = i + 1; j < blocks.length; j++) {
            if (overlaps(blocks[i], blocks[j])) return true;
        }
    }
    return false;
}

/**
 * Group sections of a course by component type.
 * Returns { Lecture: [...], Recitation: [...], Laboratory: [...] }
 */
function groupByComponent(course) {
    const groups = {};
    for (const sec of course.sections) {
        if (!sec.startTime || !sec.endTime || sec.days.length === 0) continue;
        const comp = sec.component || 'Other';
        if (!groups[comp]) groups[comp] = [];
        groups[comp].push(sec);
    }
    return groups;
}

/**
 * Generate all valid section combinations for a single course.
 * A valid combo picks exactly one section from each component group.
 * Returns array of arrays of sections.
 */
function courseCombinations(course) {
    const groups = groupByComponent(course);
    const componentKeys = Object.keys(groups);
    if (componentKeys.length === 0) return [];

    const arrays = componentKeys.map(k => groups[k]);

    // Cartesian product of all component groups
    let combos = [[]];
    for (const arr of arrays) {
        const next = [];
        for (const combo of combos) {
            for (const sec of arr) {
                next.push([...combo, sec]);
            }
        }
        combos = next;
        // Safety: cap at 200 combos per course to prevent explosion
        if (combos.length > 200) {
            combos = combos.slice(0, 200);
            break;
        }
    }
    return combos;
}

/**
 * Score a schedule: lower is better.
 * Considers: total gaps between classes, spread across the day.
 */
function scoreSchedule(allBlocks) {
    let totalGap = 0;
    // Group by day
    const byDay = {};
    for (const b of allBlocks) {
        if (!byDay[b.day]) byDay[b.day] = [];
        byDay[b.day].push(b);
    }
    for (const day of Object.keys(byDay)) {
        const sorted = byDay[day].sort((a, b) => a.start - b.start);
        for (let i = 1; i < sorted.length; i++) {
            totalGap += sorted[i].start - sorted[i - 1].end;
        }
    }
    return totalGap;
}

/**
 * Solve: given an array of courses (each with sections),
 * find the top N non-conflicting schedule combinations.
 *
 * @param {Array} courses - Array of course objects (with .sections)
 * @param {number} topN - Number of results to return (default 3)
 * @returns {Array} Top N schedules, each = { score, courses: [{ course, sections }] }
 */
export function solveSchedule(courses, topN = 3) {
    if (courses.length === 0) return [];

    // Build per-course combos
    const perCourse = courses.map(c => ({
        course: c,
        combos: courseCombinations(c),
    }));

    // Filter out courses with no valid combos
    const valid = perCourse.filter(pc => pc.combos.length > 0);
    if (valid.length === 0) return [];

    // Iteratively build schedules using backtracking
    const results = [];
    const MAX_RESULTS = 50; // internal cap

    function backtrack(idx, currentBlocks, currentPicks) {
        if (results.length >= MAX_RESULTS) return;

        if (idx === valid.length) {
            // Complete schedule found
            results.push({
                score: scoreSchedule(currentBlocks),
                courses: currentPicks.map((sections, i) => ({
                    course: valid[i].course,
                    sections: sections,
                })),
            });
            return;
        }

        const pc = valid[idx];
        for (const combo of pc.combos) {
            // Get blocks for this combo
            const newBlocks = combo.flatMap(sec => toBlocks(sec));

            // Check for conflicts with existing blocks
            let conflict = false;
            for (const nb of newBlocks) {
                for (const eb of currentBlocks) {
                    if (overlaps(nb, eb)) { conflict = true; break; }
                }
                if (conflict) break;
            }

            if (!conflict) {
                backtrack(
                    idx + 1,
                    [...currentBlocks, ...newBlocks],
                    [...currentPicks, combo]
                );
            }
        }
    }

    backtrack(0, [], []);

    // Sort by score (lower = better) and return top N
    results.sort((a, b) => a.score - b.score);
    return results.slice(0, topN);
}
