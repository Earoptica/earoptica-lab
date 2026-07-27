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

/* Radius */
const minRadius = 25;
const maxRadius = 180;

let radius = 0;
let targetRadius = 0;

/* Migratiekracht */
const minPush = 2.5;
const maxPush = 8;

let pushStrength = minPush;
let targetPushStrength = minPush;

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
   PIXELS
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
  const dx = pixel.x - mouseX;
  const dy = pixel.y - mouseY;

  const distance = Math.sqrt(
    dx * dx +
    dy * dy
  );

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

  /* langzaam terug naar thuispositie */

  pixel.vx +=
    (pixel.homeX - pixel.x) * 0.012;

  pixel.vy +=
    (pixel.homeY - pixel.y) * 0.012;

  /* momentum */

  pixel.vx *= 0.93;
  pixel.vy *= 0.93;

  pixel.x += pixel.vx;
  pixel.y += pixel.vy;
}


/* ========================================
   ANIMATION
======================================== */

function draw() {
  /*
    Smooth naar doelwaarden bewegen.
  */

  radius +=
    (targetRadius - radius) * 0.12;

  pushStrength +=
    (targetPushStrength - pushStrength) * 0.12;


  /* zwarte onderlaag */

  ctx.fillStyle = "#000000";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  /* groene pixels */

  pixels.forEach((pixel) => {
    updatePixel(pixel);

    ctx.fillStyle = "#00ff00";

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
   MUIS
======================================== */

window.addEventListener(
  "mousemove",
  (event) => {

    const now = performance.now();

    const deltaX =
      event.clientX - previousMouseX;

    const deltaY =
      event.clientY - previousMouseY;

    const deltaTime =
      Math.max(now - lastMoveTime, 1);


    /*
      Afstand per milliseconde.
    */

    const distanceMoved =
      Math.sqrt(
        deltaX * deltaX +
        deltaY * deltaY
      );

    const speed =
      distanceMoved / deltaTime;


    /*
      Normaliseer snelheid.

      Rond 2 px/ms is al vrij snel.
    */

    const normalizedSpeed =
      Math.min(speed / 2, 1);


    /*
      Traag bewegen:
      kleine radius.

      Snel bewegen:
      grote radius.
    */

    targetRadius =
      minRadius +
      normalizedSpeed *
      (maxRadius - minRadius);


    /*
      Ook de kracht groeit mee
      met de snelheid.
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
      Na stoppen krimpt alles terug.
    */

    clearTimeout(movementTimer);

    movementTimer = setTimeout(() => {
      targetRadius = 0;
      targetPushStrength = minPush;
    }, 110);

  }
);


window.addEventListener(
  "mouseleave",
  () => {
    targetRadius = 0;
    targetPushStrength = minPush;

    mouseX = -1000;
    mouseY = -1000;
  }
);


window.addEventListener(
  "resize",
  resizeCanvas
);


/* ========================================
   START
======================================== */

resizeCanvas();
draw();
