import json
from datetime import datetime, timedelta

def generate_tasks():
    phases = [
        {"name": "Linear Algebra", "start": 1, "end": 18, "subjects": ["Math", "Coding"]},
        {"name": "Differential Equations", "start": 19, "end": 36, "subjects": ["Math", "Coding"]},
        {"name": "E&M + Mechanics", "start": 37, "end": 60, "subjects": ["Physics", "Math"]},
        {"name": "QM + C++ + ECE", "start": 61, "end": 78, "subjects": ["Physics", "Coding", "ECE"]},
        {"name": "Integration & Research", "start": 79, "end": 90, "subjects": ["ECE", "Physics", "Math"]}
    ]

    tasks = []
    
    for day in range(1, 91):
        phase = next(p for p in phases if p["start"] <= day <= p["end"])
        
        # Task 1: Theory
        if phase["name"] == "Linear Algebra":
            desc = f"Linear Algebra: Study {['Vectors', 'Span/Basis', 'Matrices', 'Transformations', 'Determinants', 'Inverse', 'Null Space', 'Dot Products', 'Cross Products', 'Change of Basis', 'Eigenvalues', 'Eigenvectors', 'SVD', 'PCA', 'Least Squares', 'Review 1', 'Review 2', 'Exam Prep'][day-1]}"
            subj = "Math"
        elif phase["name"] == "Differential Equations":
            idx = day - 19
            topics = ['First order ODEs', 'Separable eq', 'Integrating factors', 'Modeling', 'Second order', 'Homogeneous', 'Undetermined coefficients', 'Variation of parameters', 'Oscillations', 'Laplace Transforms', 'Step functions', 'Convolution', 'Systems of ODEs', 'Phase plane', 'Nonlinear systems', 'Review 1', 'Review 2', 'Final Prep']
            desc = f"Diff Eq: Study {topics[idx] if idx < len(topics) else 'Advanced Topics'}"
            subj = "Math"
        elif phase["name"] == "E&M + Mechanics":
            idx = day - 37
            topics = ['Vectors & Div/Grad/Curl', 'Electrostatics', 'Gauss Law', 'Potential', 'Poisson Eq', 'Work & Energy', 'Conductors', 'Laplace Eq', 'Method of Images', 'Separation of Variables', 'Multipole Expansion', 'E-fields in matter', 'Polarization', 'Dielectrics', 'Magnetostatics', 'Lorentz Force', 'Biot-Savart', 'Amperes Law', 'Vector Potential', 'Magnetic matter', 'Review 1', 'Review 2', 'Review 3', 'Final Prep']
            desc = f"E&M/Mech: Study {topics[idx] if idx < len(topics) else 'Mechanics Review'}"
            subj = "Physics"
        elif phase["name"] == "QM + C++ + ECE":
            idx = day - 61
            topics = ['Wave-particle duality', 'Schrodinger Eq', 'Infinite Square Well', 'Harmonic Oscillator', 'Delta function', 'Finite Well', 'Formalism', 'Operators', '3D QM', 'Hydrogen Atom', 'Spin', 'Addition of Angular Momentum', 'C++ Classes', 'Memory Management', 'Data Structures', 'Circuits Basics', 'KCL/KVL', 'Thevenin/Norton']
            desc = f"QM/ECE/C++: Study {topics[idx] if idx < len(topics) else 'Advanced Systems'}"
            subj = "Physics" if idx < 12 else ("Coding" if idx < 15 else "ECE")
        else: # Integration
            desc = f"Capstone & Research: {['Project Ideation', 'Literature Review', 'Hardware Specs', 'Software Arch', 'Mathematical Model', 'Simulation Set 1', 'Simulation Set 2', 'Drafting Report', 'Final Integration', 'Presentation Prep', 'Final Review', 'Summer Finish'][day-79]}"
            subj = "ECE"

        tasks.append({
            "id": f"d{day}t1",
            "day": day,
            "description": desc,
            "subject": subj,
            "estimatedMinutes": 60
        })

        # Task 2: Problem Set / Coding
        if day % 2 == 0:
            tasks.append({
                "id": f"d{day}t2",
                "day": day,
                "description": f"Problem Set: Solve 5 challenging problems on {desc.split(': ')[1]}",
                "subject": subj,
                "estimatedMinutes": 90
            })
        else:
            tasks.append({
                "id": f"d{day}t2",
                "day": day,
                "description": f"Coding: Implement {desc.split(': ')[1]} in Python/C++",
                "subject": "Coding",
                "estimatedMinutes": 90
            })

        # Task 3: Review / Anki
        tasks.append({
            "id": f"d{day}t3",
            "day": day,
            "description": "Anki Review + Update today's lecture notes",
            "subject": "General",
            "estimatedMinutes": 45
        })

    return {
        "startDate": "2026-06-01",
        "totalDays": 90,
        "tasks": tasks
    }

def generate_schedule():
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    blocks = []
    
    for day in days:
        # Morning 1
        blocks.append({ "day": day, "startTime": "07:00", "endTime": "08:30", "name": "Deep Theory Study", "subject": "Physics", "location": "Home" })
        # Morning 2
        blocks.append({ "day": day, "startTime": "08:30", "endTime": "09:15", "name": "Problem Set Work", "subject": "Math", "location": "Home" })
        # Mid-morning
        blocks.append({ "day": day, "startTime": "09:30", "endTime": "11:00", "name": "Coding / ECE Work", "subject": "Coding", "location": "Home" })
        # Afternoon
        blocks.append({ "day": day, "startTime": "14:00", "endTime": "14:45", "name": "Anki + Review", "subject": "General", "location": "Home" })
        # Evening
        blocks.append({ "day": day, "startTime": "20:00", "endTime": "21:00", "name": "Light Reading / 3B1B", "subject": "General", "location": "Home" })
    
    # Sunday
    blocks.append({ "day": "Sunday", "startTime": "10:00", "endTime": "16:00", "name": "Weekly Review + Mock Exam", "subject": "Math", "location": "Library" })

    return {
        "semester": "Y1 Autumn — Triple Major Track",
        "blocks": blocks
    }

tasks_data = generate_tasks()
schedule_data = generate_schedule()

with open('c:/Users/ajayp/Desktop/Summer Projects/dashboard/data/tasks.json', 'w') as f:
    json.dump(tasks_data, f, indent=4)

with open('c:/Users/ajayp/Desktop/Summer Projects/dashboard/data/schedule.json', 'w') as f:
    json.dump(schedule_data, f, indent=4)

print("Tasks and Schedule generated successfully.")
