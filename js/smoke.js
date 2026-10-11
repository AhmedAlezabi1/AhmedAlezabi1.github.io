// Animated smoke background for the hero: domain-warped fractal noise in a fragment shader.
// Renders at reduced resolution for performance and pauses while the hero is off-screen.
(function () {
  const canvas = document.getElementById("smoke");
  if (!canvas) return;
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  if (!gl) { canvas.style.display = "none"; return; }

  const vert = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
  const frag = `
    precision highp float;
    uniform vec2 res; uniform float t; uniform vec2 mouse;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
      for (int i = 0; i < 6; i++){ v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
      return v;
    }
    void main(){
      vec2 uv = gl_FragCoord.xy / res.xy;
      vec2 p = (gl_FragCoord.xy - 0.5 * res.xy) / res.y;
      p += (mouse - 0.5) * 0.08;
      float s = t * 0.045;
      vec2 q = vec2(fbm(p * 1.6 + vec2(0.0, s)), fbm(p * 1.6 + vec2(5.2, -s)));
      vec2 r = vec2(fbm(p * 1.4 + 3.0 * q + vec2(1.7, 9.2) + s * 0.7), fbm(p * 1.4 + 3.0 * q + vec2(8.3, 2.8) - s * 0.5));
      float f = fbm(p * 1.2 + 2.6 * r);
      // Wispy ribbons: sharpen the mid-tones into thin bright filaments.
      float body = pow(smoothstep(0.52, 1.0, f), 1.8) * 0.75;
      float ridge = 1.0 - abs(f - 0.6) * 9.0;            // thin bright filament where f is near 0.6
      float wisps = body + pow(clamp(ridge, 0.0, 1.0), 3.0) * 0.45;
      // Concentrate the smoke in a drifting ribbon across the middle, mostly black elsewhere.
      float band = exp(-pow((uv.y - 0.42 - 0.10 * sin(uv.x * 2.6 + s * 2.0)) * 3.2, 2.0));
      float v = wisps * (0.12 + 0.95 * band);
      v *= smoothstep(0.0, 0.25, uv.y) * (0.75 + 0.25 * smoothstep(1.0, 0.6, uv.y));
      gl_FragColor = vec4(vec3(v * 0.92), 1.0);
    }`;

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  const vs = shader(gl.VERTEX_SHADER, vert), fs = shader(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) { canvas.style.display = "none"; return; }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, "res"), uT = gl.getUniformLocation(prog, "t"), uMouse = gl.getUniformLocation(prog, "mouse");

  const SCALE = 0.5; // render at half resolution; the blur suits smoke anyway
  function resize() {
    const w = Math.max(1, Math.floor(canvas.clientWidth * SCALE)), h = Math.max(1, Math.floor(canvas.clientHeight * SCALE));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
  }

  let mouse = [0.5, 0.5], target = [0.5, 0.5];
  window.addEventListener("pointermove", (e) => { target = [e.clientX / innerWidth, 1 - e.clientY / innerHeight]; });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let visible = true, start = performance.now(), raf = 0;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) loop(); }).observe(canvas);

  function draw(now) {
    resize();
    mouse[0] += (target[0] - mouse[0]) * 0.03; mouse[1] += (target[1] - mouse[1]) * 0.03;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uT, (now - start) / 1000 + 12.0);
    gl.uniform2f(uMouse, mouse[0], mouse[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function loop(now = performance.now()) {
    if (!visible) { raf = 0; return; }
    draw(now);
    raf = requestAnimationFrame(loop);
  }
  if (reduced) { draw(performance.now()); window.addEventListener("resize", () => draw(performance.now())); }
  else loop();
})();
