const canvas = document.getElementById("pixel-world");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

let pointerX = -1000;
let pointerY = -1000;

let previousPointerX = -1000;
let previousPointerY = -1000;

let lastMoveTime = performance.now();

const spacing = 20;
const pixelSize = 16;

const maxRadius = 140;
const maxPush = 9;

let radius = 0;
let targetRadius = 0;

let pushStrength = 0;
let targetPushStrength = 0;

let movementTimer = null;

const pixels = [];

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  createPixels();
}

function createPixels() {
  pixels.length = 0;

  for (let x = 0; x < width + spacing; x += spacing) {
    for (let y = 0; y < height + spacing; y += spacing) {
      pixels.push({
        homeX: x,
        homeY: y,
        x,
        y,
        vx: 0,
        vy: 0
      });
    }
  }
}

function updatePixel(pixel) {
  const dx = pixel.x - pointerX;
  const dy = pixel.y - pointerY;

  const distance = Math.sqrt(
    dx * dx +
    dy * dy
  );

  if (
    radius > 1 &&
    distance < radius &&
    distance > 0
  ) {
    const force =
      (radius - distance) / radius;

    pixel.vx +=
      (dx / distance) *
      force *
      pushStrength;

    pixel.vy +=
      (dy / distance) *
      force *
      pushStrength;
  }

  pixel.vx +=
    (pixel.homeX - pixel.x) * 0.014;

  pixel.vy +=
    (pixel.homeY - pixel.y) * 0.014;

  pixel.vx *= 0.92;
  pixel.vy *= 0.92;

  pixel.x += pixel.vx;
  pixel.y += pixel.vy;
}

function draw() {
  const radiusSpeed =
    targetRadius === 0
      ? 0.28
      : 0.14;

  const pushSpeed =
    targetPushStrength === 0
      ? 0.3
      : 0.14;

  radius +=
    (targetRadius - radius) *
    radiusSpeed;

  pushStrength +=
    (targetPushStrength - pushStrength) *
    pushSpeed;

  if (radius < 0.5 && targetRadius === 0) {
    radius = 0;
  }

  if (
    pushStrength < 0.05 &&
    targetPushStrength === 0
  ) {
    pushStrength = 0;
  }

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#00ff00";

  pixels.forEach((pixel) => {
    updatePixel(pixel);

    ctx.fillRect(
      Math.round(pixel.x),
      Math.round(pixel.y),
      pixelSize,
      pixelSize
    );
  });

  requestAnimationFrame(draw);
}

function handlePointerMove(event) {
  const now = performance.now();

  if (previousPointerX < -500) {
    previousPointerX = event.clientX;
    previousPointerY = event.clientY;

    pointerX = event.clientX;
    pointerY = event.clientY;

    lastMoveTime = now;
    return;
  }

  const deltaX =
    event.clientX - previousPointerX;

  const deltaY =
    event.clientY - previousPointerY;

  const deltaTime =
    Math.max(now - lastMoveTime, 1);

  const distanceMoved =
    Math.sqrt(
      deltaX * deltaX +
      deltaY * deltaY
    );

  const speed =
    distanceMoved / deltaTime;

  const normalizedSpeed =
    Math.min(
      speed / 2.2,
      1
    );

  targetRadius =
    normalizedSpeed *
    maxRadius;

  targetPushStrength =
    normalizedSpeed *
    maxPush;

  pointerX = event.clientX;
  pointerY = event.clientY;

  previousPointerX = pointerX;
  previousPointerY = pointerY;

  lastMoveTime = now;

  clearTimeout(movementTimer);

  movementTimer = setTimeout(() => {
    targetRadius = 0;
    targetPushStrength = 0;
  }, 55);
}

/* Desktop + touch + stylus */
window.addEventListener(
  "pointermove",
  handlePointerMove
);

/* Touch: zodra je je vinger neerzet */
window.addEventListener(
  "pointerdown",
  (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;

    previousPointerX = pointerX;
    previousPointerY = pointerY;

    lastMoveTime = performance.now();
  }
);

window.addEventListener(
  "pointerup",
  () => {
    targetRadius = 0;
    targetPushStrength = 0;
  }
);

window.addEventListener(
  "pointercancel",
  () => {
    targetRadius = 0;
    targetPushStrength = 0;
  }
);

window.addEventListener(
  "pointerleave",
  () => {
    targetRadius = 0;
    targetPushStrength = 0;

    pointerX = -1000;
    pointerY = -1000;

    previousPointerX = -1000;
    previousPointerY = -1000;

    clearTimeout(movementTimer);
  }
);

window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();
draw();
