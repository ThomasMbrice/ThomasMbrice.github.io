import { RESUME, GITHUB_USER } from './data.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- GitHub data (cached per session to stay under the 60 req/hr limit) ----------

async function cachedJson(key, url) {
    try {
        const hit = sessionStorage.getItem(key);
        if (hit) return JSON.parse(hit);
    } catch {}
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const data = await res.json();
    try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
    return data;
}

// Same convention as the classic site: description ending in ml / cl / bk tags the category.
const CATS = { ml: 'Machine Learning', cl: 'Cloud', bk: 'Backend', other: 'Other' };

function categorize(repo) {
    const d = (repo.description || '').trim();
    const tag = d.slice(-2).toLowerCase();
    if (tag in CATS && tag !== 'other') return { cat: tag, description: d.slice(0, -2).trim() };
    return { cat: 'other', description: d };
}

export async function loadRepos() {
    const repos = await cachedJson('office-repos', `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=30`);
    // repos with a real description first; GitHub's updated-order is kept within each group
    return repos.filter(r => !r.fork).map(r => ({ ...r, ...categorize(r) }))
        .sort((a, b) => !a.description - !b.description);
}

async function loadEvents() {
    const events = await cachedJson('office-events', `https://api.github.com/users/${GITHUB_USER}/events?per_page=30`);
    const out = [];
    for (const e of events) {
        const repo = e.repo.name.replace(`${GITHUB_USER}/`, '');
        let msg = null;
        if (e.type === 'PushEvent') msg = e.payload.commits?.[0]?.message || `pushed to ${repo}`;
        else if (e.type === 'CreateEvent' && e.payload.ref_type === 'repository') msg = `created repository`;
        else if (e.type === 'PullRequestEvent') msg = `${e.payload.action} PR: ${e.payload.pull_request?.title ?? ''}`;
        else if (e.type === 'IssuesEvent') msg = `${e.payload.action} issue: ${e.payload.issue?.title ?? ''}`;
        else if (e.type === 'WatchEvent') msg = `starred`;
        if (msg) out.push({ hash: String(e.id).slice(-7), repo, msg: msg.split('\n')[0], date: new Date(e.created_at) });
    }
    return out.slice(0, 14);
}

function timeAgo(d) {
    const s = (Date.now() - d) / 1000;
    if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
    if (s < 86400) return `${Math.round(s / 3600)}h ago`;
    return `${Math.round(s / 86400)}d ago`;
}

// ---------- Laptop ----------

export function renderLaptop(el, reposPromise) {
    el.innerHTML = `
      <div class="os">
        <div class="os-titlebar">
          <span class="os-dots"><i></i><i></i><i></i></span>
          <span class="os-title">thomas@office — ~/projects</span>
        </div>
        <div class="os-body">
          <nav class="os-side" role="tablist">
            <button class="active" data-tab="projects"><span>📁</span> projects</button>
            <button data-tab="log"><span>⎇</span> git log</button>
            <button data-tab="lab"><span>⚗</span> playground</button>
          </nav>
          <section class="os-main">
            <div class="os-tab" data-pane="projects">
              <div class="os-prompt">$ ls ~/projects <span class="os-filters"></span></div>
              <div class="os-repos"><p class="os-muted">fetching from github…</p></div>
            </div>
            <div class="os-tab" data-pane="log" hidden>
              <div class="os-prompt">$ git log --all --oneline</div>
              <div class="os-log"><p class="os-muted">fetching from github…</p></div>
            </div>
            <div class="os-tab" data-pane="lab" hidden>
              <div class="os-prompt">$ ./playground --list</div>
              <p class="os-muted">Interactive simulations I've built — they run in the classic view of the site.</p>
              <ul class="os-lab">
                <li><a href="classic.html#pathfinding">pathfinding/</a> A*, Dijkstra, BFS, DFS racing through mazes you draw</li>
                <li><a href="classic.html#pathfinding">quantum/</a> a 3-qubit state-vector simulator with phase-colored amplitudes</li>
                <li><a href="classic.html#pathfinding">neural-net/</a> a tiny MLP learning decision boundaries live in your browser</li>
              </ul>
            </div>
          </section>
        </div>
      </div>`;

    el.querySelectorAll('.os-side button').forEach(btn => btn.addEventListener('click', () => {
        el.querySelectorAll('.os-side button').forEach(b => b.classList.toggle('active', b === btn));
        el.querySelectorAll('.os-tab').forEach(p => { p.hidden = p.dataset.pane !== btn.dataset.tab; });
    }));

    const reposEl = el.querySelector('.os-repos');
    const filtersEl = el.querySelector('.os-filters');
    reposPromise.then(repos => {
        let active = 'all';
        const draw = () => {
            const shown = active === 'all' ? repos : repos.filter(r => r.cat === active);
            reposEl.innerHTML = shown.map(r => `
              <a class="os-repo" href="${esc(r.html_url)}" target="_blank" rel="noopener">
                <span class="os-repo-name cat-${r.cat}">${esc(r.name)}/</span>
                <span class="os-repo-desc">${esc(r.description || 'no description yet')}</span>
                <span class="os-repo-meta">${esc(r.language || '')}${r.stargazers_count ? ` · ★ ${r.stargazers_count}` : ''}${r.homepage ? ` · <span class="os-live">live demo</span>` : ''}</span>
              </a>`).join('') || '<p class="os-muted">nothing here yet</p>';
        };
        const present = ['all', ...Object.keys(CATS).filter(c => repos.some(r => r.cat === c))];
        filtersEl.innerHTML = present.map(c => `<button data-cat="${c}" class="${c === 'all' ? 'on' : ''}">--${c === 'all' ? 'all' : c}</button>`).join(' ');
        filtersEl.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
            active = b.dataset.cat;
            filtersEl.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
            draw();
        }));
        draw();
    }).catch(() => {
        reposEl.innerHTML = `<p class="os-err">github rate-limited this browser — <a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener">browse on github.com</a></p>`;
    });

    const logEl = el.querySelector('.os-log');
    loadEvents().then(events => {
        logEl.innerHTML = events.length ? events.map(e => `
          <div class="os-commit">
            <span class="os-hash">${esc(e.hash)}</span>
            <span class="os-branch">(${esc(e.repo)})</span>
            <span>${esc(e.msg)}</span>
            <span class="os-muted">${timeAgo(e.date)}</span>
          </div>`).join('') : '<p class="os-muted">no recent public activity</p>';
    }).catch(() => {
        logEl.innerHTML = `<p class="os-err">couldn't reach github — <a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener">see activity on github.com</a></p>`;
    });
}

// ---------- Resume ----------

export function renderResume(el) {
    const r = RESUME;
    const bullets = (bs) => `<ul>${bs.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`;
    el.innerHTML = `
      <article class="sheet">
        <a class="sheet-dl" href="${esc(r.pdf)}" download>⤓ PDF</a>
        <header>
          <h1>${esc(r.name)}</h1>
          <p>${r.contact.map(c => `<a href="${esc(c.href)}" target="_blank" rel="noopener">${esc(c.label)}</a>`).join(' · ')}</p>
        </header>
        <h2>Education</h2>
        <div class="row"><strong>${esc(r.education.school)}</strong><span>${esc(r.education.when)}</span></div>
        <div class="row"><em>${esc(r.education.degree)}</em><span>${esc(r.education.where)}</span></div>
        ${r.education.details.map(d => `<p>${esc(d)}</p>`).join('')}
        <h2>Experience</h2>
        ${r.experience.map(e => `
          <div class="row"><strong>${esc(e.role)}</strong><span>${esc(e.when)}</span></div>
          <div class="row"><em>${esc(e.org)}</em><span>${esc(e.where)}</span></div>
          ${bullets(e.bullets)}`).join('')}
        <h2>Projects</h2>
        ${r.projects.map(p => `
          <div class="row"><strong>${esc(p.name)}</strong><span>${esc(p.when)}</span></div>
          <div class="row"><em>${esc(p.stack)}</em></div>
          ${bullets(p.bullets)}`).join('')}
        <h2>Technical Skills</h2>
        ${r.skills.map(([k, v]) => `<p><strong>${esc(k)}:</strong> ${esc(v)}</p>`).join('')}
      </article>`;
}

// ---------- Book ----------

export function renderBook(el, book) {
    const stars = book.rating ? '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating) : '';
    el.innerHTML = `
      <article class="book-card" style="--spine:${esc(book.color)};--spine-ink:${esc(book.ink || '#f5ecd7')}">
        <div class="book-cover"><span>${esc(book.short || book.title)}</span><small>${esc(book.author)}</small></div>
        <div class="book-notes">
          <h2>${esc(book.title)}</h2>
          <p class="book-author">${esc(book.author)}</p>
          ${stars ? `<p class="book-stars" aria-label="${book.rating} out of 5">${stars}</p>` : ''}
          ${book.note ? `<p>${esc(book.note)}</p>` : ''}
        </div>
      </article>`;
}

// ---------- Contact ----------

export function renderContact(el) {
    el.innerHTML = `
      <form class="note-form" action="https://formspree.io/f/xyzdrzdj" method="POST">
        <h2>Leave a note on the board</h2>
        <input name="name" placeholder="Your name" required>
        <input name="email" type="email" placeholder="Email" required>
        <input name="subject" placeholder="Subject" required>
        <textarea name="message" rows="5" placeholder="What's on your mind?" required></textarea>
        <button type="submit">Pin it ↗</button>
        <p class="note-links">
          or find me on <a href="https://www.linkedin.com/in/thomasmbrice/" target="_blank" rel="noopener">LinkedIn</a>
          · <a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener">GitHub</a>
        </p>
      </form>`;
}
