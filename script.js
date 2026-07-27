const canvas = document.getElementById("pixel-world");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

let mouseX = -1000;
let mouseY = -1000;

let previousMouseX = mouseX;
let previousMouseY = mouseY;

let lastMoveTime = performance.now();

const spacing = 20;
const pixelSize = 16;

/* Interactiezone */
const minRadius = 15;
const maxRadius = 160;

let radius = 0;
let targetRadius = 0;

/* Migratiekracht */
const minPush = 2;
const maxPush = 9;

let pushStrength = minPush;
let targetPushStrength = minPush;

/* Pixels */
const pixels = [];

let movementTimer;


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
   PIXELBEWEGING
======================================== */

function updatePixel(pixel) {
  const dx = pixel.x - mouseX;
  const dy = pixel.y - mouseY;

  const distance = Math.sqrt(
    dx * dx +
    dy * dy
  );

  /*
    Pixels binnen de onzichtbare radius
    worden van de cursor weggeduwd.
  */

  if (
    radius > 0 &&
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
    Pixels keren langzaam terug
    naar hun oorspronkelijke positie.
  */

  pixel.vx +=
    (pixel.homeX - pixel.x) * 0.012;

  pixel.vy +=
    (pixel.homeY - pixel.y) * 0.012;

  /*
    Momentum / demping.
  */

  pixel.vx *= 0.93;
  pixel.vy *= 0.93;

  pixel.x += pixel.vx;
  pixel.y += pixel.vy;
}


/* ========================================
   ANIMATIE
======================================== */

function draw() {
  /*
    Radius en kracht bewegen vloeiend
    naar hun doelwaarde.
  */

  radius +=
    (targetRadius - radius) * 0.12;

  pushStrength +=
    (targetPushStrength - pushStrength) * 0.12;


  /*
    Zwarte onderlaag.
    Deze wordt zichtbaar wanneer
    de groene pixels migreren.
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
   MUISBEWEGING + SNELHEID
======================================== */

window.addEventListener("mousemove", (event) => {
  const now = performance.now();

  const deltaX =
    event.clientX - previousMouseX;

  const deltaY =
    event.clientY - previousMouseY;

  const deltaTime =
    Math.max(now - lastMoveTime, 1);

  /*
    Hoeveel afstand werd afgelegd
    sinds het vorige mousemove-event?
  */

  const distanceMoved =
    Math.sqrt(
      deltaX * deltaX +
      deltaY * deltaY
    );

  /*
    Snelheid in pixels per milliseconde.
  */

  const speed =
    distanceMoved / deltaTime;

  /*
    Normaliseer snelheid.

    Vanaf ongeveer 2 px/ms
    behandelen we de beweging als maximaal.
  */

  const normalizedSpeed =
    Math.min(speed / 2, 1);

  /*
    Traag bewegen = kleine radius.
    Snel bewegen = grotere radius.
  */

  targetRadius =
    minRadius +
    normalizedSpeed *
    (maxRadius - minRadius);

  /*
    Traag bewegen = minder kracht.
    Snel bewegen = sterkere migratie.
  */

  targetPushStrength =
    minPush +
    normalizedSpeed *
    (maxPush - minPush);


  mouseX = event.clientX;
  mouseY = event.clientY;

  previousMouseX = mouseX;
  previousMouseY = mouseY;

  lastMoveTime = now;


  /*
    Wanneer de muis stopt,
    krimpt de interactiezone terug naar nul.
  */

  clearTimeout(movementTimer);

  movementTimer = setTimeout(() => {
    targetRadius = 0;
    targetPushStrength = minPush;
  }, 110);
});


/* ========================================
   MUIS VERLAAT SCHERM
======================================== */

window.addEventListener("mouseleave", () => {
  targetRadius = 0;
  targetPushStrength = minPush;

  mouseX = -1000;
  mouseY = -1000;
});


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
