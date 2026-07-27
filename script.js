const canvas = document.getElementById("pixel-world");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

let pointerX = -1000;
let pointerY = -1000;

let previousX = -1000;
let previousY = -1000;

let lastMoveTime = performance.now();

const spacing = 20;
const pixelSize = 16;

/* ========================================
   INTERACTIE
======================================== */

const maxRadius = 140;
const maxPush = 9;

let radius = 0;
let targetRadius = 0;

let pushStrength = 0;
let targetPushStrength = 0;

let movementTimer = null;

/* ========================================
   PIXELS
======================================== */

const pixels = [];

/* ========================================
   CANVAS
======================================== */

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  createPixels();
}

/* ========================================
   PIXELS MAKEN
======================================== */

function createPixels() {
  pixels.length = 0;

  for (let x = 0; x < width + spacing; x += spacing) {
    for (let y = 0; y < height + spacing; y += spacing) {
      pixels.push({
        homeX: x,
        homeY: y,

        x: x,
        y: y,

        vx: 0,
        vy: 0
      });
    }
  }
}

/* ========================================
   PIXEL PHYSICS
======================================== */

function updatePixel(pixel) {
  const dx = pixel.x - pointerX;
  const dy = pixel.y - pointerY;

  const distance = Math.sqrt(
    dx * dx +
    dy * dy
  );

  /*
    Pixels binnen de onzichtbare radius
    worden weggeduwd.
  */

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

  /*
    Langzame terugkeer naar
    oorspronkelijke positie.
  */

  pixel.vx +=
    (pixel.homeX - pixel.x) * 0.008;

  pixel.vy +=
    (pixel.homeY - pixel.y) * 0.008;

  /*
    Meer momentum / latency.
    Hogere waarde = langer blijven bewegen.
  */

  pixel.vx *= 0.96;
  pixel.vy *= 0.96;

  pixel.x += pixel.vx;
  pixel.y += pixel.vy;
}

/* ========================================
   INTERACTIE OP BASIS VAN SNELHEID
======================================== */

function updateInteraction(x, y) {
  const now = performance.now();

  if (previousX < -500) {
    previousX = x;
    previousY = y;

    pointerX = x;
    pointerY = y;

    lastMoveTime = now;

    return;
  }

  const deltaX = x - previousX;
  const deltaY = y - previousY;

  const deltaTime =
    Math.max(now - lastMoveTime, 1);

  const distanceMoved =
    Math.sqrt(
      deltaX * deltaX +
      deltaY * deltaY
    );

  const speed =
    distanceMoved / deltaTime;

  /*
    Hoe sneller de beweging,
    hoe groter het effect.
  */

  const normalizedSpeed =
    Math.min(speed / 2.2, 1);

  targetRadius =
    normalizedSpeed *
    maxRadius;

  targetPushStrength =
    normalizedSpeed *
    maxPush;

  pointerX = x;
  pointerY = y;

  previousX = x;
  previousY = y;

  lastMoveTime = now;

  clearTimeout(movementTimer);

  /*
    Laat het effect nog even leven
    voordat het begint terug te vallen.
  */

  movementTimer = setTimeout(() => {
    targetRadius = 0;
    targetPushStrength = 0;
  }, 110);
}

/* ========================================
   ANIMATIE
======================================== */

function draw() {
  /*
    Meer latency:
    radius en kracht volgen hun target
    veel trager.
  */

  const radiusSpeed =
    targetRadius === 0
      ? 0.10
      : 0.07;

  const pushSpeed =
    targetPushStrength === 0
      ? 0.12
      : 0.07;

  radius +=
    (targetRadius - radius) *
    radiusSpeed;

  pushStrength +=
    (targetPushStrength - pushStrength) *
    pushSpeed;

  if (
    radius < 0.5 &&
    targetRadius === 0
  ) {
    radius = 0;
  }

  if (
    pushStrength < 0.05 &&
    targetPushStrength === 0
  ) {
    pushStrength = 0;
  }

  /*
    Zwarte onderlaag.
  */

  ctx.fillStyle = "#000000";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  /*
    Groene pixelhuid.
  */

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

/* ========================================
   DESKTOP
======================================== */

window.addEventListener(
  "mousemove",
  (event) => {
    updateInteraction(
      event.clientX,
      event.clientY
    );
  }
);

/* ========================================
   SMARTPHONE / TOUCH
======================================== */

window.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.touches[0];

    if (!touch) return;

    pointerX = touch.clientX;
    pointerY = touch.clientY;

    previousX = pointerX;
    previousY = pointerY;

    lastMoveTime =
      performance.now();
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];

    if (!touch) return;

    event.preventDefault();

    updateInteraction(
      touch.clientX,
      touch.clientY
    );
  },
  { passive: false }
);

window.addEventListener(
  "touchend",
  () => {
    targetRadius = 0;
    targetPushStrength = 0;

    previousX = -1000;
    previousY = -1000;
  }
);

window.addEventListener(
  "touchcancel",
  () => {
    targetRadius = 0;
    targetPushStrength = 0;

    previousX = -1000;
    previousY = -1000;
  }
);

/* ========================================
   MUIS VERLAAT SCHERM
======================================== */

window.addEventListener(
  "mouseleave",
  () => {
    targetRadius = 0;
    targetPushStrength = 0;

    pointerX = -1000;
    pointerY = -1000;

    previousX = -1000;
    previousY = -1000;

    clearTimeout(movementTimer);
  }
);

/* ========================================
   RESIZE
======================================== */

window.addEventListener(
  "resize",
  resizeCanvas
);

/* ========================================
   START
======================================== */

resizeCanvas();
draw();
