import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { BOOKS, RESUME } from './data.js';

// Everything in the room is built from primitives — no model files to load.
// Units are meters. The desk sits against the back wall (z = -2.5).

const DESK_Y = 0.76;

const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...opts });

function box(w, h, d, material, r = 0) {
    const geo = r > 0 ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(geo, material);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
}

function canvasTexture(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    draw(ctx, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return { tex, canvas: c, ctx };
}

// Subtle procedural wood grain so surfaces don't look flat.
function woodTexture(base, dark) {
    const { tex } = canvasTexture(512, 512, (ctx, w, h) => {
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 90; i++) {
            ctx.strokeStyle = dark;
            ctx.globalAlpha = 0.04 + Math.random() * 0.08;
            ctx.lineWidth = 1 + Math.random() * 3;
            ctx.beginPath();
            const y = Math.random() * h;
            ctx.moveTo(0, y);
            for (let x = 0; x <= w; x += 32) ctx.lineTo(x, y + Math.sin(x / 60 + i) * 6);
            ctx.stroke();
        }
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '';
    for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line, x, y);
            line = word;
            y += lineH;
        } else {
            line = test;
        }
    }
    if (line) ctx.fillText(line, x, y);
    return y + lineH;
}

// ---------- Window sky, driven by the visitor's local clock ----------

export function skyForHour(h) {
    if (h >= 21 || h < 5) return { top: '#060a1f', bottom: '#1b2550', stars: true, sun: 0.0, ambient: 0.18, label: 'night' };
    if (h < 7) return { top: '#3b4a7a', bottom: '#f6a57a', stars: false, sun: 0.5, ambient: 0.35, label: 'sunrise' };
    if (h < 17) return { top: '#5aa9e6', bottom: '#d8ecff', stars: false, sun: 1.0, ambient: 0.55, label: 'day' };
    if (h < 19) return { top: '#4b3f7a', bottom: '#ff8a5c', stars: false, sun: 0.55, ambient: 0.35, label: 'golden hour' };
    return { top: '#141a3d', bottom: '#5b4b8a', stars: true, sun: 0.15, ambient: 0.25, label: 'dusk' };
}

function skyTexture(sky) {
    return canvasTexture(512, 512, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, sky.top);
        g.addColorStop(1, sky.bottom);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        if (sky.stars) {
            for (let i = 0; i < 140; i++) {
                ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
                const r = Math.random() * 1.6;
                ctx.beginPath();
                ctx.arc(Math.random() * w, Math.random() * h * 0.75, r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = '#f4f1e1';
            ctx.beginPath();
            ctx.arc(w * 0.75, h * 0.22, 26, 0, Math.PI * 2);
            ctx.fill();
        }
        // skyline silhouette
        ctx.fillStyle = sky.stars ? '#05070f' : 'rgba(40,50,70,0.55)';
        let x = 0;
        while (x < w) {
            const bw = 30 + Math.random() * 50;
            const bh = 60 + Math.random() * 140;
            ctx.fillRect(x, h - bh, bw - 4, bh);
            if (sky.stars) {
                ctx.fillStyle = '#f7c56a';
                for (let wy = h - bh + 10; wy < h - 10; wy += 16)
                    for (let wx = x + 6; wx < x + bw - 12; wx += 12)
                        if (Math.random() < 0.25) ctx.fillRect(wx, wy, 5, 7);
                ctx.fillStyle = '#05070f';
            }
            x += bw;
        }
    }).tex;
}

// ---------- Room ----------

function buildRoom(scene) {
    const floorTex = woodTexture('#7a543b', '#3b2416');
    floorTex.repeat.set(4, 4);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), mat('#ffffff', { map: floorTex, roughness: 0.7 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    const rug = new THREE.Mesh(new THREE.CircleGeometry(1.3, 48), mat('#b8553a', { roughness: 1 }));
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0.1, 0.004, -0.9);
    rug.receiveShadow = true;
    scene.add(rug);
    const rugInner = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.08, 48), mat('#e8c49a', { roughness: 1 }));
    rugInner.rotation.x = -Math.PI / 2;
    rugInner.position.set(0.1, 0.005, -0.9);
    scene.add(rugInner);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), mat('#f1e9dd', { roughness: 1 }));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 3.2, 1.5);
    scene.add(ceiling);

    const wallMat = mat('#e8dccb', { roughness: 0.95 });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), wallMat);
    back.position.set(0, 1.6, -2.5);
    back.receiveShadow = true;
    scene.add(back);

    const left = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), mat('#ded0bd', { roughness: 0.95 }));
    left.rotation.y = Math.PI / 2;
    left.position.set(-3, 1.6, 1.5);
    left.receiveShadow = true;
    scene.add(left);

    // baseboards
    const trim = mat('#f4ede3');
    const bb1 = box(8, 0.1, 0.02, trim);
    bb1.position.set(0, 0.05, -2.49);
    scene.add(bb1);
    const bb2 = box(0.02, 0.1, 8, trim);
    bb2.position.set(-2.99, 0.05, 1.5);
    scene.add(bb2);
}

function buildWindow(scene, sky) {
    const g = new THREE.Group();
    g.position.set(0, 1.78, -2.49);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.95), new THREE.MeshBasicMaterial({ map: skyTexture(sky) }));
    glass.position.z = 0.005;
    g.add(glass);
    const frameMat = mat('#f4ede3', { roughness: 0.6 });
    const pieces = [
        [1.42, 0.06, 0, 0.505], [1.42, 0.06, 0, -0.505],
        [0.06, 1.07, -0.68, 0], [0.06, 1.07, 0.68, 0],
        [0.03, 0.95, 0, 0], [1.3, 0.03, 0, 0],
    ];
    for (const [w, h, x, y] of pieces) {
        const p = box(w, h, 0.05, frameMat);
        p.position.set(x, y, 0.025);
        g.add(p);
    }
    const sill = box(1.55, 0.04, 0.16, frameMat);
    sill.position.set(0, -0.53, 0.07);
    g.add(sill);
    scene.add(g);
    return g;
}

// ---------- Desk + chair ----------

function buildDesk(scene) {
    const wood = woodTexture('#9a6b47', '#4a2c18');
    const top = box(1.9, 0.05, 0.85, mat('#ffffff', { map: wood, roughness: 0.55 }), 0.01);
    top.position.set(0, DESK_Y - 0.025, -2.0);
    scene.add(top);
    const legMat = mat('#2b2b2b', { metalness: 0.6, roughness: 0.4 });
    for (const [x, z] of [[-0.9, -2.35], [0.9, -2.35], [-0.9, -1.65], [0.9, -1.65]]) {
        const leg = box(0.04, DESK_Y - 0.05, 0.04, legMat);
        leg.position.set(x, (DESK_Y - 0.05) / 2, z);
        scene.add(leg);
    }

    // chair
    const chair = new THREE.Group();
    chair.position.set(-0.45, 0, -1.3);
    chair.rotation.y = 0.6;
    const seatMat = mat('#2f3a45', { roughness: 0.9 });
    const seat = box(0.48, 0.07, 0.46, seatMat, 0.03);
    seat.position.y = 0.48;
    chair.add(seat);
    const backrest = box(0.46, 0.5, 0.06, seatMat, 0.03);
    backrest.position.set(0, 0.8, 0.22);
    backrest.rotation.x = -0.08;
    chair.add(backrest);
    const pole = box(0.04, 0.4, 0.04, legMat);
    pole.position.y = 0.25;
    chair.add(pole);
    for (let i = 0; i < 5; i++) {
        const spoke = box(0.3, 0.025, 0.035, legMat);
        spoke.position.y = 0.05;
        spoke.rotation.y = (i / 5) * Math.PI * 2;
        spoke.translateX(0.15);
        chair.add(spoke);
    }
    scene.add(chair);
}

// ---------- Laptop (screen is a live canvas texture) ----------

function buildLaptop(scene) {
    const g = new THREE.Group();
    g.position.set(-0.2, DESK_Y, -2.0);
    g.rotation.y = 0.12;
    const shell = mat('#b9bec6', { metalness: 0.7, roughness: 0.35 });

    const base = box(0.36, 0.016, 0.25, shell, 0.006);
    base.position.y = 0.008;
    g.add(base);
    const keys = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.11), mat('#2a2d33', { roughness: 0.9 }));
    keys.rotation.x = -Math.PI / 2;
    keys.position.set(0, 0.0165, -0.03);
    g.add(keys);
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.07), mat('#a5aab2', { roughness: 0.5 }));
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(0, 0.0165, 0.075);
    g.add(pad);

    const lid = new THREE.Group();
    lid.position.set(0, 0.016, -0.125);
    lid.rotation.x = -0.28;
    const lidBody = box(0.36, 0.235, 0.01, shell, 0.004);
    lidBody.position.y = 0.1175;
    lid.add(lidBody);

    const screen = canvasTexture(1024, 640, () => {});
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.206), new THREE.MeshBasicMaterial({ map: screen.tex }));
    screenMesh.position.set(0, 0.1175, 0.0056);
    lid.add(screenMesh);
    g.add(lid);

    // soft glow from the display onto the desk
    const glow = new THREE.PointLight('#8fb8ff', 0.6, 1.2, 2);
    glow.position.set(0, 0.15, 0.05);
    g.add(glow);

    scene.add(g);

    const state = { repos: [], t: 0 };
    const drawScreen = () => {
        const { ctx } = screen;
        const w = 1024, h = 640;
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#161b22';
        ctx.fillRect(0, 0, w, 44);
        ['#ff5f56', '#ffbd2e', '#27c93f'].forEach((c, i) => {
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(28 + i * 26, 22, 8, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.fillStyle = '#8b949e';
        ctx.font = '22px ui-monospace, Menlo, monospace';
        ctx.fillText('thomas@office: ~/projects', 380, 30);

        ctx.font = '28px ui-monospace, Menlo, monospace';
        let y = 96;
        ctx.fillStyle = '#7ee787';
        ctx.fillText('$ ls ~/projects', 32, y);
        y += 44;
        const names = state.repos.length ? state.repos.slice(0, 9).map(r => r.name) : ['loading…'];
        names.forEach((n, i) => {
            ctx.fillStyle = ['#79c0ff', '#d2a8ff', '#ffa657'][i % 3];
            ctx.fillText(n + '/', 32 + (i % 2) * 480, y);
            if (i % 2 === 1) y += 40;
        });
        if (names.length % 2 === 1) y += 40;
        y += 24;
        ctx.fillStyle = '#7ee787';
        const cursor = Math.floor(state.t * 2) % 2 === 0 ? '█' : ' ';
        ctx.fillText('$ open laptop to explore ' + cursor, 32, y);
        screen.tex.needsUpdate = true;
    };
    drawScreen();

    return {
        group: g,
        screenMesh,
        setRepos(repos) { state.repos = repos; drawScreen(); },
        update(t) {
            const tick = Math.floor(t * 2);
            if (tick !== Math.floor(state.t * 2)) { state.t = t; drawScreen(); }
            state.t = t;
        },
    };
}

// ---------- Resume paper ----------

function drawResumePage(ctx, w, h) {
    ctx.fillStyle = '#fbfaf6';
    ctx.fillRect(0, 0, w, h);
    const pad = 70;
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.fillText(RESUME.name, w / 2, 110);
    ctx.font = '22px Georgia, serif';
    ctx.fillText(RESUME.contact.map(c => c.label).join('  |  '), w / 2, 148);
    ctx.textAlign = 'left';

    let y = 210;
    const section = (title) => {
        ctx.font = 'bold 28px Georgia, serif';
        ctx.fillStyle = '#111';
        ctx.fillText(title.toUpperCase(), pad, y);
        ctx.fillRect(pad, y + 8, w - pad * 2, 2);
        y += 44;
    };
    const body = (text, indent = 0) => {
        ctx.font = '19px Georgia, serif';
        ctx.fillStyle = '#222';
        y = wrapText(ctx, text, pad + indent, y, w - pad * 2 - indent, 24);
    };
    const head = (left, right) => {
        ctx.font = 'bold 21px Georgia, serif';
        ctx.fillStyle = '#111';
        ctx.fillText(left, pad, y);
        ctx.textAlign = 'right';
        ctx.font = '19px Georgia, serif';
        ctx.fillText(right, w - pad, y);
        ctx.textAlign = 'left';
        y += 26;
    };

    section('Education');
    head(RESUME.education.school, RESUME.education.when);
    body(RESUME.education.degree);
    y += 14;
    section('Experience');
    for (const e of RESUME.experience) {
        head(e.role, e.when);
        ctx.font = 'italic 19px Georgia, serif';
        ctx.fillText(e.org, pad, y);
        y += 26;
        for (const b of e.bullets) body('• ' + b, 16);
        y += 10;
    }
    section('Projects');
    for (const p of RESUME.projects) {
        if (y > h - 80) break;
        head(p.name, p.when);
        for (const b of p.bullets) {
            if (y > h - 60) break;
            body('• ' + b, 16);
        }
        y += 8;
    }
}

function buildPaper(scene) {
    const g = new THREE.Group();
    g.position.set(0.42, DESK_Y + 0.002, -1.85);
    g.rotation.y = -0.22;
    const { tex } = canvasTexture(1024, 1325, drawResumePage);

    // a second sheet underneath, slightly offset, for depth
    const under = new THREE.Mesh(new THREE.PlaneGeometry(0.216, 0.279), mat('#efece4', { roughness: 0.95 }));
    under.rotation.x = -Math.PI / 2;
    under.rotation.z = 0.08;
    under.position.set(0.012, 0, -0.008);
    under.receiveShadow = true;
    g.add(under);

    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.216, 0.279), mat('#ffffff', { map: tex, roughness: 0.9 }));
    sheet.rotation.x = -Math.PI / 2;
    sheet.position.y = 0.0015;
    sheet.receiveShadow = true;
    g.add(sheet);

    // a pen resting on the page
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.14, 12), mat('#1d3557', { roughness: 0.3, metalness: 0.4 }));
    pen.rotation.z = Math.PI / 2;
    pen.rotation.y = 0.6;
    pen.position.set(0.09, 0.006, 0.08);
    pen.castShadow = true;
    g.add(pen);

    scene.add(g);
    return { group: g };
}

// ---------- Lamp, mug, plant ----------

function buildLamp(scene) {
    const g = new THREE.Group();
    g.position.set(0.78, DESK_Y, -2.22);
    const m = mat('#d97706', { roughness: 0.4, metalness: 0.3 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.02, 32), m);
    base.position.y = 0.01;
    base.castShadow = true;
    g.add(base);
    // a rod running between two points
    const rod = (a, b) => {
        const dir = new THREE.Vector3().subVectors(b, a);
        const r = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, dir.length(), 10), m);
        r.position.copy(a).addScaledVector(dir, 0.5);
        r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        r.castShadow = true;
        g.add(r);
    };
    const joint = (p) => {
        const j = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 12), m);
        j.position.copy(p);
        g.add(j);
    };
    const foot = new THREE.Vector3(0, 0.02, 0);
    const elbow = new THREE.Vector3(0.04, 0.34, 0.04);
    const head = new THREE.Vector3(-0.1, 0.45, 0.1);
    rod(foot, elbow);
    rod(elbow, head);
    joint(elbow);
    joint(head);

    // cone opening tilted down and toward the desk (-x, +z)
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.12, 32, 1, true), mat('#d97706', { side: THREE.DoubleSide, roughness: 0.4 }));
    const aim = new THREE.Vector3(-0.5, -0.8, 0.35).normalize();
    shade.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), aim);
    shade.position.copy(head).addScaledVector(aim, 0.05);
    shade.castShadow = true;
    g.add(shade);
    const bulbPos = head.clone().addScaledVector(aim, 0.08);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), new THREE.MeshBasicMaterial({ color: '#fff2c6' }));
    bulb.position.copy(bulbPos);
    g.add(bulb);

    const light = new THREE.SpotLight('#ffd59a', 6, 3.5, 0.9, 0.6, 1.4);
    light.position.copy(bulbPos);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.bias = -0.0005;
    g.add(light);
    light.target.position.set(-0.4, 0, 0.35); // the resume on the desk
    g.add(light.target);

    scene.add(g);
    return {
        group: g,
        toggle() {
            light.visible = !light.visible;
            bulb.material.color.set(light.visible ? '#fff2c6' : '#555');
            return light.visible;
        },
    };
}

function buildMug(scene) {
    const g = new THREE.Group();
    g.position.set(0.18, DESK_Y, -2.22);
    const m = mat('#f3efe7', { roughness: 0.4 });
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.1, 24, 1, true), m);
    cup.position.y = 0.05;
    cup.castShadow = true;
    m.side = THREE.DoubleSide;
    g.add(cup);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.035, 24), m);
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = 0.002;
    g.add(bottom);
    const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.038, 24), mat('#3b2314', { roughness: 0.2 }));
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.y = 0.085;
    g.add(coffee);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 8, 16, Math.PI), m);
    handle.position.set(0.042, 0.05, 0);
    handle.rotation.z = -Math.PI / 2;
    g.add(handle);

    // steam: a few drifting translucent sprites
    const steamTex = canvasTexture(64, 64, (ctx) => {
        const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grd.addColorStop(0, 'rgba(255,255,255,0.6)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 64, 64);
    }).tex;
    const puffs = [];
    for (let i = 0; i < 6; i++) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false }));
        s.userData.phase = i / 6;
        g.add(s);
        puffs.push(s);
    }
    scene.add(g);
    return {
        update(t) {
            for (const s of puffs) {
                const p = (t * 0.25 + s.userData.phase) % 1;
                s.position.set(Math.sin(p * 6 + s.userData.phase * 10) * 0.012, 0.1 + p * 0.18, 0);
                const sc = 0.03 + p * 0.06;
                s.scale.set(sc, sc, sc);
                s.material.opacity = Math.sin(p * Math.PI) * 0.5;
            }
        },
    };
}

function buildPlant(scene) {
    const g = new THREE.Group();
    g.position.set(1.55, 0, -2.15);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.32, 24), mat('#c06b46', { roughness: 0.9 }));
    pot.position.y = 0.16;
    pot.castShadow = true;
    g.add(pot);
    const leafMat = mat('#3f7d4e', { roughness: 0.7, side: THREE.DoubleSide });
    for (let i = 0; i < 14; i++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), leafMat);
        leaf.scale.set(0.35, 1.6, 0.12);
        const a = (i / 14) * Math.PI * 2;
        const tilt = 0.35 + (i % 3) * 0.2;
        leaf.position.set(Math.cos(a) * 0.08, 0.5 + (i % 4) * 0.05, Math.sin(a) * 0.08);
        leaf.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt);
        leaf.castShadow = true;
        g.add(leaf);
    }
    scene.add(g);
    return {
        update(t) { g.rotation.z = Math.sin(t * 0.6) * 0.01; },
    };
}

// ---------- Bookshelf ----------

function spineTexture(book, w, h) {
    // texture is drawn upright then mapped onto the tall, thin spine face
    return canvasTexture(128, 512, (ctx, cw, ch) => {
        ctx.fillStyle = book.color;
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(0, 28, cw, 6);
        ctx.fillRect(0, ch - 34, cw, 6);
        ctx.save();
        ctx.translate(cw / 2, ch / 2);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = '#f5ecd7';
        const label = book.short || book.title;
        let size = 54;
        ctx.font = `bold ${size}px Georgia, serif`;
        while (ctx.measureText(label).width > ch - 90 && size > 20) {
            size -= 2;
            ctx.font = `bold ${size}px Georgia, serif`;
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 0);
        ctx.restore();
    }).tex;
}

function buildBookshelf(scene) {
    const g = new THREE.Group();
    g.position.set(-1.95, 0, -2.32);
    const wood = woodTexture('#6e4a32', '#2e1b10');
    const m = mat('#ffffff', { map: wood, roughness: 0.75 });
    const W = 1.1, H = 1.95, D = 0.32, T = 0.03;

    const backPanel = box(W, H, 0.015, mat('#5a3b27', { roughness: 0.9 }));
    backPanel.position.set(0, H / 2, -D / 2 + 0.008);
    g.add(backPanel);
    for (const x of [-W / 2 + T / 2, W / 2 - T / 2]) {
        const side = box(T, H, D, m);
        side.position.set(x, H / 2, 0);
        g.add(side);
    }
    const shelfYs = [0.08, 0.5, 0.92, 1.34, H - T / 2];
    for (const y of shelfYs) {
        const s = box(W, T, D, m);
        s.position.set(0, y, 0);
        g.add(s);
    }

    // lay books onto the three upper usable shelves, left to right
    const books = [];
    const rows = [shelfYs[3], shelfYs[2], shelfYs[1]];
    // spread books evenly across the rows, leaving room for a bookend/plant on each
    const perRow = Math.ceil(BOOKS.length / rows.length);
    const rowStart = [-W / 2 + T + 0.03, -W / 2 + T + 0.28, -W / 2 + T + 0.06];
    let row = -1;
    let x = 0;
    BOOKS.forEach((book, i) => {
        const thick = 0.035 + ((i * 37) % 5) * 0.007;
        const height = 0.24 + ((i * 53) % 4) * 0.025;
        const depth = 0.2 + ((i * 17) % 3) * 0.02;
        if (i % perRow === 0) {
            row++;
            x = rowStart[row % rowStart.length];
        }
        if (row >= rows.length || x + thick > W / 2 - T - 0.03) return;
        const coverMat = mat(book.color, { roughness: 0.6 });
        const pagesMat = mat('#efe6d2', { roughness: 0.95 });
        const spineMat = mat('#ffffff', { map: spineTexture(book), roughness: 0.6 });
        // box face order: +x, -x, +y, -y, +z (spine, facing out), -z
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(thick, height, depth), [coverMat, coverMat, pagesMat, pagesMat, spineMat, pagesMat]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const lean = (i % 7 === 6) ? 0.12 : 0;
        mesh.position.set(x + thick / 2, rows[row] + T / 2 + height / 2, -D / 2 + depth / 2 + 0.03);
        mesh.rotation.z = lean;
        mesh.userData = { book, index: i, home: mesh.position.clone(), homeRot: mesh.rotation.clone() };
        g.add(mesh);
        books.push(mesh);
        x += thick + 0.003 + (lean ? 0.03 : 0);
    });

    // fill the gaps: a succulent, a lying stack, a little frame
    const rowY = (r) => rows[r] + T / 2;
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.08, 16), mat('#e9e2d6', { roughness: 0.6 }));
    pot.position.set(W / 2 - 0.14, rowY(0) + 0.04, 0);
    pot.castShadow = true;
    g.add(pot);
    for (let i = 0; i < 7; i++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), mat('#6a9e6f', { roughness: 0.6 }));
        const a = (i / 7) * Math.PI * 2;
        leaf.scale.set(0.6, 1.4, 0.6);
        leaf.position.set(W / 2 - 0.14 + Math.cos(a) * 0.025, rowY(0) + 0.11, Math.sin(a) * 0.025);
        leaf.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
        g.add(leaf);
    }
    ['#3a5a40', '#9c6644', '#264653'].forEach((c, i) => {
        const b = box(0.2 - i * 0.015, 0.035, 0.16, mat(c, { roughness: 0.6 }));
        b.position.set(-W / 2 + T + 0.13, rowY(1) + 0.0175 + i * 0.035, 0.01);
        b.rotation.y = (i - 1) * 0.08;
        g.add(b);
    });
    const frame = box(0.14, 0.18, 0.015, mat('#2b2b2b'));
    frame.position.set(W / 2 - 0.15, rowY(2) + 0.09, -0.04);
    frame.rotation.x = -0.12;
    g.add(frame);
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.15), mat('#9cc3d5', { roughness: 0.4 }));
    photo.position.set(W / 2 - 0.15, rowY(2) + 0.09, -0.031);
    photo.rotation.x = -0.12;
    g.add(photo);

    // bottom shelf: a few decorative items
    const box1 = box(0.3, 0.22, 0.24, mat('#2f3a45'), 0.01);
    box1.position.set(-0.3, shelfYs[0] + T / 2 + 0.11, 0);
    g.add(box1);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), mat('#3c6e8f', { roughness: 0.5 }));
    globe.position.set(0.25, shelfYs[0] + T / 2 + 0.16, 0);
    globe.castShadow = true;
    g.add(globe);
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.05, 16), mat('#8a6d1f', { metalness: 0.6, roughness: 0.4 }));
    stand.position.set(0.25, shelfYs[0] + T / 2 + 0.025, 0);
    g.add(stand);

    const shelfLight = new THREE.PointLight('#ffe0b0', 1.4, 2.2, 1.5);
    shelfLight.position.set(0.1, 1.5, 0.7);
    g.add(shelfLight);

    scene.add(g);
    return { group: g, books, globe };
}

// ---------- Corkboard (contact) ----------

function buildCorkboard(scene) {
    const g = new THREE.Group();
    g.position.set(1.45, 1.55, -2.48);
    const frame = box(0.72, 0.52, 0.03, mat('#6e4a32'));
    g.add(frame);
    const corkTex = canvasTexture(256, 256, (ctx, w, h) => {
        ctx.fillStyle = '#b98a5a';
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 2500; i++) {
            ctx.fillStyle = Math.random() < 0.5 ? 'rgba(80,50,20,0.25)' : 'rgba(230,200,150,0.25)';
            ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
        }
    }).tex;
    const cork = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.46), mat('#ffffff', { map: corkTex, roughness: 1 }));
    cork.position.z = 0.016;
    g.add(cork);

    const note = (text, color, x, y, rot, size = 0.16) => {
        const { tex } = canvasTexture(256, 256, (ctx, w, h) => {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#222';
            ctx.font = 'bold 40px "Comic Sans MS", "Marker Felt", cursive';
            ctx.textAlign = 'center';
            text.split('\n').forEach((l, i, arr) => ctx.fillText(l, w / 2, h / 2 + (i - (arr.length - 1) / 2) * 48 + 14));
        });
        const n = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat('#ffffff', { map: tex, roughness: 0.9 }));
        n.position.set(x, y, 0.02);
        n.rotation.z = rot;
        g.add(n);
        const pin = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), mat('#c0392b', { roughness: 0.3 }));
        pin.position.set(x, y + size * 0.38, 0.03);
        g.add(pin);
    };
    note('say hi →\ncontact', '#ffe066', -0.16, 0.06, 0.06, 0.19);
    note('ship\nit', '#9be7c4', 0.12, 0.1, -0.08);
    note('p95 <\n50ms', '#ffb3c1', 0.18, -0.12, 0.1, 0.13);

    scene.add(g);
    return { group: g };
}

// ---------- Lighting ----------

function buildLights(scene, sky) {
    scene.add(new THREE.HemisphereLight('#fff4e6', '#4a3428', sky.ambient + 0.15));
    const sun = new THREE.DirectionalLight(sky.stars ? '#9fb4ff' : '#ffe2b8', 0.4 + sky.sun * 1.6);
    sun.position.set(0.5, 2.6, -1.4); // falls through the window onto the desk
    sun.target.position.set(0, 0, -0.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -3;
    sun.shadow.camera.right = 3;
    sun.shadow.camera.top = 3;
    sun.shadow.camera.bottom = -3;
    sun.shadow.bias = -0.0004;
    scene.add(sun, sun.target);

    // warm fill from the "room" side so the front of objects isn't black
    const fill = new THREE.PointLight('#ffd7a8', 0.9 + sky.ambient, 9, 1.6);
    fill.position.set(1.5, 2.4, 1.5);
    scene.add(fill);
}

export function buildOffice(scene) {
    const sky = skyForHour(new Date().getHours());
    scene.background = new THREE.Color('#1a1410');
    scene.fog = new THREE.Fog('#1a1410', 6, 14);

    buildRoom(scene);
    buildWindow(scene, sky);
    buildLights(scene, sky);
    buildDesk(scene);

    return {
        sky,
        laptop: buildLaptop(scene),
        paper: buildPaper(scene),
        lamp: buildLamp(scene),
        mug: buildMug(scene),
        plant: buildPlant(scene),
        shelf: buildBookshelf(scene),
        cork: buildCorkboard(scene),
    };
}
