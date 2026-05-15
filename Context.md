# Ajay's Research Student Masterplan — Context & Purpose

## Who This Is For

This spreadsheet is a personal planning and tracking system built for **Ajay**, an incoming student at **The Ohio State University** pursuing a **B.S. in Electrical and Computer Engineering (ECE)** with a **Latin Minor** and a **research track** in condensed matter physics or quantum device engineering.

The plan begins in **Summer 2026** — before Ajay's first semester — and extends through all four years of undergraduate study. The central premise is simple: **arrive at OSU already one year ahead**. By doing the work before the work starts, every course becomes reinforcement rather than first exposure, and every research opportunity becomes accessible earlier.

---

## The Core Problem Being Solved

Most engineering undergraduates encounter their hardest material — quantum mechanics, honors E&M, advanced mechanics — for the first time in the classroom, under time pressure, alongside a full course load. This plan eliminates that disadvantage.

Specifically, Ajay is targeting:

- **Honors Physics sequences** (PHYS 5400H, 5401H, 5500H, 5501H) that require Griffiths-level preparation most students don't have until Year 3
- **Undergraduate research** starting in Year 2 or 3, which requires coding fluency, mathematical maturity, and the ability to read papers
- **A Latin Minor** running continuously across all four years, requiring consistent language study
- **A senior honors thesis** (PHYS 4999H) and potential graduate coursework (PHYS 6806) in Year 4

Without deliberate summer preparation, none of these goals are realistic on the standard timeline.

---

## What the Spreadsheet Contains

The workbook has **7 tabs**, each serving a distinct function.

### 🗓 OSU Schedule
The full **4-year course-by-course plan**, term by term, from Year 1 Autumn through Year 4 Spring. Every course is listed with its course number, credits, and prerequisite chain. Four courses were added relative to the original plan after identifying gaps:

- **STAT 3470** (Probability & Statistics for Engineers) — added Year 2 Spring, no hard prereqs, directly supports QM interpretation, error analysis, and research data work
- **ECE 3027** (Electronics Lab) — added Year 3 Autumn, pairs with ECE 3030, critical for hands-on research readiness
- **ECE 3040** (Energy & Power Electronics) — added Year 3 Spring, required ECE elective
- **ISE 2040** (Engineering Economics) — added Year 4 Autumn, required for the ECE degree, no prereqs

The sheet also flags load concerns (Year 2 Autumn was originally 19 credits) and documents every change with a rationale.

### 📊 Dashboard
A **bird's-eye view** of the entire summer effort. Contains:
- Progress tracking by module (linked to the 90-Day Plan)
- A daily schedule template showing how to structure 3–4 hours of study each day
- An 18-week weekly targets table mapping each week to a subject focus, problem goal, coding goal, reading goal, and review cadence

### 📐 90-Day Plan
The **operational core** of the spreadsheet. ~270 individual tasks across 90 days, organized into 5 phases plus woven-in tool and skill tasks. Each task includes a day number, theme, full description, subject tag, status dropdown, notes field, and estimated time in minutes.

**Phase 1 — Linear Algebra (Days 1–18)**
Vectors, transformations, determinants, eigenvalues, SVD, Gram-Schmidt, least squares. Uses 3Blue1Brown's Essence of LA series and MIT 18.06. Git and LaTeX are introduced on Days 1 and 4 respectively so every subsequent project is committed and typeset from the start.

**Phase 2 — Differential Equations + Tools (Days 19–36)**
First and second-order ODEs, Laplace transforms, Fourier series, PDEs, complex numbers. Probability and statistics are woven into Days 26–27 and 29 alongside the ODE work. LaTeX note-taking becomes a habit here.

**Phase 3 — Physics: E&M + Classical Mechanics (Days 37–60)**
Griffiths Electrodynamics Chapters 1–9 (electrostatics through EM waves), plus Morin's Classical Mechanics covering Lagrangian and Hamiltonian mechanics. Thermodynamics foundations are inserted at Day 54 — the 0th, 1st, and 2nd laws, entropy, ideal gas law — because PHYS 5600 (Statistical Mechanics) assumes this background and there is no separate thermo course in the schedule.

**Phase 4 — Quantum Mechanics + C++ + ECE (Days 61–78)**
C++ from the ground up (LearnCpp.com) through classes, templates, the STL, and Makefiles. Griffiths Quantum Mechanics Chapters 1–4 in parallel. ECE foundations: circuit analysis, AC circuits, op-amps, digital logic, signals, semiconductors. Statistics continues with hypothesis testing and chi-squared problems.

**Phase 5 — Integration & OSU Launch Prep (Days 79–90)**
Two comprehensive timed exams. A C++ ODE solver library project. QM operators and the hydrogen atom. Professor outreach and OSU administrative setup. Latin vocabulary and grammar foundations. A final interactive electromagnetic field simulation. Launch day.

**Buffer Days** are built into every phase (Days 7, 18, 25, 36, 45, 58, 78) to absorb illness, life, or slow progress without derailing the whole plan.

### 💻 Projects
A tracker for **27 coding projects** that are built incrementally throughout the 90-day period and beyond. Projects span Python, C++, and both, across categories: math tools, physics simulations, ECE circuits, research utilities, and developer workflow. Notable additions over the original list include a Stats Data Analyzer, an Error Propagation Calculator, a CLT Simulator, a LaTeX paper scaffolding script, and a Git workflow practice repository.

Each project has a language, category, priority, status dropdown, description, and skills-practiced column.

### 🔬 Research
Three sections:
1. **Professor Outreach Log** — 12 blank rows to track every professor contact: name, lab, email, date contacted, response status, follow-up date, research area, and notes
2. **Research Skills Checklist** — 22 skills tracked from current level to goal level, with resources and the reason each skill matters. Added relative to the original: Git, Makefiles, unit testing, probability/statistics, error analysis, experimental lab protocols, and thermodynamics/stat mech
3. **Papers & Books to Read** — core texts tracked with reading status. Added: *OpenIntro Statistics* (free PDF, covers all STAT 3470 material) and *An Introduction to Error Analysis* by Taylor (essential before PHYS 3700)

### 📚 Resources
A curated list of **24 free or low-cost resources** with type, subject, priority, cost, status, location, and estimated hours. Additions over the original: OpenIntro Statistics, GNU Make tutorial, Pro Git book, Overleaf (flagged as start Day 4).

### 📋 Formula Sheet
**42 key formulas** across all subjects, formatted in Courier New for readability, color-coded by subject area. Added relative to the original: Bayes' theorem, normal distribution PDF, error propagation formula, Central Limit Theorem, confidence intervals, and the three laws of thermodynamics. Blank rows at the bottom for Ajay to add formulas as he encounters them.

---

## The Underlying Philosophy

**Depth over breadth, every time.** The plan never skims. Every phase builds toward the ability to do real problems, not just recognize concepts. Griffiths problems are done by hand. C++ projects compile and run. LaTeX summaries are written. Everything is committed to GitHub.

**Tools are not optional extras.** Git, LaTeX, and Makefiles are introduced on Days 1, 4, and 15 respectively — not deferred to "when there's time." A researcher who can't version their code or typeset their derivations is less effective than one who can, regardless of how strong the physics is.

**Statistics is physics infrastructure.** QM expectation values are probability-weighted averages. Error propagation is required for every lab. The Central Limit Theorem underpins half of experimental physics. STAT 3470 is now in the formal schedule; probability and error analysis are woven into the 90-day plan.

**Thermodynamics cannot be skipped.** PHYS 5600 (Statistical Mechanics) in Year 4 assumes fluency with entropy, heat capacity, and the laws of thermodynamics. There is no thermodynamics course in the ECE curriculum. Day 54 addresses this directly.

**Research readiness is a Year 3 target, not Year 4.** The schedule puts PHYS 4998 (Undergraduate Research) starting Year 3 Autumn. Getting into a lab requires knowing how to read a paper, run a simulation, use Git, and have an informed conversation with a PI. All of that is built in the summer before Year 1 and reinforced across Years 1 and 2.

**Latin is continuous, not optional.** One Latin course per semester for four years is the only way to complete the minor without cramming. It is scheduled without gaps.

---

## Success Criteria

By the end of the 90-day summer plan, Ajay should be able to:

- Solve problems from MIT 18.06 exams without notes
- Derive and apply all four Maxwell equations from memory
- Write a working C++ class with a Makefile, committed to GitHub
- Solve a second-order ODE using at least three different methods
- Compute Fourier series and understand what they represent physically
- Explain the Lagrangian and Hamiltonian formulations and derive equations of motion
- Work through the first two chapters of Griffiths QM independently
- Propagate measurement errors through a multi-variable function
- Write and compile a LaTeX document with equations and references
- Draft and send a cold email to a professor that demonstrates genuine knowledge of their work

By graduation, the plan targets:
- ECE B.S. with Honors designation
- Latin Minor (completed by Year 4 Autumn)
- 2–3 semesters of undergraduate research credit
- A senior honors thesis
- Potential graduate course credit (PHYS 6806)
- A GitHub portfolio of physics and ECE simulation projects
- At minimum one conference poster or abstract

---

## How to Use the Spreadsheet Day-to-Day

1. **Open the 90-Day Plan tab.** Find today's day number. The three tasks listed for that day are your work for the session.
2. **Mark status as you go.** Each task has a dropdown: To Do → Done, Skipped, or Revisit. Be honest.
3. **Use the Notes column.** Write what you actually produced: the output file, the insight you had, the problem number you got wrong. Future-you will want this.
4. **Commit code at the end of every coding session.** The Git habit starts Day 1. There is no "I'll commit later."
5. **Typeset at least one result per day in LaTeX.** Not everything — one thing. A formula, a proof sketch, a worked example. The habit matters more than the quantity.
6. **On buffer days:** if you are behind, catch up. If you are on track, rest completely or read ahead. Do not use buffer days to accelerate — use them to consolidate.
7. **On Sunday:** do the timed review for that week's target. No notes. Grade it honestly. Log your weakest area.
8. **When you finish a phase:** update the Dashboard progress overview, commit all code, and push everything to GitHub before starting the next phase.
