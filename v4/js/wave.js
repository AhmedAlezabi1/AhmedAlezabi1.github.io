// Hero background for v3: a 3D "data wave". A grid of glowing points forms a moving landscape
// seen in perspective; the cursor sends a ripple through it. Pauses while the hero is off-screen.
(function () {
  const canvas = document.getElementById("smoke");
  if (!canvas) return;
  const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: false, alpha: true });
  if (!gl) { canvas.style.display = "none"; return; }

  const COLS = 210, ROWS = 96;
  const vert = `
    attribute vec2 a;               // a.x in [-1, 1] across, a.y in [0, 1] into the distance
    uniform float t; uniform vec2 res; uniform vec2 mouse; uniform float dpr; uniform float press;
    varying float vA; varying vec3 vC;
    void main(){
      float x = a.x * 10.5;
      float z = 1.2 + a.y * 10.0;
      float s = t * 0.55;
      float y = sin(x * 0.55 + s) * 0.34
              + sin(z * 0.75 - s * 1.15) * 0.30
              + sin((x + z) * 0.33 + s * 0.6) * 0.42
              + sin(x * 1.3 - z * 0.9 + s * 1.7) * 0.08;
      // Cursor ripple: map the pointer onto the ground plane
      vec2 m = vec2((mouse.x - 0.5) * 12.0, mix(1.6, 7.5, clamp(mouse.y * 1.6, 0.0, 1.0)));
      float d = distance(vec2(x, z), m);
      y += exp(-d * d * 0.22) * (0.55 + press) + exp(-d * 0.6) * sin(d * 2.4 - t * 3.2) * 0.22;
      vec3 p = vec3(x, y - 1.6, z);
      float aspect = res.x / res.y, fov = 1.3;
      gl_Position = vec4(p.x / p.z * fov / aspect, p.y / p.z * fov - 0.26, 0.0, 1.0);
      gl_PointSize = (3.0 + 10.0 / p.z) * dpr * clamp(res.y / (900.0 * dpr), 0.7, 1.4);
      float h = clamp((y + 0.9) / 1.9, 0.0, 1.0);
      vec3 teal = vec3(0.42, 0.98, 0.88), indigo = vec3(0.55, 0.60, 1.0), violet = vec3(0.80, 0.52, 1.0);
      vC = mix(mix(teal, indigo, smoothstep(-0.6, 0.8, a.x)), violet, smoothstep(0.55, 1.0, h));
      vC = mix(vC, vec3(1.0), smoothstep(0.82, 1.0, h) * 0.35);  // brighter crests
      float fadeFar = smoothstep(11.2, 4.0, z);
      float fadeSide = smoothstep(1.0, 0.8, abs(a.x));
      vA = clamp(fadeFar * fadeSide * (0.45 + 0.9 * h) * 1.35, 0.0, 1.0);
    }`;
  const frag = `
    precision mediump float;
    varying float vA; varying vec3 vC;
    void main(){
      vec2 c = gl_PointCoord - 0.5;
      float r = length(c);
      float core = smoothstep(0.5, 0.0, r);
      float alpha = core * core * vA;
      if (alpha < 0.01) discard;
      gl_FragColor = vec4(vC, alpha);
    }`;

  function shader(type, src) {
    const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(sh)); return null; }
    return sh;
  }
  const vs = shader(gl.VERTEX_SHADER, vert), fs = shader(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) { canvas.style.display = "none"; return; }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);

  const pts = new Float32Array(COLS * ROWS * 2);
  let k = 0;
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) { pts[k++] = (i / (COLS - 1)) * 2 - 1; pts[k++] = j / (ROWS - 1); }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const uT = U("t"), uRes = U("res"), uMouse = U("mouse"), uDpr = U("dpr"), uPress = U("press");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive glow
  gl.clearColor(0, 0, 0, 0);

  let dpr = 1;
  function resize() {
    dpr = Math.min(2, devicePixelRatio || 1);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr)), h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }

  // Pointer: smoothed position; a press makes the bump rise a little.
  let mouse = [0.5, 0.15], target = [0.5, 0.15], press = 0, pressTarget = 0;
  const hero = canvas.parentElement;
  hero.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    target = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
  });
  hero.addEventListener("pointerleave", () => { target = [0.5, 0.15]; });
  hero.addEventListener("pointerdown", () => { pressTarget = 0.6; });
  addEventListener("pointerup", () => { pressTarget = 0; });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = performance.now();
  let visible = true, raf = 0;
  function draw(now) {
    resize();
    mouse[0] += (target[0] - mouse[0]) * 0.06; mouse[1] += (target[1] - mouse[1]) * 0.06;
    press += (pressTarget - press) * 0.08;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uT, (now - start) / 1000 + 4.0);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mouse[0], mouse[1]);
    gl.uniform1f(uDpr, dpr);
    gl.uniform1f(uPress, press);
    gl.drawArrays(gl.POINTS, 0, COLS * ROWS);
  }
  function loop(now = performance.now()) { if (!visible) { raf = 0; return; } draw(now); raf = requestAnimationFrame(loop); }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf && !reduced) loop(); }).observe(canvas);
  if (reduced) { draw(performance.now()); addEventListener("resize", () => draw(performance.now())); } else loop();
})();
