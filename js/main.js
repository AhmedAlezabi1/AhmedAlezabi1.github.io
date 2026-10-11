// ===== Personal details: edit these =====
// Links left empty ("") are hidden, so the site never shows a placeholder.
const PROFILE = {
  email: "",      // e.g. "you@gmail.com"
  linkedin: "",   // e.g. "https://www.linkedin.com/in/your-name"
  github: "https://github.com/AhmedAlezabi1",
  cv: "",         // e.g. "assets/Ahmed_Alezabi_CV.pdf"
  photo: "",      // e.g. "assets/ahmed.jpg" (portrait, about 800×1000). Empty shows an "AA" monogram.
};

const TIMELINE = [
  { role: "AI Engineer", where: "UGUIDU · Stedelijk Museum Breda", when: "Currently", now: true },
  { role: "MLOps Engineer", where: "cv4 · NPEC", when: "2026", id: "cv4" },
  { role: "CV & Robotics", where: "Plant Phenotyping · NPEC", when: "2025–26", id: "robotics" },
  { role: "NLP Engineer", where: "Emotion Classification", when: "2025", id: "nlp" },
  { role: "Deep Learning & Product", where: "ScanFresh", when: "2025", id: "scanfresh" },
  { role: "Data Scientist", where: "Diabetes Hospital Analytics", when: "2024–25", id: "diabetes" },
];

const TECH = [
  ["Python", "python"], ["PyTorch", "pytorch"], ["TensorFlow", "tensorflow"], ["Hugging Face", "huggingface"],
  ["FastAPI", "fastapi"], ["Docker", "docker"], ["OpenCV", "opencv"], ["scikit-learn", "scikitlearn"],
  ["Next.js", "nextdotjs"], ["PostgreSQL", "postgresql"], ["GitHub Actions", "githubactions"], ["MLflow", "mlflow"],
];

const ICON = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"/><path d="M14 3v6h6"/></svg>',
};

// Pages in a subfolder (e.g. /v2/) set window.ASSET_BASE = "../" so shared asset paths still resolve.
const ASSET_BASE = window.ASSET_BASE || "";
const asset = (p) => (p && !/^(https?:|data:|mailto:)/.test(p) ? ASSET_BASE + p : p);
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function coverHTML(p, cls = "cover") {
  if (p.coverStyle === "type") return `<div class="${cls} type"><span>${esc(p.coverText)}</span></div>`;
  return `<div class="${cls} ${p.coverStyle === "logo" ? "logo" : ""}"><img src="${asset(p.cover)}" alt="${esc(p.title)}" loading="lazy" /></div>`;
}

function renderHome() {
  const grid = $("#projectGrid");
  if (!grid) return;
  grid.innerHTML = PROJECTS.map((p, i) => `
    <a class="card reveal ${i === 0 ? "featured" : ""}" href="project.html?id=${p.id}">
      <div style="position:relative">${coverHTML(p)}<span class="case-pill">View case study ↗</span></div>
      <div class="card-body">
        <div class="card-meta"><span>${esc(p.client)}</span><span>${esc(p.year)}</span></div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.tagline)}</p>
        <div class="tags">${p.tags.slice(0, 4).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      </div>
    </a>`).join("");

  $("#timeline").innerHTML = TIMELINE.map((t) => {
    const inner = `<span class="role">${esc(t.role)}</span><span class="where">${esc(t.where)}</span><span class="when">${esc(t.when)}</span>`;
    return t.id ? `<a class="tl-row" href="project.html?id=${t.id}">${inner}</a>` : `<div class="tl-row ${t.now ? "now" : ""}">${inner}</div>`;
  }).join("");

  const items = TECH.map(([name, slug]) =>
    `<span><img src="https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/${slug}.svg" alt="" onerror="this.remove()" />${esc(name)}</span>`).join("");
  $("#marquee").innerHTML = items + items; // duplicated for a seamless loop

  const photo = $("#photo");
  if (PROFILE.photo) photo.src = asset(PROFILE.photo);
  else photo.replaceWith(Object.assign(document.createElement("div"), { className: "monogram", textContent: "AA" }));

  const links = [];
  if (PROFILE.email) links.push(`<a class="btn btn-primary" href="mailto:${esc(PROFILE.email)}">${ICON.mail}${esc(PROFILE.email)}</a>`);
  if (PROFILE.linkedin) links.push(`<a class="btn" href="${esc(PROFILE.linkedin)}" target="_blank" rel="noopener">${ICON.linkedin}LinkedIn</a>`);
  links.push(`<a class="btn ${PROFILE.email ? "" : "btn-primary"}" href="${esc(PROFILE.github)}" target="_blank" rel="noopener">${ICON.github}GitHub</a>`);
  if (PROFILE.cv) links.push(`<a class="btn" href="${esc(asset(PROFILE.cv))}" target="_blank" rel="noopener">${ICON.file}Download CV</a>`);
  $("#contactLinks").innerHTML = links.join("");
}

function renderProject() {
  const root = $("#caseStudy");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const idx = Math.max(0, PROJECTS.findIndex((p) => p.id === id));
  const p = PROJECTS[idx], next = PROJECTS[(idx + 1) % PROJECTS.length];
  document.title = `${p.title} · Ahmed Alezabi`;

  const list = (xs) => `<ul>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  root.innerHTML = `
    <section class="cs-hero"><div class="wrap">
      <a class="back" href="index.html#projects">← All projects</a>
      <div class="eyebrow">${esc(p.clientFull)}</div>
      <h1 class="reveal">${esc(p.title)}</h1>
      <p class="tagline reveal">${esc(p.tagline)}</p>
      <div class="cs-meta reveal">
        <div><small>Client</small>${esc(p.client)}</div>
        <div><small>Year</small>${esc(p.year)}</div>
        <div><small>My role</small>${esc(p.role)}</div>
        <div><small>Team</small>${esc(p.team)}</div>
      </div>
    </div></section>
    <div class="wrap">
      <div class="reveal">${coverHTML(p, "cs-cover").replace(' loading="lazy"', "")}</div>
      <div class="metrics">${p.metrics.map((m) => `<div class="metric reveal"><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join("")}</div>
      <div class="cs-block reveal"><h2>The problem</h2><p>${esc(p.problem)}</p></div>
      <div class="cs-block reveal"><h2>Approach</h2>${list(p.approach)}</div>
      <div class="cs-block reveal"><h2>My contribution</h2>${list(p.contribution)}</div>
      <div class="cs-block reveal"><h2>Tech stack</h2><div class="tags" style="padding:0">${p.stack.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div></div>
      <div class="cs-block reveal" style="grid-template-columns:1fr"><h2>Gallery</h2>
        <div class="gallery">${p.gallery.map((g) => `<figure><img src="${asset(g.src)}" alt="${esc(g.caption)}" loading="lazy" /><figcaption>${esc(g.caption)}</figcaption></figure>`).join("")}</div>
      </div>
      <div class="hero-actions reveal" style="justify-content:flex-start;margin-top:48px">${p.links.map((l, i) =>
        `<a class="btn ${i === 0 ? "btn-primary" : ""}" href="${l.url}" target="_blank" rel="noopener">${i === 0 ? ICON.github : ""}${esc(l.label)}${ICON.arrow}</a>`).join("")}</div>
      <div class="next" style="border-top:1px solid var(--line);margin-top:72px">
        <span class="eyebrow" style="margin:0">Next project</span>
        <a class="big" href="project.html?id=${next.id}">${esc(next.title)} →</a>
      </div>
    </div>`;

  const lb = $("#lightbox");
  root.querySelectorAll(".gallery img").forEach((img) =>
    img.addEventListener("click", () => { lb.querySelector("img").src = img.src; lb.classList.add("open"); }));
  lb.addEventListener("click", () => lb.classList.remove("open"));
  addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("open"); });
}

// Wrap every word of a headline in two spans so each word can slide up into view.
function splitWords(elements) {
  elements.forEach((el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement("span"); w.className = "w";
            const inner = document.createElement("span"); inner.textContent = part;
            w.append(inner); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    el.classList.add("split");
    el.querySelectorAll(".w > span").forEach((s, i) => { s.style.transitionDelay = `${i * 70}ms`; });
  });
}

function chrome() {
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 20);
  onScroll(); addEventListener("scroll", onScroll, { passive: true });
  const btn = $("#menuBtn"), links = $("#navLinks");
  if (btn) {
    btn.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => links.classList.remove("open")));
  }
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  splitWords(document.querySelectorAll(".hero h1, .h2, .cs-hero h1"));

  // Reveal-on-scroll based on element position, so content still shows where
  // IntersectionObserver misbehaves (some embedded or headless browsers).
  let pending = [...document.querySelectorAll(".reveal, .split")];
  pending.forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 70}ms`; });
  let ticking = false;
  const check = () => {
    ticking = false;
    const limit = innerHeight * 0.94;
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top < limit) { el.classList.add("in"); return false; }
      return true;
    });
    if (!pending.length) { removeEventListener("scroll", onReveal); removeEventListener("resize", onReveal); }
  };
  const onReveal = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
  addEventListener("scroll", onReveal, { passive: true });
  addEventListener("resize", onReveal);
  addEventListener("load", check);
  check();
}

renderHome();
renderProject();
chrome();
