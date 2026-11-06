import * as THREE from 'three';

// The view out the window: a Manhattan skyline painted on a canvas, plus a
// season layer (a branch in the foreground and particles drifting past).

export const SEASONS = ['spring', 'summer', 'fall', 'winter'];
export const TIMES = ['sunrise', 'day', 'golden hour', 'night'];

export function seasonForDate(d = new Date()) {
    const m = d.getMonth(); // northern hemisphere
    if (m >= 2 && m <= 4) return 'spring';
    if (m >= 5 && m <= 7) return 'summer';
    if (m >= 8 && m <= 10) return 'fall';
    return 'winter';
}

export function timeForHour(h) {
    if (h >= 20 || h < 5) return 'night';
    if (h < 7) return 'sunrise';
    if (h < 17) return 'day';
    return 'golden hour';
}

// Lighting + palette for each time of day. `sun` and `ambient` drive the room lights.
const SKIES = {
    sunrise: { top: '#3d4f86', bottom: '#f7a982', city: '#3d3a55', haze: '#8a7d99', sun: 0.55, ambient: 0.35, night: false },
    day: { top: '#4f9fe0', bottom: '#d6ecff', city: '#566a84', haze: '#9fb6cd', sun: 1.0, ambient: 0.55, night: false },
    'golden hour': { top: '#4a3f7c', bottom: '#ff9a5e', city: '#2f2740', haze: '#7b5a74', sun: 0.6, ambient: 0.35, night: false },
    night: { top: '#050817', bottom: '#1d2552', city: '#080b17', haze: '#161c36', sun: 0.0, ambient: 0.18, night: true },
};

export function skyFor(time) {
    return { ...SKIES[time], label: time };
}

// Deterministic randomness so the skyline doesn't reshuffle every redraw.
function rng(seed) {
    return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
}

// ---------- Skyline ----------

// Landmarks are drawn as paths at x (fraction of width) with heights as a fraction of the canvas height.
function drawLandmarks(ctx, W, H, base, color) {
    const u = H; // vertical unit
    ctx.fillStyle = color;
    const poly = (pts) => {
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.fill();
    };
    const rects = [];

    // One World Trade Center — tapered faces, square top, spire
    {
        const x = W * 0.16, w = W * 0.07, top = base - u * 0.55;
        poly([[x - w / 2, base], [x + w / 2, base], [x + w * 0.2, top], [x - w * 0.2, top]]);
        ctx.fillRect(x - w * 0.24, top - u * 0.015, w * 0.48, u * 0.015);
        ctx.fillRect(x - 2, top - u * 0.14, 4, u * 0.14);
        rects.push([x - w * 0.3, top + u * 0.05, w * 0.6, base - top - u * 0.05]);
    }
    // 30 Hudson Yards — slanted top with the observation wedge
    {
        const x = W * 0.29, w = W * 0.05, top = base - u * 0.4;
        poly([[x - w / 2, base], [x + w / 2, base], [x + w / 2, top], [x - w / 2, top + u * 0.04]]);
        ctx.fillRect(x + w / 2 - 2, top + u * 0.005, w * 0.25, u * 0.008);
        rects.push([x - w / 2, top + u * 0.05, w, base - top - u * 0.05]);
    }
    // Empire State Building — stepped setbacks, mast and antenna
    {
        const x = W * 0.47;
        const tiers = [[0.1, 0.1], [0.065, 0.3], [0.05, 0.36], [0.034, 0.4], [0.02, 0.43], [0.01, 0.48]];
        for (const [w, h] of tiers) ctx.fillRect(x - (W * w) / 2, base - u * h, W * w, u * h);
        ctx.fillRect(x - 2, base - u * 0.56, 4, u * 0.08);
        rects.push([x - W * 0.03, base - u * 0.3, W * 0.06, u * 0.2]);
    }
    // Chrysler Building — shaft, terraced sunburst crown, needle
    {
        const x = W * 0.61, w = W * 0.04, shaft = base - u * 0.33;
        ctx.fillRect(x - w / 2, shaft, w, base - shaft);
        ctx.fillRect(x - w * 0.75, base - u * 0.18, w * 1.5, u * 0.18);
        let cw = w, cy = shaft;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(x - cw / 2, cy);
            ctx.quadraticCurveTo(x - cw / 2, cy - u * 0.028, x, cy - u * 0.034);
            ctx.quadraticCurveTo(x + cw / 2, cy - u * 0.028, x + cw / 2, cy);
            ctx.fill();
            cy -= u * 0.022;
            cw *= 0.76;
        }
        ctx.fillRect(x - 1.5, cy - u * 0.07, 3, u * 0.08);
        rects.push([x - w / 2, shaft + u * 0.02, w, base - shaft]);
    }
    // 432 Park Avenue — pencil-thin grid tower
    {
        const x = W * 0.72, w = W * 0.024, top = base - u * 0.5;
        ctx.fillRect(x - w / 2, top, w, base - top);
        rects.push([x - w / 2, top, w, base - top]);
    }
    // Central Park Tower / Steinway — a slim pair
    {
        const x = W * 0.79;
        ctx.fillRect(x - W * 0.02, base - u * 0.47, W * 0.04, u * 0.47);
        ctx.fillRect(x + W * 0.035, base - u * 0.44, W * 0.016, u * 0.44);
        poly([[x + W * 0.035, base - u * 0.44], [x + W * 0.051, base - u * 0.44], [x + W * 0.051, base - u * 0.46]]);
        rects.push([x - W * 0.02, base - u * 0.47, W * 0.04, u * 0.47]);
    }
    return rects;
}

function drawSkyline(ctx, W, H, sky, season) {
    const r = rng(42);
    const base = H * 0.84; // waterline

    // sky
    const g = ctx.createLinearGradient(0, 0, 0, base);
    g.addColorStop(0, sky.top);
    g.addColorStop(1, sky.bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    if (season === 'winter' && !sky.night) {
        ctx.fillStyle = 'rgba(220,226,235,0.45)'; // overcast
        ctx.fillRect(0, 0, W, H);
    }

    if (sky.night) {
        const sr = rng(7);
        for (let i = 0; i < 220; i++) {
            ctx.fillStyle = `rgba(255,255,255,${0.25 + sr() * 0.6})`;
            ctx.beginPath();
            ctx.arc(sr() * W, sr() * base * 0.6, sr() * 2.2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#f4f1e1';
        ctx.shadowColor = '#f4f1e1';
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.arc(W * 0.86, H * 0.16, 46, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    } else {
        // the sun sits low near the horizon except at midday
        const big = season === 'summer' ? 2 : 1;
        if (season === 'summer' && sky.label === 'day') {
            const deep = ctx.createLinearGradient(0, 0, 0, base);
            deep.addColorStop(0, '#2f86d6');
            deep.addColorStop(1, '#bfe3ff');
            ctx.fillStyle = deep;
            ctx.fillRect(0, 0, W, base);
        }
        const sx = sky.label === 'sunrise' ? W * 0.9 : sky.label === 'golden hour' || season === 'summer' ? W * 0.08 : W * 0.86;
        const sy = sky.label === 'day' ? H * 0.14 : base - H * 0.18;
        const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 260 * big);
        halo.addColorStop(0, 'rgba(255,240,200,0.9)');
        halo.addColorStop(0.25, 'rgba(255,220,150,0.35)');
        halo.addColorStop(1, 'rgba(255,220,150,0)');
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, W, H);
        if (season === 'summer') {
            ctx.save();
            ctx.translate(sx, sy);
            ctx.fillStyle = 'rgba(255,236,170,0.22)';
            for (let i = 0; i < 14; i++) {
                ctx.rotate((Math.PI * 2) / 14);
                ctx.beginPath();
                ctx.moveTo(-14, 0);
                ctx.lineTo(0, -420);
                ctx.lineTo(14, 0);
                ctx.fill();
            }
            ctx.restore();
        }
        ctx.fillStyle = sky.label === 'day' ? '#fffbe8' : '#ffd9a0';
        ctx.beginPath();
        ctx.arc(sx, sy, 48 * big, 0, Math.PI * 2);
        ctx.fill();
    }

    // far haze layer
    ctx.fillStyle = sky.haze;
    for (let x = 0; x < W; ) {
        const bw = 30 + r() * 60, bh = H * (0.08 + r() * 0.16);
        ctx.fillRect(x, base - bh, bw - 3, bh);
        x += bw;
    }

    // skyline into its own layer so it can be mirrored onto the water
    const layer = document.createElement('canvas');
    layer.width = W;
    layer.height = H;
    const lc = layer.getContext('2d');
    const rects = [];
    lc.fillStyle = sky.city;
    for (let x = 0; x < W; ) {
        const bw = 40 + r() * 80, bh = H * (0.06 + r() * 0.2);
        lc.fillRect(x, base - bh, bw - 4, bh);
        rects.push([x, base - bh, bw - 4, bh]);
        x += bw;
    }
    rects.push(...drawLandmarks(lc, W, H, base, sky.city));

    if (season === 'winter') {
        lc.fillStyle = sky.night ? '#9aa6c4' : '#f4f7fb';
        for (const [x, y, w] of rects) lc.fillRect(x, y - 3, w, 6);
    }
    if (sky.night || sky.label === 'golden hour') {
        const wr = rng(99);
        const odds = sky.night ? 0.32 : 0.1;
        for (const [x, y, w, h] of rects) {
            for (let wy = y + 8; wy < base - 6; wy += 13) {
                for (let wx = x + 5; wx < x + w - 6; wx += 10) {
                    if (wr() < odds) {
                        lc.fillStyle = wr() < 0.8 ? '#ffd27a' : '#cfe3ff';
                        lc.fillRect(wx, wy, 4, 6);
                    }
                }
            }
        }
        // Empire State's lit top
        if (sky.night) {
            const x = W * 0.47;
            lc.fillStyle = { spring: '#f7a8c8', summer: '#ffffff', fall: '#ff9b42', winter: '#7fb8ff' }[season];
            lc.fillRect(x - W * 0.017, base - H * 0.43, W * 0.034, H * 0.03);
            lc.fillRect(x - W * 0.01, base - H * 0.48, W * 0.02, H * 0.05);
        }
    }
    ctx.drawImage(layer, 0, 0);

    // the river, with a broken reflection of the skyline
    const water = ctx.createLinearGradient(0, base, 0, H);
    water.addColorStop(0, sky.night ? '#0c1330' : sky.haze);
    water.addColorStop(1, sky.night ? '#03050c' : sky.city);
    ctx.fillStyle = water;
    ctx.fillRect(0, base, W, H - base);
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.translate(0, base * 2);
    ctx.scale(1, -1);
    for (let y = base; y > base - (H - base) * 1.2; y -= 8) {
        const off = Math.sin(y * 0.3) * 6;
        ctx.drawImage(layer, 0, y, W, 5, off, y, W, 5);
    }
    ctx.restore();
    if (season === 'winter') {
        ctx.fillStyle = 'rgba(235,240,248,0.25)'; // ice floes
        const ir = rng(5);
        for (let i = 0; i < 18; i++) ctx.fillRect(ir() * W, base + ir() * (H - base), 40 + ir() * 120, 4);
    }
}

// ---------- Foreground branch ----------

function drawBranch(ctx, W, H, season, sky) {
    const r = rng(11);
    const bark = sky.night ? '#120d0a' : '#3b2a1f';
    const twigs = [];

    const limb = (x0, y0, x1, y1, cx, cy, width, depth) => {
        ctx.strokeStyle = bark;
        ctx.lineCap = 'round';
        const steps = 14;
        let px = x0, py = y0;
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1;
            const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1;
            ctx.lineWidth = width * (1 - t * 0.75);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(x, y);
            ctx.stroke();
            if (i > 3) twigs.push([x, y, ctx.lineWidth]);
            if (depth > 0 && i % 5 === 0) {
                const a = (r() - 0.3) * 1.6;
                const len = W * (0.06 + r() * 0.08) * (depth / 2);
                limb(x, y, x - Math.cos(a) * len, y + Math.sin(a) * len + len * 0.4, x - len * 0.4, y + len * 0.1, ctx.lineWidth * 0.7, depth - 1);
            }
            px = x;
            py = y;
        }
    };
    limb(W + 30, H * 0.0, W * 0.56, H * 0.4, W * 0.8, H * 0.06, 54, 2);

    const blob = (x, y, rad, color, ang = 0, sx = 1, sy = 0.55) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        ctx.scale(sx, sy);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };
    const dim = sky.night ? 0.45 : 1;
    const shade = (hex) => {
        const n = parseInt(hex.slice(1), 16);
        const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.round(v * dim));
        return `rgb(${c.join(',')})`;
    };

    for (const [x, y, w] of twigs) {
        if (season === 'spring') {
            if (r() < 0.55) {
                // five-petal blossom
                const pr = 16 + r() * 12;
                for (let p = 0; p < 5; p++) {
                    const a = (p / 5) * Math.PI * 2;
                    blob(x + Math.cos(a) * pr * 0.7, y + Math.sin(a) * pr * 0.7, pr * 0.65, shade(r() < 0.5 ? '#f9c5d8' : '#fbe3ec'), a, 1, 0.8);
                }
                blob(x, y, pr * 0.3, shade('#e0779d'), 0, 1, 1);
            } else if (r() < 0.6) {
                blob(x + 8, y - 6, 12, shade('#8fc46a'), r() * 3, 1, 0.6); // bud
            }
        } else if (season === 'summer') {
            for (let k = 0; k < 2; k++) {
                const a = r() * Math.PI * 2;
                blob(x + Math.cos(a) * 22, y + Math.sin(a) * 22, 30 + r() * 14, shade(['#2f6d3a', '#3d8a47', '#4f9e52'][Math.floor(r() * 3)]), a, 1, 0.45);
            }
        } else if (season === 'fall') {
            if (r() < 0.45) {
                const a = r() * Math.PI * 2;
                blob(x + Math.cos(a) * 18, y + Math.sin(a) * 18, 24 + r() * 12, shade(['#d9622b', '#e8a33d', '#b8402a', '#f2c14e'][Math.floor(r() * 4)]), a, 1, 0.5);
            }
        } else if (season === 'winter') {
            // snow resting on the top of each twig
            ctx.fillStyle = sky.night ? '#b8c2da' : '#ffffff';
            ctx.beginPath();
            ctx.ellipse(x, y - w * 0.5, w * 0.9 + 2, w * 0.35 + 2, 0, Math.PI, 0);
            ctx.fill();
        }
    }

    if (season === 'winter') {
        // drift piled against the bottom of the glass
        ctx.fillStyle = sky.night ? '#aab4cc' : '#f6f8fb';
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += W / 12) ctx.lineTo(x, H - 30 - Math.sin(x * 0.006) * 18 - r() * 10);
        ctx.lineTo(W, H);
        ctx.fill();
    }
}

// ---------- Particles ----------

function particleTexture(season, night) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    if (season === 'winter') {
        const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
        grd.addColorStop(0, 'rgba(255,255,255,1)');
        grd.addColorStop(0.5, 'rgba(255,255,255,0.8)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 64, 64);
    } else if (season === 'spring') {
        ctx.fillStyle = '#f9c5d8';
        ctx.beginPath();
        ctx.ellipse(32, 32, 26, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e88fb1';
        ctx.fillRect(10, 30, 20, 3);
    } else if (season === 'fall') {
        ctx.fillStyle = '#ffffff'; // tinted per-sprite
        ctx.beginPath();
        ctx.moveTo(32, 2);
        ctx.quadraticCurveTo(62, 26, 32, 62);
        ctx.quadraticCurveTo(2, 26, 32, 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(32, 6);
        ctx.lineTo(32, 60);
        ctx.stroke();
    } else {
        // summer: drifting pollen by day, fireflies at night
        const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
        grd.addColorStop(0, night ? 'rgba(220,255,120,1)' : 'rgba(255,248,210,0.95)');
        grd.addColorStop(0.3, night ? 'rgba(200,255,90,0.6)' : 'rgba(255,240,180,0.4)');
        grd.addColorStop(1, 'rgba(255,240,180,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

const PARTICLE_SETUP = {
    winter: { count: 160, size: [0.012, 0.035], fall: [0.12, 0.3], sway: 0.05, spin: 0 },
    spring: { count: 34, size: [0.025, 0.04], fall: [0.06, 0.12], sway: 0.15, spin: 1.2 },
    fall: { count: 26, size: [0.04, 0.065], fall: [0.1, 0.2], sway: 0.2, spin: 1.8 },
    summer: { count: 40, size: [0.015, 0.03], fall: [-0.02, 0.02], sway: 0.06, spin: 0 },
};

// ---------- The window itself ----------

export function buildOutside(parent, width, height, clipPlanes) {
    const CW = 2048;
    const CH = Math.round((CW * height) / width);
    const canvas = document.createElement('canvas');
    canvas.width = CW;
    canvas.height = CH;
    const ctx = canvas.getContext('2d');
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const view = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: tex }));
    view.position.z = 0.003;
    parent.add(view);

    const particles = new THREE.Group();
    particles.position.z = 0.012;
    parent.add(particles);
    let sprites = [];
    let setup = null;
    let season = null;

    function set(nextSeason, sky) {
        season = nextSeason;
        drawSkyline(ctx, CW, CH, sky, season);
        drawBranch(ctx, CW, CH, season, sky);
        tex.needsUpdate = true;

        for (const s of sprites) {
            particles.remove(s);
            s.material.dispose();
        }
        setup = PARTICLE_SETUP[season];
        const ptex = particleTexture(season, sky.night);
        const r = rng(3);
        sprites = Array.from({ length: setup.count }, () => {
            const m = new THREE.SpriteMaterial({ map: ptex, transparent: true, depthWrite: false, clippingPlanes: clipPlanes });
            if (season === 'fall') m.color.set(['#d9622b', '#e8a33d', '#b8402a', '#f2c14e'][Math.floor(r() * 4)]);
            if (sky.night && season !== 'summer') m.color.multiplyScalar(0.6);
            const s = new THREE.Sprite(m);
            const size = setup.size[0] + r() * (setup.size[1] - setup.size[0]);
            s.scale.set(size, size, 1);
            s.position.set((r() - 0.5) * width, (r() - 0.5) * height, r() * 0.01);
            s.userData = {
                speed: setup.fall[0] + r() * (setup.fall[1] - setup.fall[0]),
                phase: r() * Math.PI * 2,
                spin: (r() - 0.5) * setup.spin,
            };
            particles.add(s);
            return s;
        });
    }

    let last = 0;
    function update(t) {
        const dt = Math.min(0.05, t - last);
        last = t;
        if (!setup) return;
        const hw = width / 2 + 0.05, hh = height / 2 + 0.05;
        for (const s of sprites) {
            const d = s.userData;
            s.position.y -= d.speed * dt;
            s.position.x += Math.sin(t * 0.8 + d.phase) * setup.sway * dt + (season === 'fall' ? 0.04 * dt : 0);
            s.material.rotation += d.spin * dt;
            if (season === 'summer') {
                s.position.y += Math.cos(t * 0.6 + d.phase) * 0.02 * dt;
                s.material.opacity = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + d.phase));
            }
            if (s.position.y < -hh) s.position.y = hh;
            if (s.position.y > hh) s.position.y = -hh;
            if (s.position.x > hw) s.position.x = -hw;
            if (s.position.x < -hw) s.position.x = hw;
        }
    }

    return { set, update };
}
