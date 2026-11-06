import * as THREE from 'three';
import { buildOffice } from './scene.js';
import { SEASONS, TIMES, seasonForDate, timeForHour } from './outside.js';
import { loadRepos, renderLaptop, renderResume, renderBook, renderContact } from './panels.js';

const canvas = document.getElementById('office');
const tag = document.getElementById('hover-tag');
const panel = document.getElementById('panel');
const panelBody = document.getElementById('panel-body');
const backBtn = document.getElementById('back');
const hint = document.getElementById('hint');
const dock = document.getElementById('dock');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.localClippingEnabled = true; // keeps snow/leaves inside the window glass

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, 1, 0.02, 40);
const office = buildOffice(scene);

// ---------- Season / time of day ----------
// 'auto' follows the visitor's date and clock; the picker lets you preview the others.
// Also settable by URL: office.html?season=winter&time=night

const seasonSelect = document.getElementById('season');
const timeSelect = document.getElementById('time');
const params = new URLSearchParams(location.search);
for (const [select, options, key] of [[seasonSelect, SEASONS, 'season'], [timeSelect, TIMES, 'time']]) {
    select.innerHTML = ['auto', ...options].map(o => `<option value="${o}">${o}</option>`).join('');
    if (options.includes(params.get(key))) select.value = params.get(key);
}

function applyConditions() {
    const season = seasonSelect.value === 'auto' ? seasonForDate() : seasonSelect.value;
    const time = timeSelect.value === 'auto' ? timeForHour(new Date().getHours()) : timeSelect.value;
    office.setConditions(season, time);
    document.getElementById('time-of-day').textContent = `${season} ${time}`;
}
seasonSelect.addEventListener('change', applyConditions);
timeSelect.addEventListener('change', applyConditions);
applyConditions();

// ---------- Hotspots ----------

const HOTSPOTS = {
    laptop: { object: office.laptop.group, label: 'Laptop — projects & activity' },
    paper: { object: office.paper.group, label: 'Resume' },
    shelf: { object: office.shelf.group, label: 'Bookshelf — what I\'ve read' },
    cork: { object: office.cork.group, label: 'Corkboard — get in touch' },
    lamp: { object: office.lamp.group, label: 'Lamp' },
};
for (const [id, h] of Object.entries(HOTSPOTS)) h.object.traverse(o => { o.userData.hotspot = id; });

// Camera framings: [position, target]. Close-ups end where the DOM panel takes over.
const VIEWS = {
    // seated at the desk, eye height ~1.2m
    overview: [new THREE.Vector3(0, 1.25, 0.25), new THREE.Vector3(0, 1.12, -2.5)],
    overviewPortrait: [new THREE.Vector3(0, 1.3, 0.35), new THREE.Vector3(0, 1.12, -2.5)],
    laptop: [new THREE.Vector3(-0.12, 1.13, -0.92), new THREE.Vector3(-0.12, 0.92, -1.72)],
    paper: [new THREE.Vector3(0.36, 1.16, -0.95), new THREE.Vector3(0.36, 0.76, -1.13)],
    shelf: [new THREE.Vector3(-1.62, 1.22, -0.3), new THREE.Vector3(-1.68, 1.12, -2.3)],
    cork: [new THREE.Vector3(1.6, 1.5, -1.15), new THREE.Vector3(1.72, 1.5, -2.48)],
};

// Portrait screens use a dedicated seated framing (and a wider lens, see resize()).
function framed(name) {
    const aspect = innerWidth / innerHeight;
    const [pos, target] = VIEWS[name === 'overview' && aspect < 0.9 ? 'overviewPortrait' : name];
    return [pos.clone(), target.clone()];
}

// ---------- Camera tweening ----------

const camPos = new THREE.Vector3();
const camTarget = new THREE.Vector3();
let tween = null;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function flyTo(name, duration = 1.1) {
    const [p, t] = framed(name);
    if (reduceMotion) duration = 0.001;
    return new Promise(resolve => {
        tween = { fromP: camPos.clone(), fromT: camTarget.clone(), toP: p, toT: t, start: performance.now(), duration: duration * 1000, resolve };
    });
}

// ---------- State ----------

let mode = 'overview';
let pulledBook = null;

// Deep links: office.html#resume, #laptop, #books, #books/3, #contact
const HASH_TO_VIEW = { laptop: 'laptop', resume: 'paper', books: 'shelf', contact: 'cork' };
const VIEW_TO_HASH = Object.fromEntries(Object.entries(HASH_TO_VIEW).map(([h, v]) => [v, h]));
const setHash = (h) => history.replaceState(null, '', h ? `#${h}` : location.pathname + location.search);
const reposPromise = loadRepos();
reposPromise.then(r => office.laptop.setRepos(r)).catch(() => {});

async function enter(name) {
    if (name === 'lamp') {
        office.lamp.toggle();
        return;
    }
    if (mode === name) return;
    closePanel();
    returnBook();
    mode = name;
    setHash(VIEW_TO_HASH[name]);
    setHover(null);
    backBtn.hidden = false;
    hint.hidden = true;
    syncDock();
    await flyTo(name);
    if (mode !== name) return; // user navigated away mid-flight
    if (name === 'laptop') openPanel('laptop', el => renderLaptop(el, reposPromise));
    if (name === 'paper') openPanel('paper', renderResume);
    if (name === 'cork') openPanel('cork', renderContact);
    if (name === 'shelf') hint.textContent = 'Pick a book off the shelf', hint.hidden = false;
}

function back() {
    if (pulledBook) {
        returnBook();
        closePanel();
        return;
    }
    if (mode === 'overview') return;
    closePanel();
    mode = 'overview';
    setHash('');
    backBtn.hidden = true;
    hint.textContent = 'Click around the office';
    hint.hidden = false;
    syncDock();
    flyTo('overview');
}

function openPanel(kind, render) {
    panel.dataset.kind = kind;
    render(panelBody);
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('open'));
}

function closePanel() {
    panel.classList.remove('open');
    panel.hidden = true;
    panelBody.innerHTML = '';
}

function syncDock() {
    dock.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.go === mode));
}

// ---------- Books ----------

const bookAnim = new Map(); // mesh -> { to, toRot }

function pullBook(mesh) {
    if (pulledBook === mesh) return;
    returnBook();
    pulledBook = mesh;
    const to = mesh.userData.home.clone().add(new THREE.Vector3(0, 0.05, 0.3));
    bookAnim.set(mesh, { to, toRot: new THREE.Euler(0, -1.1, 0) });
    hint.hidden = true;
    setHash(`books/${mesh.userData.index}`);
    openPanel('book', el => renderBook(el, mesh.userData.book));
}

function returnBook() {
    if (!pulledBook) return;
    bookAnim.set(pulledBook, { to: pulledBook.userData.home.clone(), toRot: pulledBook.userData.homeRot.clone() });
    pulledBook = null;
    if (mode === 'shelf') {
        hint.hidden = false;
        setHash('books');
    }
}

// ---------- Pointer ----------

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const parallax = new THREE.Vector2();
let hovered = null;
let hoveredBook = null;

function pick(ev) {
    pointer.set((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(scene.children, true)[0]?.object ?? null;
}

function setHover(id, ev) {
    if (hovered && hovered !== id) highlight(HOTSPOTS[hovered].object, false);
    hovered = id;
    if (id) {
        highlight(HOTSPOTS[id].object, true);
        tag.textContent = HOTSPOTS[id].label;
        tag.hidden = false;
        if (ev) tag.style.transform = `translate(${ev.clientX + 16}px, ${ev.clientY + 12}px)`;
    } else {
        tag.hidden = true;
    }
    canvas.style.cursor = id || hoveredBook ? 'pointer' : 'default';
}

function highlight(obj, on) {
    obj.traverse(o => {
        if (!o.isMesh) return;
        for (const m of [].concat(o.material)) {
            if (!m.emissive) continue;
            if (on) m.emissive.set('#3d2a0c');
            else m.emissive.set('#000000');
        }
    });
}

function setBookHover(mesh, ev) {
    if (hoveredBook && hoveredBook !== mesh && hoveredBook !== pulledBook) highlight(hoveredBook, false);
    hoveredBook = mesh;
    if (mesh) {
        highlight(mesh, true);
        tag.textContent = `${mesh.userData.book.title} — ${mesh.userData.book.author}`;
        tag.hidden = false;
        tag.style.transform = `translate(${ev.clientX + 16}px, ${ev.clientY + 12}px)`;
    } else if (!hovered) {
        tag.hidden = true;
    }
    canvas.style.cursor = mesh || hovered ? 'pointer' : 'default';
}

canvas.addEventListener('pointermove', (ev) => {
    parallax.set((ev.clientX / innerWidth) * 2 - 1, (ev.clientY / innerHeight) * 2 - 1);
    if (tween || ev.pointerType === 'touch') return;
    const obj = pick(ev);
    if (mode === 'overview') {
        setHover(obj?.userData.hotspot ?? null, ev);
    } else if (mode === 'shelf') {
        setBookHover(obj?.userData.book ? obj : null, ev);
    }
});

let downAt = null;
canvas.addEventListener('pointerdown', (ev) => { downAt = [ev.clientX, ev.clientY]; });
canvas.addEventListener('pointerup', (ev) => {
    if (!downAt || Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1]) > 8) return;
    downAt = null;
    const obj = pick(ev);
    if (mode === 'shelf' && obj?.userData.book) {
        setBookHover(null, ev);
        pullBook(obj);
        return;
    }
    const id = obj?.userData.hotspot;
    if (id && (mode === 'overview' || id !== mode)) enter(id);
    else if (mode !== 'overview' && !id) back();
});

backBtn.addEventListener('click', back);
document.getElementById('panel-close').addEventListener('click', back);
dock.addEventListener('click', (ev) => {
    const go = ev.target.closest('button')?.dataset.go;
    if (!go) return;
    go === 'overview' ? (pulledBook && returnBook(), back()) : enter(go);
});
addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') back();
});

// ---------- Loop ----------

function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    // portrait screens get a wider lens so the wall still fits
    camera.fov = camera.aspect < 1 ? Math.min(85, 62 / Math.sqrt(camera.aspect)) : 62;
    camera.updateProjectionMatrix();
    if (!tween) {
        const [p, t] = framed(mode === 'overview' || !VIEWS[mode] ? 'overview' : mode);
        camPos.copy(p);
        camTarget.copy(t);
    }
}
addEventListener('resize', resize);

// intro: walk up behind the chair and take a seat
const [startP, startT] = framed('overview');
const standing = new THREE.Vector3(0.35, 0.5, 1.6);
camTarget.copy(startT);
resize();
camPos.copy(startP).add(standing);
flyTo('overview', 2.2).then(async () => {
    const [view, book] = location.hash.slice(1).split('/');
    if (!HASH_TO_VIEW[view]) return;
    await enter(HASH_TO_VIEW[view]);
    const mesh = office.shelf.books.find(b => b.userData.index === Number(book));
    if (view === 'books' && mesh) pullBook(mesh);
});

const clock = new THREE.Clock();
const lookAt = new THREE.Vector3();

renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();

    if (tween) {
        const k = Math.min(1, (performance.now() - tween.start) / tween.duration);
        const e = ease(k);
        camPos.lerpVectors(tween.fromP, tween.toP, e);
        camTarget.lerpVectors(tween.fromT, tween.toT, e);
        if (k === 1) {
            const r = tween.resolve;
            tween = null;
            r();
        }
    }

    // while seated, the pointer turns your head a little
    camera.position.copy(camPos);
    lookAt.copy(camTarget);
    if (mode === 'overview' && !tween && !reduceMotion) {
        lookAt.x += parallax.x * 0.45;
        lookAt.y -= parallax.y * 0.25;
    }
    camera.lookAt(lookAt);

    for (const [mesh, a] of bookAnim) {
        mesh.position.lerp(a.to, 0.15);
        mesh.rotation.y += (a.toRot.y - mesh.rotation.y) * 0.15;
        mesh.rotation.z += (a.toRot.z - mesh.rotation.z) * 0.15;
        if (mesh.position.distanceTo(a.to) < 0.0005) {
            mesh.position.copy(a.to);
            bookAnim.delete(mesh);
            if (mesh !== pulledBook) highlight(mesh, false);
        }
    }

    office.laptop.update(t);
    office.mug.update(t);
    office.plant.update(t);
    office.outside.update(t);
    renderer.render(scene, camera);
});

document.body.classList.add('ready');
