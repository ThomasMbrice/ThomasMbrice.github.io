// Content for the office. Edit this file to change what's on the shelf / paper.

export const GITHUB_USER = 'ThomasMbrice';

// Bookshelf — PLACEHOLDERS: swap these for books you've actually read.
// color = spine color, note = your one-paragraph take, rating = 1..5
export const BOOKS = [
    { title: 'Gödel, Escher, Bach', author: 'Douglas Hofstadter', color: '#7a2e2e', rating: 5,
      note: 'Placeholder — write what this book changed about how you think.' },
    { title: 'The Structure and Interpretation of Computer Programs', short: 'SICP', author: 'Abelson & Sussman', color: '#3d2f6b', rating: 5,
      note: 'Placeholder — your take goes here.' },
    { title: 'Deep Learning', author: 'Goodfellow, Bengio & Courville', color: '#1f3b4d', rating: 4,
      note: 'Placeholder — your take goes here.' },
    { title: 'Reinforcement Learning: An Introduction', short: 'RL: An Introduction', author: 'Sutton & Barto', color: '#2f5d50', rating: 5,
      note: 'Placeholder — your take goes here.' },
    { title: 'Quantum Computation and Quantum Information', short: 'Mike & Ike', author: 'Nielsen & Chuang', color: '#8a6d1f', rating: 4,
      note: 'Placeholder — your take goes here.' },
    { title: 'Designing Data-Intensive Applications', short: 'DDIA', author: 'Martin Kleppmann', color: '#a8452b', rating: 5,
      note: 'Placeholder — your take goes here.' },
    { title: 'The Art of Computer Programming', short: 'TAOCP Vol. 1', author: 'Donald Knuth', color: '#23395b', rating: 4,
      note: 'Placeholder — your take goes here.' },
    { title: 'Probability Theory: The Logic of Science', short: 'Probability Theory', author: 'E. T. Jaynes', color: '#4a4a4a', rating: 4,
      note: 'Placeholder — your take goes here.' },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', color: '#c9a227', rating: 4,
      note: 'Placeholder — your take goes here.' },
    { title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', color: '#5c3d2e', rating: 4,
      note: 'Placeholder — your take goes here.' },
    { title: 'Dune', author: 'Frank Herbert', color: '#b5651d', rating: 5,
      note: 'Placeholder — your take goes here.' },
    { title: 'Elements of Statistical Learning', short: 'ESL', author: 'Hastie, Tibshirani & Friedman', color: '#2b4c7e', rating: 4,
      note: 'Placeholder — your take goes here.' },
];

export const RESUME = {
    name: 'Thomas Mbrice',
    contact: [
        { label: 'mbricethomas@gmail.com', href: 'mailto:mbricethomas@gmail.com' },
        { label: 'GitHub', href: 'https://github.com/ThomasMbrice' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/thomasmbrice/' },
    ],
    pdf: 'ThomasMbriceResume.pdf',
    education: {
        school: 'Stony Brook University',
        where: 'Stony Brook, NY',
        degree: 'M.S./B.S. Computer Science & B.S. Applied Mathematics',
        when: 'Expected May 2027',
        details: [
            'Coursework: Probability Theory, Natural Language Processing, Computer Networks',
            "Dean's List (Fall 2022, 2023, 2024) · Presidential Merit Scholarship (2022 – 2026)",
        ],
    },
    skills: [
        ['ML / Systems', 'PyTorch, distributed training (DDP/multi-GPU), CUDA, SLURM/HPC, NumPy, scikit-learn, sentence-transformers, HNSW/FAISS, RAG, DPO/LoRA fine-tuning, transformers'],
        ['Languages', 'C, C++, Python, Bash, Java, TypeScript, R, SQL'],
        ['Infrastructure', 'Docker, FastAPI, PostgreSQL, GCP, CI/CD, pytest, asyncio, Git'],
        ['Publications', 'Stance Detection in Prediction Markets, Fair-Aurora RL Networks, LSTM Based Reserving Analysis'],
    ],
    experience: [
        {
            role: 'Machine Learning & Data Science Intern', org: 'Dell Technologies', where: 'Austin, TX', when: '06/2026 – 08/2026',
            bullets: [
                'Built and deployed an encoder-based semantic search service over 2k–30k external documents, pairing mpnet embeddings with an HNSW index tuned to match brute-force recall@10 exactly while cutting p95 query latency 35x.',
                'Turned HNSW cluster density into a demand signal for sales and marketing, using semantic regeneration passes over the prompt pool and inverse-propensity weighting to keep clusters from mirroring query distribution.',
                'Refactored evidence function in internal search engine resulting in a 30% higher hit rate while searching 80% fewer tables.',
            ],
        },
        {
            role: 'Graduate Researcher, ML for Quantum Systems', org: 'Brookhaven National Laboratory (U.S. DOE) & Stony Brook University', where: 'Stony Brook, NY', when: '02/2026 – Present',
            bullets: [
                "Own ML engineering for a Brookhaven quantum physics team's DNN mapping source-subsystem density matrices to target subsystems in random quantum circuits.",
                'Cut inherited 200% relative error to 12% via ablation-driven loss design; plain MSE beat fidelity-constrained objectives whose physics constraint layers bottlenecked gradients.',
                'Cut A100 epoch wall-clock from 17h to 7min (145x) via parallel data loading, multi-GPU utilization, and a hierarchical rewrite that restricts each timestep to interacting subsystems.',
            ],
        },
        {
            role: 'Lead ML Engineer', org: 'Stony Brook University, Vertically Integrated Project', where: 'Stony Brook, NY', when: '08/2024 – Present',
            bullets: [
                'Led four undergraduates building ethical decision-making agents for autonomous vehicles in CARLA, training RL policies under Bradley-Terry preference learning over 240 human-labeled pedestrian scenarios.',
                'Led a cross-disciplinary team of four undergraduates modeling autonomous vehicles in a 3D environment, experimenting with KNN, Decision Trees (Random Forest) and Neural Networks.',
                'Built a SLURM-based data pipeline on SeaWulf HPC with automated validation, preprocessing, and augmentation, cutting experiment turnaround 60% and making runs reproducible across the team.',
            ],
        },
    ],
    projects: [
        {
            name: 'AEGIS — Fault Tolerance for Distributed Training', stack: 'Python, PyTorch, asyncio, pytest', when: '2026',
            bullets: [
                'Built an in-process runtime composing three published recovery primitives — R²CCL (transport), MeCeFO (compute), TierCheck (storage) — under one escalation controller.',
                'Designed a B0–B4 blast-radius taxonomy with a one-directional escalation invariant, verified under 60-fault chaos injection.',
                'Measured 92% reduction in $/GPU-hr lost versus a checkpoint-restart baseline across 200 simulated ranks.',
            ],
        },
        {
            name: 'Akkadian Machine Translation', stack: 'PyTorch, ByT5, BM25, sentence-transformers', when: '2026',
            bullets: [
                'Built byte-level seq2seq translation pipeline (ByT5 + BM25/genre-filtered RAG + lexicon integration) for 4,000-year-old cuneiform with 1,589 training pairs.',
                'Developed 8-stage diagnostic framework catching bugs invisible to loss curves, improving genre precision from 21% to 92%.',
            ],
        },
        {
            name: 'Fair-Aurora: Fairness Strategies for RL-Based Congestion Control', stack: 'Python, NS3', when: '2026',
            bullets: [
                'Investigated fairness failures in Aurora (deep RL congestion controller) in multi-flow networks; implemented reward shaping, observation augmentation, and loss-sensitivity tuning.',
                "Reward shaping achieved the best fairness-throughput tradeoff via Jain's fairness index.",
            ],
        },
    ],
};
