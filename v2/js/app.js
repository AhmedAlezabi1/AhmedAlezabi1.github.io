// v2 portfolio. Project content is shared with v1 via ../js/projects.js (PROJECTS).
// ===== Personal details: edit these. Empty values are hidden. =====
const PROFILE = {
  email: "",
  linkedin: "",
  github: "https://github.com/AhmedAlezabi1",
  cv: "",       // e.g. "../assets/Ahmed_Alezabi_CV.pdf"
  photo: "",    // e.g. "../assets/ahmed.jpg"; empty shows a monogram
};
const BASE = "../"; // asset paths in projects.js are relative to the site root

const EXPERIENCE = [
  { y: "Now", role: "AI Engineer", where: "UGUIDU · Stedelijk Museum Breda", now: true },
  { y: "2026", role: "MLOps & Deployment Engineer", where: "cv4 · NPEC", id: "cv4" },
  { y: "2025–26", role: "Computer Vision & Robotics", where: "Plant phenotyping · NPEC", id: "robotics" },
  { y: "2025", role: "NLP Engineer", where: "Emotion classification · media analytics", id: "nlp" },
  { y: "2025", role: "Deep Learning & Product", where: "ScanFresh · Innovation Square", id: "scanfresh" },
  { y: "2024–25", role: "Data Scientist", where: "Diabetes hospital analytics", id: "diabetes" },
];

const TICKER = [
  ["50/50", "plants inoculated by robot"], ["0.97 mm", "mean robot error"], ["95%", "fruit freshness accuracy"],
  ["0.88", "root segmentation F1"], ["242", "automated tests in CI"], ["0.69", "accuracy across 7 emotions"],
  ["3.8%", "speech-to-text word error"], ["101,766", "patient records modelled"],
];

// 2 = core of the project, 1 = supporting, 0 = not used. Columns follow PROJECTS order.
const MATRIX = [
  ["Computer vision", { cv4: 2, robotics: 2, scanfresh: 2 }],
  ["Deep learning", { cv4: 2, robotics: 2, nlp: 2, scanfresh: 2 }],
  ["NLP & LLMs", { nlp: 2 }],
  ["Classical machine learning", { nlp: 2, diabetes: 2 }],
  ["MLOps & cloud deployment", { cv4: 2, robotics: 1 }],
  ["APIs & web apps", { cv4: 2 }],
  ["Robotics & control", { robotics: 2 }],
  ["Responsible & explainable AI", { nlp: 2, scanfresh: 2 }],
  ["UX & user research", { cv4: 1, scanfresh: 2 }],
  ["Data analysis & statistics", { cv4: 1, robotics: 1, nlp: 1, scanfresh: 1, diabetes: 2 }],
];

const PRINCIPLES = [
  { k: "i.", t: "Baseline first", d: "Before building a model, I set the bar: a random guess, a simple model, and how well a human does.",
    proof: "ScanFresh: random 16.7% → MLP 70% → human 94% → EfficientNet 95%." },
  { k: "ii.", t: "Measure honestly", d: "A number only means something next to the right comparison, so I also report what doesn't work.",
    proof: "Diabetes project: flagged that 77% of patients are on medication, so ~0.77 accuracy barely beats the majority class." },
  { k: "iii.", t: "Simple wins, then ship", d: "I choose the simplest approach that meets the requirement, then make it production-grade.",
    proof: "Robotics: PID (0.93 mm) beat reinforcement learning (1–5 mm), so PID went into the final system." },
];

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const asset = (p) => (p && !/^https?:/.test(p) ? BASE + p : p);
const pad = (n) => String(n + 1).padStart(2, "0");
const previewSrc = (p) => asset(p.cover || p.gallery[0].src);

/* ---------- Render ---------- */
function renderTicker() {
  const html = TICKER.map(([b, s]) => `<div class="ticker-item"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("");
  $("#ticker").innerHTML = html + html;
}

function renderIndex() {
  $("#index").innerHTML = PROJECTS.map((p, i) => `
    <a class="row rv" href="#work/${p.id}" data-id="${p.id}" data-preview="${previewSrc(p)}" data-logo="${p.coverStyle === "logo" ? 1 : 0}">
      <span class="n">${pad(i)}</span>
      <h3>${esc(p.title.split(":")[0])}</h3>
      <span class="client muted">${esc(p.client)}</span>
      <span class="disc muted">${esc(p.tags.slice(0, 2).join(" · "))}</span>
      <span class="yr mono muted">${esc(p.year)}</span>
      <span class="go" aria-hidden="true">→</span>
      <span class="thumb"><img src="${previewSrc(p)}" alt="" loading="lazy" /></span>
    </a>`).join("");
}

function renderMatrix() {
  const head = `<thead><tr><th>Skill</th>${PROJECTS.map((p, i) =>
    `<th><a href="#work/${p.id}" data-open="${p.id}">${pad(i)}<br>${esc(p.title.split(":")[0])}</a></th>`).join("")}</tr></thead>`;
  const body = `<tbody>${MATRIX.map(([skill, m]) => `<tr><td>${esc(skill)}</td>${PROJECTS.map((p) => {
    const v = m[p.id] || 0;
    return `<td>${v ? `<i class="mdot ${v === 2 ? "full" : "half"}" title="${v === 2 ? "Core" : "Supporting"}"></i>` : ""}</td>`;
  }).join("")}</tr>`).join("")}</tbody>`;
  $("#matrix").innerHTML = head + body;
}

function renderAbout() {
  const frame = $("#portrait");
  frame.innerHTML = PROFILE.photo ? `<img src="${esc(PROFILE.photo)}" alt="Portrait of Ahmed Ali Alezabi" />` : `<div class="monogram">Aa</div>`;
  $("#exp").innerHTML = EXPERIENCE.map((e) => `
    <div class="exp-row ${e.now ? "now" : ""}">
      <span class="y">${esc(e.y)}</span>
      <span>${e.id ? `<a href="#work/${e.id}" data-open="${e.id}">${esc(e.role)}</a>` : esc(e.role)}</span>
      <span class="where muted">${esc(e.where)}</span>
    </div>`).join("");
  $("#principlesList").innerHTML = PRINCIPLES.map((p) => `
    <article class="principle rv"><div class="k">${p.k}</div><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p><p class="proof">${esc(p.proof)}</p></article>`).join("");
}

function renderContact() {
  const links = [];
  if (PROFILE.email) links.push(["Email", PROFILE.email, `mailto:${PROFILE.email}`]);
  if (PROFILE.linkedin) links.push(["LinkedIn", "Connect", PROFILE.linkedin]);
  links.push(["GitHub", "AhmedAlezabi1", PROFILE.github]);
  if (PROFILE.cv) links.push(["CV", "Download PDF", PROFILE.cv]);
  $("#contactLinks").innerHTML = links.map(([k, v, href]) =>
    `<a href="${esc(href)}" ${href.startsWith("mailto:") ? "" : 'target="_blank" rel="noopener"'}><span>${esc(k)}</span><span class="mono">${esc(v)} ↗</span></a>`).join("");
}

/* ---------- Case study drawer ---------- */
function caseHTML(p, i) {
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const cover = p.coverStyle === "type" ? asset(p.gallery[0].src) : asset(p.cover);
  const list = (xs) => `<ol>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`;
  return `
    <span class="mono muted">${pad(i)} · ${esc(p.clientFull)}</span>
    <h2>${esc(p.title)}</h2>
    <p class="tagline">${esc(p.tagline)}</p>
    <div class="cs-facts">
      <div><span class="mono">Client</span>${esc(p.client)}</div><div><span class="mono">Year</span>${esc(p.year)}</div>
      <div><span class="mono">Role</span>${esc(p.role)}</div><div><span class="mono">Team</span>${esc(p.team)}</div>
    </div>
    <div class="cs-cover ${p.coverStyle === "logo" ? "logo" : ""}"><img src="${cover}" alt="${esc(p.title)}" /></div>
    <div class="cs-metrics">${p.metrics.map((m) => `<div><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join("")}</div>
    <div class="cs-sec"><h4>The problem</h4><p>${esc(p.problem)}</p></div>
    <div class="cs-sec"><h4>Approach</h4>${list(p.approach)}</div>
    <div class="cs-sec"><h4>My contribution</h4>${list(p.contribution)}</div>
    <div class="cs-sec"><h4>Stack</h4><div class="chips">${p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div></div>
    <div class="cs-gallery">${p.gallery.map((g) => `<figure><a href="${asset(g.src)}" target="_blank" rel="noopener"><img src="${asset(g.src)}" alt="${esc(g.caption)}" loading="lazy" /></a><figcaption>${esc(g.caption)}</figcaption></figure>`).join("")}</div>
    <div class="cs-links">${p.links.map((l, k) => `<a class="btn ${k ? "btn-line" : "btn-ink"}" href="${l.url}" target="_blank" rel="noopener">${esc(l.label)} <span class="arr">↗</span></a>`).join("")}</div>
    <div class="cs-next"><span class="mono muted">Next project</span><button data-open="${next.id}">${esc(next.title.split(":")[0])} →</button></div>`;
}

const drawer = $("#drawer"), scrim = $("#scrim");
let lastFocus = null;
function openCase(id, push = true) {
  const i = PROJECTS.findIndex((p) => p.id === id);
  if (i < 0) return;
  const p = PROJECTS[i];
  $("#cs").innerHTML = caseHTML(p, i);
  $("#drawerCount").textContent = `Case study ${pad(i)} / ${pad(PROJECTS.length - 1)}`;
  drawer.scrollTop = 0;
  if (!drawer.classList.contains("open")) lastFocus = document.activeElement;
  drawer.classList.add("open"); scrim.classList.add("open"); drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.title = `${p.title} · Ahmed Ali Alezabi`;
  if (push && location.hash !== `#work/${id}`) history.pushState(null, "", `#work/${id}`);
  setTimeout(() => $("#close").focus({ preventScroll: true }), 50);
}
function closeCase(push = true) {
  if (!drawer.classList.contains("open")) return;
  drawer.classList.remove("open"); scrim.classList.remove("open"); drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  document.title = "Ahmed Ali Alezabi · AI & ML Engineer";
  if (push) history.pushState(null, "", "#work");
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}
function route() {
  const m = location.hash.match(/^#work\/([\w-]+)/);
  if (m) openCase(m[1], false); else closeCase(false);
}

/* ---------- Interactions ---------- */
function interactions() {
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open], .row");
    if (!t) return;
    e.preventDefault();
    openCase(t.dataset.open || t.dataset.id);
  });
  $("#close").addEventListener("click", () => closeCase());
  scrim.addEventListener("click", () => closeCase());
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeCase(); });
  addEventListener("popstate", route);

  // Floating image preview that follows the cursor over the project index.
  const pv = $("#preview"), img = pv.querySelector("img");
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
  const follow = () => { x += (tx - x) * 0.18; y += (ty - y) * 0.18; pv.style.left = x + "px"; pv.style.top = y + "px"; raf = pv.classList.contains("on") ? requestAnimationFrame(follow) : 0; };
  $("#index").addEventListener("pointerover", (e) => {
    const row = e.target.closest(".row"); if (!row || e.pointerType === "touch") return;
    if (img.getAttribute("src") !== row.dataset.preview) img.src = row.dataset.preview;
    pv.classList.toggle("contain", row.dataset.logo === "1");
    if (!pv.classList.contains("on")) { x = tx = e.clientX + 190; y = ty = e.clientY; }
    pv.classList.add("on"); if (!raf) raf = requestAnimationFrame(follow);
  });
  $("#index").addEventListener("pointermove", (e) => { tx = e.clientX + 190; ty = e.clientY; });
  $("#index").addEventListener("pointerleave", () => pv.classList.remove("on"));
}

/* ---------- Motion ---------- */
function splitWords() {
  document.querySelectorAll(".split").forEach((el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement("span"); w.className = "w";
            const inner = document.createElement("span"); inner.textContent = part; w.append(inner); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    el.querySelectorAll(".w > span").forEach((s, i) => { s.style.transitionDelay = `${i * 60}ms`; });
  });
}
function reveal() {
  let pending = [...document.querySelectorAll(".rv, .split")];
  const check = () => {
    const limit = innerHeight * 0.92;
    pending = pending.filter((el) => (el.getBoundingClientRect().top < limit ? (el.classList.add("in"), false) : true));
  };
  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; check(); }); } }, { passive: true });
  addEventListener("resize", check); addEventListener("load", check);
  requestAnimationFrame(check);
}
function clock() {
  const el = $("#clock");
  const tick = () => { el.textContent = "Breda " + new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" }).format(new Date()); };
  tick(); setInterval(tick, 30000);
  $("#year").textContent = new Date().getFullYear();
}

renderTicker(); renderIndex(); renderMatrix(); renderAbout(); renderContact();
interactions(); splitWords(); reveal(); clock(); route();
