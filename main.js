import * as THREE from "three";

/* ------------------------------------------------------------------ *
 *  Decidey — a cute 3D decision mouse
 *  Procedural mouse built from primitives so we can animate every
 *  blink, ear-wiggle, squash and tail-wag ourselves.
 * ------------------------------------------------------------------ */

const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0.2, 7.2);

/* ---------------------------- lights ----------------------------- */
const hemi = new THREE.HemisphereLight(0xffffff, 0xffd9f0, 0.95);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(3, 5, 4);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.near = 1;
key.shadow.camera.far = 20;
key.shadow.bias = -0.0004;
scene.add(key);

const rim = new THREE.DirectionalLight(0x9bb8ff, 0.7);
rim.position.set(-4, 2, -3);
scene.add(rim);

/* soft shadow catcher on the "floor" */
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(4, 48),
  new THREE.ShadowMaterial({ opacity: 0.14 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.9;
floor.receiveShadow = true;
scene.add(floor);

/* ---------------------------- materials -------------------------- */
const furMat = new THREE.MeshStandardMaterial({
  color: 0xc9bce6,
  roughness: 0.72,
  metalness: 0.0,
});
const furEmissiveBase = new THREE.Color(0x000000);
furMat.emissive = furEmissiveBase.clone();

const pinkMat = new THREE.MeshStandardMaterial({
  color: 0xff9ecb,
  roughness: 0.6,
});
const eyeMat = new THREE.MeshStandardMaterial({
  color: 0x2a2336,
  roughness: 0.25,
});
const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const blushMat = new THREE.MeshStandardMaterial({
  color: 0xff8ab8,
  roughness: 0.7,
  transparent: true,
  opacity: 0.55,
});

/* ---------------------------- the mouse -------------------------- */
const mouse = new THREE.Group();
scene.add(mouse);

/* head */
const head = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), furMat);
head.scale.set(1.05, 0.98, 0.98);
head.castShadow = true;
mouse.add(head);

/* snout — slightly pushed forward lower sphere */
const snout = new THREE.Mesh(new THREE.SphereGeometry(0.52, 36, 36), furMat);
snout.position.set(0, -0.26, 0.74);
snout.scale.set(1, 0.82, 0.9);
snout.castShadow = true;
mouse.add(snout);

/* ears (outer + pink inner), grouped so they can wiggle */
function makeEar(side) {
  const ear = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.SphereGeometry(0.46, 32, 32), furMat);
  outer.scale.set(1, 1, 0.42);
  outer.castShadow = true;
  const inner = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), pinkMat);
  inner.scale.set(1, 1, 0.42);
  inner.position.z = 0.09;
  ear.add(outer, inner);
  ear.position.set(side * 0.72, 0.82, -0.05);
  ear.rotation.z = side * -0.15;
  return ear;
}
const earL = makeEar(-1);
const earR = makeEar(1);
mouse.add(earL, earR);

/* eyes (white shine makes them feel alive) */
function makeEye(side) {
  const eye = new THREE.Group();
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.17, 28, 28), eyeMat);
  const shine = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), shineMat);
  shine.position.set(0.06, 0.06, 0.14);
  eye.add(ball, shine);
  eye.position.set(side * 0.33, 0.12, 0.84);
  return eye;
}
const eyeL = makeEye(-1);
const eyeR = makeEye(1);
mouse.add(eyeL, eyeR);

/* nose */
const nose = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), pinkMat);
nose.position.set(0, -0.3, 1.24);
nose.scale.set(1.2, 0.9, 0.9);
mouse.add(nose);

/* blush cheeks */
function makeBlush(side) {
  const b = new THREE.Mesh(new THREE.CircleGeometry(0.17, 24), blushMat);
  b.position.set(side * 0.55, -0.12, 0.78);
  b.rotation.y = side * -0.4;
  return b;
}
mouse.add(makeBlush(-1), makeBlush(1));

/* whiskers */
const whiskerMat = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.8,
});
function makeWhisker(side, y, spread) {
  const start = new THREE.Vector3(side * 0.18, y, 1.18);
  const end = new THREE.Vector3(side * 1.1, y + spread, 1.0);
  const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
  return new THREE.Line(geo, whiskerMat);
}
mouse.add(
  makeWhisker(-1, -0.28, 0.14), makeWhisker(-1, -0.34, 0),
  makeWhisker(1, -0.28, 0.14), makeWhisker(1, -0.34, 0)
);

/* tail — a curvy tube that wags */
const tailCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, -0.7, -0.9),
  new THREE.Vector3(0.1, -1.15, -1.3),
  new THREE.Vector3(0.5, -1.0, -1.7),
  new THREE.Vector3(0.95, -0.55, -1.75),
]);
const tailGeo = new THREE.TubeGeometry(tailCurve, 40, 0.07, 10, false);
const tail = new THREE.Mesh(tailGeo, pinkMat);
tail.castShadow = true;
mouse.add(tail);

/* little hand paws for extra charm */
function makePaw(side) {
  const paw = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), furMat);
  paw.position.set(side * 0.42, -0.95, 0.65);
  paw.castShadow = true;
  return paw;
}
const pawL = makePaw(-1);
const pawR = makePaw(1);
mouse.add(pawL, pawR);

mouse.position.y = -0.1;

/* ------------------------- interaction --------------------------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerX = 0;
let pointerY = 0;

window.addEventListener("pointermove", (e) => {
  pointerX = (e.clientX / window.innerWidth) * 2 - 1;
  pointerY = (e.clientY / window.innerHeight) * 2 - 1;
});

canvas.addEventListener("pointerdown", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  raycaster.setFromCamera(pointer, camera);
  if (raycaster.intersectObject(mouse, true).length > 0) decide();
});

/* ------------------------- animation state ----------------------- */
const clock = new THREE.Clock();
let phase = "idle"; // idle | thinking | reveal
let phaseT = 0;
let nextBlink = 1.5 + Math.random() * 3;
let squashPop = 0; // transient squash impulse for the "pop"

/* ------------------------- decision logic ------------------------ */
const optionsEl = document.getElementById("options");
const decideBtn = document.getElementById("decide");
const clearBtn = document.getElementById("clear");
const hintEl = document.getElementById("hint");
const resultEl = document.getElementById("result");

function getOptions() {
  return optionsEl.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function secureRandomInt(n) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % n;
}

let thinkingScrollTimer = null;
let finalWinner = null;

function decide() {
  if (phase !== "idle") return;
  const opts = getOptions();
  if (opts.length < 2) {
    hintEl.textContent = "Give me at least 2 options to choose from 🐭";
    hintEl.style.color = "var(--accent-deep)";
    nudgePanelShake();
    return;
  }
  hintEl.style.color = "";
  hintEl.textContent = "Thinking really hard…";
  decideBtn.disabled = true;

  finalWinner = opts[secureRandomInt(opts.length)];

  phase = "thinking";
  phaseT = 0;

  // live suspense scroller in the result card
  resultEl.classList.add("show", "thinking");
  let i = 0;
  let speed = 70;
  const scroll = () => {
    resultEl.innerHTML = `
      <div class="card">
        <div class="verdict-label">hmm…</div>
        <div class="verdict">${escapeHtml(opts[i % opts.length])}</div>
      </div>`;
    i++;
    speed *= 1.08; // gradually slow down
    if (speed < 420) {
      thinkingScrollTimer = setTimeout(scroll, speed);
    }
  };
  scroll();
}

function reveal() {
  clearTimeout(thinkingScrollTimer);
  phase = "reveal";
  phaseT = 0;
  squashPop = 1;
  resultEl.classList.remove("thinking");
  resultEl.innerHTML = `
    <div class="card">
      <div class="verdict-label">the mouse has decided</div>
      <div class="verdict">${escapeHtml(finalWinner)} ✨</div>
    </div>`;
  hintEl.textContent = "Poke the mouse (or hit Decide) to go again.";
  decideBtn.disabled = false;
  burstConfetti();
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function nudgePanelShake() {
  const panel = document.querySelector(".panel");
  panel.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-6px)" },
      { transform: "translateX(6px)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 300, easing: "ease-in-out" }
  );
}

decideBtn.addEventListener("click", decide);
clearBtn.addEventListener("click", () => {
  optionsEl.value = "";
  resultEl.classList.remove("show", "thinking");
  resultEl.innerHTML = "";
  hintEl.style.color = "";
  hintEl.textContent = "Add at least 2 options, then poke the mouse.";
  optionsEl.focus();
});

/* ------------------------- render loop --------------------------- */
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const dt = clock.getDelta();
  phaseT += dt;

  // reset per-frame transforms
  let scaleX = 1, scaleY = 1, scaleZ = 1;
  let spin = 0;
  let lift = 0;
  let glow = 0;
  let earWiggle = 0;

  if (phase === "idle") {
    // gentle breathing float + look toward the pointer
    lift = Math.sin(t * 1.6) * 0.07;
    const targetRotY = pointerX * 0.5;
    const targetRotX = pointerY * 0.28;
    mouse.rotation.y += (targetRotY - mouse.rotation.y) * 0.06;
    mouse.rotation.x += (targetRotX - mouse.rotation.x) * 0.06;
    mouse.rotation.z = Math.sin(t * 0.9) * 0.03;
    scaleY = 1 + Math.sin(t * 1.6) * 0.02;
    scaleX = 1 - Math.sin(t * 1.6) * 0.012;
    earWiggle = Math.sin(t * 2.2) * 0.06;
  } else if (phase === "thinking") {
    // excited spin + fast squash pulse + glowing cheeks of concentration
    spin = phaseT * 7.5;
    mouse.rotation.x += (0 - mouse.rotation.x) * 0.1;
    const pulse = Math.sin(phaseT * 16);
    scaleY = 1 + pulse * 0.08;
    scaleX = 1 - pulse * 0.06;
    scaleZ = 1 - pulse * 0.06;
    lift = Math.abs(Math.sin(phaseT * 8)) * 0.14;
    glow = 0.18 + Math.sin(phaseT * 12) * 0.12;
    earWiggle = Math.sin(phaseT * 22) * 0.35;
    if (phaseT > 2.6) reveal();
  } else if (phase === "reveal") {
    // settle back toward the pointer-follow idle
    const targetRotY = pointerX * 0.5;
    mouse.rotation.y += (targetRotY - mouse.rotation.y) * 0.12;
    mouse.rotation.x += (0 - mouse.rotation.x) * 0.12;
    mouse.rotation.z += (0 - mouse.rotation.z) * 0.12;
    lift = Math.sin(t * 1.6) * 0.07;
    earWiggle = Math.sin(t * 3) * 0.12;
    if (phaseT > 0.9) { phase = "idle"; }
  }

  // squash "pop" impulse (big overshoot then settle) — happens on reveal
  if (squashPop > 0) {
    const p = squashPop;
    scaleY *= 1 + Math.sin(p * Math.PI) * 0.35;
    scaleX *= 1 - Math.sin(p * Math.PI) * 0.22;
    squashPop = Math.max(0, squashPop - dt * 1.8);
  }

  if (phase !== "idle") mouse.rotation.y = spin || mouse.rotation.y;

  mouse.position.y = -0.1 + lift;
  head.scale.set(1.05 * scaleX, 0.98 * scaleY, 0.98 * scaleZ);
  mouse.scale.set(scaleX, scaleY, scaleZ);

  // ear wiggle
  earL.rotation.z = 0.15 + earWiggle;
  earR.rotation.z = -0.15 - earWiggle;

  // tail wag
  tail.rotation.y = Math.sin(t * (phase === "thinking" ? 10 : 2.4)) * 0.3;

  // blinking (idle + reveal only)
  if (phase !== "thinking") {
    nextBlink -= dt;
    if (nextBlink <= 0) {
      const b = Math.max(0, 1 - Math.abs(nextBlink) * 14);
      const eyeScale = b < 0.5 ? 0.12 : 1;
      eyeL.scale.y = eyeScale;
      eyeR.scale.y = eyeScale;
      if (nextBlink < -0.16) {
        nextBlink = 1.8 + Math.random() * 3.5;
        eyeL.scale.y = 1;
        eyeR.scale.y = 1;
      }
    }
  } else {
    eyeL.scale.y = 1;
    eyeR.scale.y = 1;
  }

  // concentration glow on the fur
  furMat.emissive.setRGB(glow * 0.9, glow * 0.4, glow * 0.8);

  renderer.render(scene, camera);
}
animate();

/* ------------------------- confetti ------------------------------ */
const confettiCanvas = document.getElementById("confetti");
const cctx = confettiCanvas.getContext("2d");
let confetti = [];

function sizeConfetti() {
  confettiCanvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 2);
  confettiCanvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2);
  cctx.setTransform(1, 0, 0, 1, 0, 0);
  cctx.scale(
    Math.min(window.devicePixelRatio, 2),
    Math.min(window.devicePixelRatio, 2)
  );
}
sizeConfetti();

const confettiColors = ["#ff6fae", "#8a7bff", "#ffd36f", "#6fe0ff", "#9cff9c"];

function burstConfetti() {
  const cx = window.innerWidth * 0.5;
  const cy = window.innerHeight * 0.42;
  for (let i = 0; i < 140; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    confetti.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 5 + Math.random() * 7,
      color: confettiColors[(Math.random() * confettiColors.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      life: 1,
    });
  }
}

function drawConfetti() {
  requestAnimationFrame(drawConfetti);
  cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  if (!confetti.length) return;
  confetti.forEach((p) => {
    p.vy += 0.28;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 0.009;
    cctx.save();
    cctx.translate(p.x, p.y);
    cctx.rotate(p.rot);
    cctx.globalAlpha = Math.max(0, p.life);
    cctx.fillStyle = p.color;
    cctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    cctx.restore();
  });
  confetti = confetti.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
}
drawConfetti();

/* ------------------------- resize -------------------------------- */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  sizeConfetti();
});

/* keyboard: Enter in textarea (with Cmd/Ctrl) decides */
optionsEl.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") decide();
});
