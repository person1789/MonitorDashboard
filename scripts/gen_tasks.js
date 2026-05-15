const fs = require('fs');

const phases = [
    { name: 'Linear Algebra', start: 1, end: 18, subjects: ['Math', 'Coding'] },
    { name: 'Differential Equations', start: 19, end: 36, subjects: ['Math', 'Coding'] },
    { name: 'E&M + Mechanics', start: 37, end: 60, subjects: ['Physics', 'Math'] },
    { name: 'QM + C++ + ECE', start: 61, end: 78, subjects: ['Physics', 'Coding', 'ECE'] },
    { name: 'Integration & Research', start: 79, end: 90, subjects: ['ECE', 'Physics', 'Math'] }
];

const tasks = [];

for (let day = 1; day <= 90; day++) {
    const phase = phases.find(p => day >= p.start && day <= p.end);
    let desc = '';
    let subj = '';

    if (phase.name === 'Linear Algebra') {
        const topics = ['Vectors', 'Span/Basis', 'Matrices', 'Transformations', 'Determinants', 'Inverse', 'Null Space', 'Dot Products', 'Cross Products', 'Change of Basis', 'Eigenvalues', 'Eigenvectors', 'SVD', 'PCA', 'Least Squares', 'Review 1', 'Review 2', 'Exam Prep'];
        desc = `Linear Algebra: Study ${topics[day - 1] || 'Advanced Concepts'}`;
        subj = 'Math';
    } else if (phase.name === 'Differential Equations') {
        const idx = day - 19;
        const topics = ['First order ODEs', 'Separable eq', 'Integrating factors', 'Modeling', 'Second order', 'Homogeneous', 'Undetermined coefficients', 'Variation of parameters', 'Oscillations', 'Laplace Transforms', 'Step functions', 'Convolution', 'Systems of ODEs', 'Phase plane', 'Nonlinear systems', 'Review 1', 'Review 2', 'Final Prep'];
        desc = `Diff Eq: Study ${topics[idx] || 'PDE Basics'}`;
        subj = 'Math';
    } else if (phase.name === 'E&M + Mechanics') {
        const idx = day - 37;
        const topics = ['Vectors & Div/Grad/Curl', 'Electrostatics', 'Gauss Law', 'Potential', 'Poisson Eq', 'Work & Energy', 'Conductors', 'Laplace Eq', 'Method of Images', 'Separation of Variables', 'Multipole Expansion', 'E-fields in matter', 'Polarization', 'Dielectrics', 'Magnetostatics', 'Lorentz Force', 'Biot-Savart', 'Amperes Law', 'Vector Potential', 'Magnetic matter', 'Review 1', 'Review 2', 'Review 3', 'Final Prep'];
        desc = `E&M/Mech: Study ${topics[idx] || 'Relativity Basics'}`;
        subj = 'Physics';
    } else if (phase.name === 'QM + C++ + ECE') {
        const idx = day - 61;
        const topics = ['Wave-particle duality', 'Schrodinger Eq', 'Infinite Square Well', 'Harmonic Oscillator', 'Delta function', 'Finite Well', 'Formalism', 'Operators', '3D QM', 'Hydrogen Atom', 'Spin', 'Addition of Angular Momentum', 'C++ Classes', 'Memory Management', 'Data Structures', 'Circuits Basics', 'KCL/KVL', 'Thevenin/Norton'];
        desc = `QM/ECE/C++: Study ${topics[idx] || 'Quantum Systems'}`;
        subj = idx < 12 ? 'Physics' : (idx < 15 ? 'Coding' : 'ECE');
    } else {
        const topics = ['Project Ideation', 'Literature Review', 'Hardware Specs', 'Software Arch', 'Mathematical Model', 'Simulation Set 1', 'Simulation Set 2', 'Drafting Report', 'Final Integration', 'Presentation Prep', 'Final Review', 'Summer Finish'];
        desc = `Capstone & Research: ${topics[day - 79] || 'Summer Wrap-up'}`;
        subj = 'ECE';
    }

    tasks.push({
        id: `d${day}t1`,
        day: day,
        description: desc,
        subject: subj,
        estimatedMinutes: 60
    });

    tasks.push({
        id: `d${day}t2`,
        day: day,
        description: day % 2 === 0 ? `Problem Set: 5 problems on ${desc.split(': ')[1]}` : `Coding: Implement ${desc.split(': ')[1]} simulation`,
        subject: day % 2 === 0 ? subj : 'Coding',
        estimatedMinutes: 90
    });

    tasks.push({
        id: `d${day}t3`,
        day: day,
        description: 'Anki Review + Flashcard Update',
        subject: 'General',
        estimatedMinutes: 30
    });
}

const data = {
    startDate: '2026-06-01',
    totalDays: 90,
    tasks: tasks
};

fs.writeFileSync('c:/Users/ajayp/Desktop/Summer Projects/dashboard/data/tasks.json', JSON.stringify(data, null, 4));
console.log('90-day task list generated successfully.');
