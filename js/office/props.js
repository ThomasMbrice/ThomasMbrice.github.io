import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { swapInModel } from './assets.js';

// Personal touches: a football by the bookshelf, hiking kit in the back-right
// corner, and a Spurs sticker on the desk.

const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...opts });

function rbox(w, h, d, material, r = 0.02) {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), material);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
}

function cyl(rt, rb, h, material, seg = 16) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
}

// ---------- Football ----------
// The classic 12-pentagon / 20-hexagon panel pattern, computed per pixel:
// pentagons sit on icosahedron vertices, hexagons on its face centres.

function footballMaterial() {
    const m = mat('#ffffff', { roughness: 0.45 });
    m.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\nvarying vec3 vBallDir;')
            .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBallDir = normalize(position);');
        shader.fragmentShader = shader.fragmentShader
            .replace('#include <common>', `#include <common>
varying vec3 vBallDir;
const float PHI = 1.618034;
const float IPHI = 0.618034;
vec3 ico(int i) {
    float s1 = (i & 1) == 0 ? 1.0 : -1.0;
    float s2 = (i & 2) == 0 ? 1.0 : -1.0;
    int k = i / 4;
    vec3 v = k == 0 ? vec3(0.0, s1, s2 * PHI) : k == 1 ? vec3(s1, s2 * PHI, 0.0) : vec3(s2 * PHI, 0.0, s1);
    return normalize(v);
}
vec3 dod(int i) {
    if (i < 8) return normalize(vec3((i & 1) == 0 ? 1.0 : -1.0, (i & 2) == 0 ? 1.0 : -1.0, (i & 4) == 0 ? 1.0 : -1.0));
    int j = i - 8;
    float s1 = (j & 1) == 0 ? 1.0 : -1.0;
    float s2 = (j & 2) == 0 ? 1.0 : -1.0;
    int k = j / 4;
    vec3 v = k == 0 ? vec3(0.0, s1 * IPHI, s2 * PHI) : k == 1 ? vec3(s1 * IPHI, s2 * PHI, 0.0) : vec3(s2 * PHI, 0.0, s1 * IPHI);
    return normalize(v);
}`)
            .replace('#include <color_fragment>', `#include <color_fragment>
{
    vec3 p = normalize(vBallDir);
    float d5 = 10.0;
    for (int i = 0; i < 12; i++) d5 = min(d5, acos(clamp(dot(p, ico(i)), -1.0, 1.0)));
    float h1 = 10.0, h2 = 10.0;
    for (int i = 0; i < 20; i++) {
        float d = acos(clamp(dot(p, dod(i)), -1.0, 1.0));
        if (d < h1) { h2 = h1; h1 = d; } else if (d < h2) { h2 = d; }
    }
    float pent = d5 / 0.794;             // pentagon apothem / hexagon apothem
    float seam = pent < h1 ? h1 - pent : min(pent - h1, h2 - h1);
    vec3 c = pent < h1 ? vec3(0.06) : vec3(0.95);
    c = mix(vec3(0.35), c, smoothstep(0.004, 0.012, seam));
    diffuseColor.rgb *= c;
}`);
    };
    return m;
}

export function buildFootball(scene, position) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 64, 48), footballMaterial());
    ball.position.set(position[0], 0.11, position[2]);
    ball.rotation.set(0.4, 0.8, 0.2);
    ball.castShadow = true;
    ball.receiveShadow = true;
    scene.add(ball);
    return ball;
}

// ---------- Hiking kit ----------

function buildBackpack() {
    const g = new THREE.Group();
    const body = mat('#2f5d50', { roughness: 0.85 });
    const trim = mat('#1d2b26', { roughness: 0.7 });
    const accent = mat('#d9622b', { roughness: 0.7 });

    const main = rbox(0.34, 0.56, 0.22, body, 0.06);
    main.position.y = 0.3;
    g.add(main);
    const lid = rbox(0.33, 0.1, 0.24, trim, 0.04);
    lid.position.set(0, 0.6, 0.01);
    lid.rotation.x = 0.08;
    g.add(lid);
    const pocket = rbox(0.24, 0.24, 0.07, body, 0.04);
    pocket.position.set(0, 0.2, 0.12);
    g.add(pocket);
    const zip = rbox(0.2, 0.012, 0.01, accent, 0.004);
    zip.position.set(0, 0.3, 0.157);
    g.add(zip);
    for (const x of [-0.09, 0.09]) {
        const strap = rbox(0.03, 0.42, 0.012, trim, 0.005);
        strap.position.set(x, 0.33, 0.115);
        g.add(strap);
        const buckle = rbox(0.04, 0.025, 0.02, mat('#111111'), 0.004);
        buckle.position.set(x, 0.44, 0.122);
        g.add(buckle);
    }
    // rolled sleeping mat strapped on top
    const roll = cyl(0.06, 0.06, 0.42, accent, 20);
    roll.rotation.z = Math.PI / 2;
    roll.position.set(0, 0.7, 0);
    g.add(roll);
    for (const x of [-0.12, 0.12]) {
        const band = cyl(0.063, 0.063, 0.02, trim, 20);
        band.rotation.z = Math.PI / 2;
        band.position.set(x, 0.7, 0);
        g.add(band);
    }
    // climbing rope coiled on the front, with a carabiner
    const ropeMat = mat('#2a6fdb', { roughness: 0.9 });
    for (let i = 0; i < 5; i++) {
        const loop = new THREE.Mesh(new THREE.TorusGeometry(0.075 + i * 0.004, 0.009, 8, 32), ropeMat);
        loop.position.set(0.11, 0.1 + i * 0.006, 0.17);
        loop.rotation.set(0.15, 0.4 + i * 0.12, 0);
        loop.castShadow = true;
        g.add(loop);
    }
    const biner = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 8, 20), mat('#d4a017', { metalness: 0.8, roughness: 0.3 }));
    biner.scale.set(0.7, 1.2, 1);
    biner.position.set(-0.09, 0.4, 0.13);
    g.add(biner);
    return g;
}

function buildTrekkingPole(lean) {
    const g = new THREE.Group();
    const shaft = mat('#9aa3ad', { metalness: 0.8, roughness: 0.3 });
    const lower = cyl(0.007, 0.006, 0.6, shaft, 10);
    lower.position.y = 0.3;
    g.add(lower);
    const upper = cyl(0.009, 0.009, 0.55, mat('#c0392b', { metalness: 0.6, roughness: 0.35 }), 10);
    upper.position.y = 0.85;
    g.add(upper);
    const grip = cyl(0.016, 0.014, 0.14, mat('#1a1a1a', { roughness: 0.95 }), 12);
    grip.position.y = 1.17;
    g.add(grip);
    const basket = cyl(0.03, 0.03, 0.008, mat('#1a1a1a'), 12);
    basket.position.y = 0.07;
    g.add(basket);
    g.rotation.z = lean;
    return g;
}

function buildBoot(side) {
    const g = new THREE.Group();
    const leather = mat('#6b4a2f', { roughness: 0.75 });
    const sole = rbox(0.11, 0.03, 0.29, mat('#1b1b1b', { roughness: 0.95 }), 0.012);
    sole.position.set(0, 0.015, 0.01);
    g.add(sole);
    const foot = rbox(0.1, 0.07, 0.26, leather, 0.03);
    foot.position.set(0, 0.06, 0.02);
    g.add(foot);
    const ankle = rbox(0.095, 0.12, 0.12, leather, 0.03);
    ankle.position.set(0, 0.13, -0.06);
    g.add(ankle);
    const cuff = rbox(0.1, 0.025, 0.125, mat('#3a2a1c'), 0.01);
    cuff.position.set(0, 0.195, -0.06);
    g.add(cuff);
    const laceMat = mat('#c0392b');
    for (let i = 0; i < 5; i++) {
        const lace = rbox(0.06, 0.006, 0.008, laceMat, 0.002);
        lace.position.set(0, 0.098 + i * 0.022, 0.06 - i * 0.03);
        lace.rotation.x = -0.6;
        g.add(lace);
    }
    g.rotation.y = side * 0.25;
    return g;
}

export function buildHikingKit(scene, position) {
    const g = new THREE.Group();
    g.position.set(...position);

    const pack = buildBackpack();
    pack.position.set(0, 0, -0.08);
    pack.rotation.set(-0.1, -0.35, 0);
    g.add(pack);

    const pole1 = buildTrekkingPole(-0.16);
    pole1.position.set(0.32, 0, -0.14);
    g.add(pole1);
    const pole2 = buildTrekkingPole(-0.22);
    pole2.position.set(0.37, 0, -0.1);
    g.add(pole2);

    const left = buildBoot(1);
    left.position.set(-0.08, 0, 0.26);
    g.add(left);
    const right = buildBoot(-1);
    right.position.set(0.06, 0, 0.3);
    g.add(right);

    const thermos = new THREE.Group();
    thermos.position.set(-0.28, 0, 0.12);
    g.add(thermos);
    swapInModel(thermos, 'modified_thermos.glb', { fit: 0.28 });

    scene.add(g);
    return g;
}

// ---------- Spurs sticker ----------
// A fan-made COYS sticker (an original cockerel-on-a-ball drawing, not the club crest).

function drawCockerel(ctx, s) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // ball
    ctx.beginPath();
    ctx.arc(0, 0.62 * s, 0.17 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#132257';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        ctx.lineTo(Math.cos(a) * 0.06 * s, 0.62 * s + Math.sin(a) * 0.06 * s);
    }
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    // legs
    ctx.lineWidth = 0.035 * s;
    ctx.beginPath();
    ctx.moveTo(-0.05 * s, 0.2 * s);
    ctx.lineTo(-0.07 * s, 0.46 * s);
    ctx.moveTo(0.06 * s, 0.2 * s);
    ctx.lineTo(0.05 * s, 0.46 * s);
    ctx.stroke();
    // body
    ctx.beginPath();
    ctx.ellipse(0, 0.05 * s, 0.22 * s, 0.18 * s, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // neck + head
    ctx.beginPath();
    ctx.moveTo(-0.16 * s, 0.0);
    ctx.quadraticCurveTo(-0.24 * s, -0.22 * s, -0.17 * s, -0.36 * s);
    ctx.lineTo(-0.05 * s, -0.3 * s);
    ctx.quadraticCurveTo(-0.06 * s, -0.12 * s, 0.02 * s, -0.02 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-0.12 * s, -0.36 * s, 0.075 * s, 0, Math.PI * 2);
    ctx.fill();
    // comb
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(-0.16 * s + i * 0.04 * s, -0.44 * s, 0.028 * s, 0, Math.PI * 2);
        ctx.fill();
    }
    // beak
    ctx.beginPath();
    ctx.moveTo(-0.19 * s, -0.38 * s);
    ctx.lineTo(-0.27 * s, -0.35 * s);
    ctx.lineTo(-0.19 * s, -0.32 * s);
    ctx.fill();
    // tail feathers sweeping up and back
    ctx.lineWidth = 0.045 * s;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0.15 * s, 0.0);
        ctx.quadraticCurveTo((0.3 + i * 0.03) * s, (-0.2 - i * 0.04) * s, (0.2 + i * 0.06) * s, (-0.36 + i * 0.1) * s);
        ctx.stroke();
    }
    // eye
    ctx.fillStyle = '#132257';
    ctx.beginPath();
    ctx.arc(-0.13 * s, -0.37 * s, 0.014 * s, 0, Math.PI * 2);
    ctx.fill();
}

export function buildSpursSticker(scene, position, rotationY = 0) {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const ctx = c.getContext('2d');
    // die-cut white border, navy disc
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(256, 256, 254, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#132257';
    ctx.beginPath();
    ctx.arc(256, 256, 232, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(256, 256, 212, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(256, 222);
    drawCockerel(ctx, 260);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('COYS', 256, 450);
    // arched "TOTTENHAM" across the top
    ctx.font = 'bold 30px Georgia, serif';
    const word = 'TOTTENHAM';
    for (let i = 0; i < word.length; i++) {
        const a = -Math.PI / 2 + (i - (word.length - 1) / 2) * 0.17;
        ctx.save();
        ctx.translate(256 + Math.cos(a) * 180, 256 + Math.sin(a) * 180);
        ctx.rotate(a + Math.PI / 2);
        ctx.fillText(word[i], 0, 10);
        ctx.restore();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const sticker = new THREE.Mesh(
        new THREE.CircleGeometry(0.075, 48),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, polygonOffset: true, polygonOffsetFactor: -2 }),
    );
    sticker.rotation.set(-Math.PI / 2, 0, rotationY);
    sticker.position.set(...position);
    sticker.receiveShadow = true;
    scene.add(sticker);
    return sticker;
}
