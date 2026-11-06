// Content for the office. Edit this file to change what's on the shelf / paper.

export const GITHUB_USER = 'ThomasMbrice';

// Bookshelf, grouped by category (the categories are never shown, they only drive
// the arrangement). Groups fill each shelf row (0 = top) left to right in this order.
// layout: 'upright' (sorted tallest first) or 'stack' (lying flat, for small sets).
export const CATEGORIES = [
    { id: 'philosophy', row: 0, layout: 'stack' },
    { id: 'cs', row: 0, layout: 'upright' },
    { id: 'business', row: 1, layout: 'upright' },
    { id: 'strategy', row: 1, layout: 'upright' },
    { id: 'fiction', row: 2, layout: 'upright' },
    { id: 'latin', row: 2, layout: 'stack' },
];

// color = spine color, ink = spine text color, short = spine label for long titles,
// thick = spine width in meters (optional). rating (1-5) and note are optional;
// the book card hides them when empty.
export const BOOKS = [
    // Computer Science
    { category: 'cs', title: 'Designing Machine Learning Systems', short: 'Designing ML Systems', author: 'Chip Huyen', color: '#7a2e5a', rating: 0, note: '' },
    { category: 'cs', title: 'Cracking the Coding Interview', author: 'Gayle Laakmann McDowell', color: '#2f6e9c', thick: 0.06, rating: 0, note: '' },
    { category: 'cs', title: 'Writing a C Compiler', author: 'Nora Sandler', color: '#c4512b', rating: 0, note: '' },
    // Philosophy
    { category: 'philosophy', title: 'The Myth of Sisyphus', author: 'Albert Camus', color: '#3d5a40', rating: 0, note: '' },
    { category: 'philosophy', title: 'Fear and Trembling', author: 'Søren Kierkegaard', color: '#4a4a4a', rating: 0, note: '' },
    // Business & Leadership
    { category: 'business', title: 'The Future of Management', author: 'Gary Hamel', color: '#1f3b5c', rating: 0, note: '' },
    { category: 'business', title: 'Play Nice But Win', author: 'Michael Dell', color: '#16325c', rating: 0, note: '' },
    { category: 'business', title: 'Steve Jobs', author: 'Walter Isaacson', color: '#e8e4dc', ink: '#1a1a1a', thick: 0.058, rating: 0, note: '' },
    { category: 'business', title: 'Purpose', author: 'Nikos Mourkogiannis', color: '#8a6d1f', rating: 0, note: '' },
    { category: 'business', title: 'The Leadership Challenge', author: 'James Kouzes & Barry Posner', color: '#b23a2e', rating: 0, note: '' },
    { category: 'business', title: 'Emotional Intelligence 2.0', author: 'Travis Bradberry & Jean Greaves', color: '#2b7a8c', thick: 0.032, rating: 0, note: '' },
    // Economics & Strategy
    { category: 'strategy', title: 'Why Nations Fail', author: 'Daron Acemoglu & James A. Robinson', color: '#d9b23a', ink: '#1a1a1a', rating: 0, note: '' },
    { category: 'strategy', title: 'One Up On Wall Street', author: 'Peter Lynch', color: '#2f5d3a', rating: 0, note: '' },
    { category: 'strategy', title: 'The Art of Strategy', author: 'Avinash Dixit & Barry Nalebuff', color: '#3b3f8c', rating: 0, note: '' },
    { category: 'strategy', title: 'The 48 Laws of Power', author: 'Robert Greene', color: '#1c1c1c', ink: '#c9a227', thick: 0.055, rating: 0, note: '' },
    // Fiction
    { category: 'fiction', title: 'War and Peace', author: 'Leo Tolstoy', color: '#6b2430', thick: 0.085, rating: 0, note: '' },
    { category: 'fiction', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', color: '#2b2b2b', thick: 0.055, rating: 0, note: '' },
    { category: 'fiction', title: 'The Hunchback of Notre-Dame', short: 'Hunchback of Notre-Dame', author: 'Victor Hugo', color: '#5c2a2a', thick: 0.055, rating: 0, note: '' },
    { category: 'fiction', title: 'The Catcher in the Rye', author: 'J. D. Salinger', color: '#9c3b2e', rating: 0, note: '' },
    { category: 'fiction', title: 'A Farewell to Arms', author: 'Ernest Hemingway', color: '#2e4a6b', rating: 0, note: '' },
    { category: 'fiction', title: 'Slaughterhouse-Five', author: 'Kurt Vonnegut', color: '#e0662d', ink: '#1a1a1a', thick: 0.032, rating: 0, note: '' },
    // Latin
    { category: 'latin', title: 'Lingua Latina per se Illustrata, Pars I: Familia Romana', short: 'Familia Romana', author: 'Hans H. Ørberg', color: '#8c2f2f', thick: 0.045, rating: 0, note: '' },
    { category: 'latin', title: 'Lingua Latina per se Illustrata, Pars II: Roma Aeterna', short: 'Roma Aeterna', author: 'Hans H. Ørberg', color: '#2f4f8c', thick: 0.05, rating: 0, note: '' },
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
