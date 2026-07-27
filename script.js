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

const maxRadius = 140;
const maxPush = 9;

let radius = 0;
let targetRadius = 0;

let pushStrength = 0;
let targetPushStrength = 0;

let movementTimer = null;

const pixels = [];


/* ==============================
   CANVAS
============================== */

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  createPixels();
}


/* ==============================
   PIXELS
============================== */

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


/* ==============================
   PHYSICS
============================== */

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

  /* terug naar raster */

  pixel.vx +=
    (pixel.homeX - pixel.x) * 0.014;

  pixel.vy +=
    (pixel.homeY - pixel.y) * 0.014;

  /* momentum */

  pixel.vx *= 0.92;
  pixel.vy *= 0.92;

  pixel.x += pixel.vx;
  pixel.y += pixel.vy;
}


/* ==============================
   SPEED CALCULATION
============================== */

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

  const normalizedSpeed =
    Math.min(speed / 2.2, 1);

  targetRadius =
    normalizedSpeed * maxRadius;

  targetPushStrength =
    normalizedSpeed * maxPush;

  pointerX = x;
  pointerY = y;

  previousX = x;
  previousY = y;

  lastMoveTime = now;

  clearTimeout(movementTimer);

  movementTimer = setTimeout(() => {
    targetRadius = 0;
    targetPushStrength = 0;
  }, 60);
}


/* ==============================
   DESKTOP
============================== */

window.addEventListener(
  "mousemove",
  (event) => {
    updateInteraction(
      event.clientX,
      event.clientY
    );
  }
);


/* ==============================
   SMARTPHONE / TOUCH
============================== */

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

    targetRadius = 20;
    targetPushStrength = 2;
  },
  { passive: true }
);


window.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];

    if (!touch) return;

    /*
      Zorgt ervoor dat de browser
      deze beweging niet als scroll
      interpreteert.
    */

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


/* ==============================
   DRAW
============================== */

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


  /* zwarte onderlaag */

  ctx.fillStyle = "#000000";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /* groene pixels */

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


/* ==============================
   RESIZE
============================== */

window.addEventListener(
  "resize",
  resizeCanvas
);


/* ==============================
   START
============================== */

resizeCanvas();
draw();
