// Hero visual: plant roots grow in a petri dish with 5 lanes, then the "model" traces
// each main root and marks its tip, like the cv4 dashboard. Loops with a fresh plate.
(function () {
  const plate = document.getElementById("plate");
  if (!plate) return;
  const rootsCv = plate.querySelector("#roots"), overCv = plate.querySelector("#overlay");
  const rc = rootsCv.getContext("2d"), oc = overCv.getContext("2d");
  const css = getComputedStyle(document.documentElement);
  const INK = css.getPropertyValue("--ink").trim() || "#121212";
  const PAPER = css.getPropertyValue("--plate").trim() || "#f7f5f0";
  const ACCENT = css.getPropertyValue("--accent").trim() || "#ff5a1f";
  const LANES = 5;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, dpr = 1, roots = [], phase = "grow", phaseT = 0, seed = 1, pointer = null, statusEl = document.getElementById("plateStatus");

  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  const lerp = (a, b, t) => a + (b - a) * t;

  function resize() {
    const r = plate.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height;
    for (const c of [rootsCv, overCv]) { c.width = W * dpr; c.height = H * dpr; c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0); }
    reset();
  }

  // A branch is a polyline that grows one step per frame until it reaches maxLen.
  function branch(x, y, angle, maxLen, width, depth, lane) {
    return { pts: [[x, y]], angle, len: 0, maxLen, width, depth, lane, alive: true, wobble: rand() * 100, nextBranch: 18 + rand() * 30 };
  }

  function reset() {
    seed = (Date.now() % 100000) + 7;
    roots = []; phase = "grow"; phaseT = 0;
    rc.fillStyle = PAPER; rc.fillRect(0, 0, W, H);
    const empty = rand() < 0.45 ? Math.floor(rand() * LANES) : -1; // sometimes a lane has no plant
    for (let i = 0; i < LANES; i++) {
      const x = W * (i + 0.5) / LANES + (rand() - 0.5) * W * 0.03;
      const main = branch(x, H * 0.13, Math.PI / 2 + (rand() - 0.5) * 0.25, H * (0.5 + rand() * 0.3), 1.6, 0, i);
      main.main = true; main.empty = i === empty;
      if (main.empty) main.alive = false;
      roots.push(main);
    }
    status(`growing · plate #${1000 + (seed % 9000)}`);
  }

  function status(t) { if (statusEl) statusEl.textContent = t; }

  function step() {
    const spawned = [];
    for (const b of roots) {
      if (!b.alive) continue;
      const speed = b.main ? 1.15 : 0.85;
      // Smooth wandering + gravity pulling roots downwards; pointer gently attracts main roots.
      b.wobble += 0.045;
      let target = Math.PI / 2 + Math.sin(b.wobble) * (b.main ? 0.22 : 0.35);
      if (!b.main) target = lerp(b.angle, Math.PI / 2, 0.012) + Math.sin(b.wobble) * 0.02;
      if (b.main && pointer) {
        const [px, py] = b.pts[b.pts.length - 1], dx = pointer[0] - px, dy = pointer[1] - py;
        if (Math.hypot(dx, dy) < W * 0.25 && dy > 0) target = lerp(target, Math.atan2(dy, dx), 0.35);
      }
      b.angle = b.main ? lerp(b.angle, target, 0.08) : target;
      const [x, y] = b.pts[b.pts.length - 1];
      const nx = x + Math.cos(b.angle) * speed, ny = y + Math.sin(b.angle) * speed;
      rc.strokeStyle = INK; rc.lineCap = "round";
      rc.lineWidth = Math.max(0.35, b.width * (1 - b.len / (b.maxLen * 1.4)));
      rc.globalAlpha = b.main ? 0.9 : 0.62;
      rc.beginPath(); rc.moveTo(x, y); rc.lineTo(nx, ny); rc.stroke(); rc.globalAlpha = 1;
      b.pts.push([nx, ny]); b.len += speed;
      if (b.len >= b.maxLen || ny > H * 0.95 || nx < 4 || nx > W - 4) b.alive = false;
      // Lateral roots: spawn sideways branches along the main root, fewer on deeper levels.
      if (b.depth < 2 && b.len > b.nextBranch && b.len < b.maxLen * 0.85) {
        b.nextBranch = b.len + (b.depth ? 26 : 14) + rand() * 26;
        const side = rand() < 0.5 ? -1 : 1, remain = b.maxLen - b.len;
        spawned.push(branch(nx, ny, Math.PI / 2 + side * (0.75 + rand() * 0.55), Math.min(remain * 0.55, H * (0.06 + rand() * 0.12)) / (b.depth + 1), b.width * 0.55, b.depth + 1, b.lane));
      }
    }
    roots.push(...spawned);
    return roots.some((b) => b.alive);
  }

  function drawOverlay(progress) {
    oc.clearRect(0, 0, W, H);
    // Lane guides and labels
    oc.font = "500 10px 'JetBrains Mono', monospace"; oc.textAlign = "center";
    for (let i = 0; i < LANES; i++) {
      const x = W * (i + 0.5) / LANES;
      oc.fillStyle = "rgba(18,18,18,0.38)"; oc.fillText(`LANE ${i}`, x, H * 0.07);
      if (i) { oc.strokeStyle = "rgba(18,18,18,0.07)"; oc.setLineDash([3, 5]); oc.beginPath(); oc.moveTo(W * i / LANES, H * 0.1); oc.lineTo(W * i / LANES, H * 0.96); oc.stroke(); oc.setLineDash([]); }
    }
    if (phase === "grow") return;
    // "Model output": trace main root and mark its tip
    const mains = roots.filter((b) => b.main);
    mains.forEach((b, i) => {
      const t = Math.min(1, Math.max(0, progress * 1.6 - i * 0.12));
      if (t <= 0) return;
      const x = W * (i + 0.5) / LANES;
      if (b.empty) {
        oc.globalAlpha = t; oc.fillStyle = "rgba(18,18,18,0.45)"; oc.fillText("no root", x, H * 0.5); oc.globalAlpha = 1; return;
      }
      const n = Math.floor((b.pts.length - 1) * t);
      oc.strokeStyle = ACCENT; oc.lineWidth = 1.6; oc.globalAlpha = 0.85;
      oc.beginPath(); b.pts.slice(0, n + 1).forEach(([px, py], k) => (k ? oc.lineTo(px, py) : oc.moveTo(px, py))); oc.stroke(); oc.globalAlpha = 1;
      if (t >= 1) {
        const [tx, ty] = b.pts[b.pts.length - 1];
        oc.strokeStyle = ACCENT; oc.lineWidth = 1.2;
        oc.beginPath(); oc.arc(tx, ty, 7, 0, Math.PI * 2); oc.stroke();
        oc.beginPath(); oc.moveTo(tx - 13, ty); oc.lineTo(tx - 9, ty); oc.moveTo(tx + 9, ty); oc.lineTo(tx + 13, ty);
        oc.moveTo(tx, ty - 13); oc.lineTo(tx, ty - 9); oc.moveTo(tx, ty + 9); oc.lineTo(tx, ty + 13); oc.stroke();
        oc.fillStyle = ACCENT; oc.beginPath(); oc.arc(tx, ty, 2, 0, Math.PI * 2); oc.fill();
        const conf = (97 + ((b.pts.length * 7 + i * 13) % 30) / 10).toFixed(1);
        const label = `${Math.round(tx * 2.9)}, ${Math.round(ty * 2.9)} · ${conf}%`;
        oc.font = "500 10px 'JetBrains Mono', monospace";
        const w = oc.measureText(label).width + 12, lx = Math.min(Math.max(tx - w / 2, 4), W - w - 4), ly = Math.min(ty + 18, H - 22);
        oc.fillStyle = "rgba(18,18,18,0.88)"; oc.beginPath(); oc.roundRect(lx, ly, w, 17, 4); oc.fill();
        oc.fillStyle = "#fff"; oc.textAlign = "left"; oc.fillText(label, lx + 6, ly + 12); oc.textAlign = "center";
      }
    });
  }

  function frame() {
    phaseT++;
    if (phase === "grow") {
      let alive = true;
      for (let k = 0; k < 2 && alive; k++) alive = step();
      drawOverlay(0);
      if (!alive) { phase = "detect"; phaseT = 0; const found = roots.filter((b) => b.main && !b.empty).length; status(`model output · ${found}/${LANES} roots detected`); }
    } else if (phase === "detect") {
      drawOverlay(Math.min(1.6, phaseT / 90));
      if (phaseT > 330) { phase = "fade"; phaseT = 0; }
    } else if (phase === "fade") {
      rc.fillStyle = PAPER; rc.globalAlpha = 0.12; rc.fillRect(0, 0, W, H); rc.globalAlpha = 1;
      overCv.style.opacity = String(Math.max(0, 1 - phaseT / 30));
      if (phaseT > 32) { reset(); overCv.style.opacity = "1"; }
    }
    if (running) requestAnimationFrame(frame);
  }

  plate.addEventListener("pointermove", (e) => { const r = plate.getBoundingClientRect(); pointer = [e.clientX - r.left, e.clientY - r.top]; });
  plate.addEventListener("pointerleave", () => { pointer = null; });

  let running = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running && !reduced) { running = true; requestAnimationFrame(frame); }
    else if (!e.isIntersecting) running = false;
  }).observe(plate);

  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduced) still(); }, 150); });
  function still() { while (step()); phase = "detect"; drawOverlay(1.6); status(`model output · ${roots.filter((b) => b.main && !b.empty).length}/${LANES} roots detected`); }
  resize();
  if (reduced) still();
})();
