// Hero background for v2: slow aurora curtains (teal / indigo / violet) on midnight blue,
// plus a cursor position for the CSS dot-grid spotlight. Pauses while the hero is off-screen.
(function () {
  const canvas = document.getElementById("smoke");
  const hero = document.querySelector(".hero");
  if (!canvas || !hero) return;

  // Cursor spotlight for the dot grid (pure CSS, driven by two custom properties).
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
    hero.style.setProperty("--my", `${e.clientY - r.top}px`);
  });

  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  if (!gl) { canvas.style.display = "none"; return; }

  const vert = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
  const frag = `
    precision highp float;
    uniform vec2 res; uniform float t; uniform vec2 mouse;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5; mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
      for (int i = 0; i < 5; i++){ v += a * noise(p); p = r * p * 2.03; a *= 0.5; }
      return v;
    }
    void main(){
      vec2 uv = gl_FragCoord.xy / res.xy;
      vec2 p = (gl_FragCoord.xy - 0.5 * res.xy) / res.y;
      float s = t * 0.035;
      p.x += (mouse.x - 0.5) * 0.12;
      // Curtains: stretched noise along x, warped over time
      vec2 q = vec2(fbm(vec2(p.x * 1.4 + s, p.y * 0.6)), fbm(vec2(p.x * 1.1 - s * 0.8, p.y * 0.9 + 3.1)));
      float curtain = fbm(vec2(p.x * 2.2 + q.x * 1.6 + s * 0.6, p.y * 0.55 + q.y));
      float rays = smoothstep(0.30, 0.78, curtain);
      // Bright ribbon that drifts across the upper-middle of the hero
      float ribbon = exp(-pow((uv.y - 0.58 - 0.12 * sin(uv.x * 2.4 + s * 3.0) - 0.05 * q.y) * 3.4, 2.0));
      float glow = pow(rays, 1.3) * (0.30 + 1.25 * ribbon);
      vec3 teal = vec3(0.18, 0.86, 0.78), indigo = vec3(0.36, 0.40, 0.98), violet = vec3(0.68, 0.36, 0.98);
      vec3 col = mix(teal, indigo, smoothstep(0.15, 0.85, uv.x + 0.25 * (q.x - 0.5)));
      col = mix(col, violet, smoothstep(0.55, 0.95, q.y + uv.y * 0.3));
      vec3 bg = mix(vec3(0.020, 0.028, 0.055), vec3(0.035, 0.045, 0.090), uv.y);
      vec3 c = bg + col * glow * 0.95;
      c *= 0.75 + 0.25 * smoothstep(0.0, 0.6, uv.y);            // darker towards the bottom
      c *= 1.0 - 0.35 * pow(length(uv - vec2(0.5, 0.55)) * 1.25, 2.0); // soft vignette
      gl_FragColor = vec4(c, 1.0);
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
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, "res"), uT = gl.getUniformLocation(prog, "t"), uMouse = gl.getUniformLocation(prog, "mouse");

  const SCALE = 0.5;
  function resize() {
    const w = Math.max(1, Math.floor(canvas.clientWidth * SCALE)), h = Math.max(1, Math.floor(canvas.clientHeight * SCALE));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }
  let mouse = [0.5, 0.5], target = [0.5, 0.5];
  addEventListener("pointermove", (e) => { target = [e.clientX / innerWidth, 1 - e.clientY / innerHeight]; });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let visible = true, raf = 0; const start = performance.now();
  function draw(now) {
    resize();
    mouse[0] += (target[0] - mouse[0]) * 0.03; mouse[1] += (target[1] - mouse[1]) * 0.03;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uT, (now - start) / 1000 + 20.0);
    gl.uniform2f(uMouse, mouse[0], mouse[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function loop(now = performance.now()) { if (!visible) { raf = 0; return; } draw(now); raf = requestAnimationFrame(loop); }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf && !reduced) loop(); }).observe(canvas);
  if (reduced) { draw(performance.now()); addEventListener("resize", () => draw(performance.now())); } else loop();
})();
