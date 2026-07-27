const canvas = document.getElementById("pixel-world");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

let mouseX = -1000;
let mouseY = -1000;

let previousMouseX = -1000;
let previousMouseY = -1000;

let lastMoveTime = performance.now();

const spacing = 20;
const pixelSize = 16;


/* ========================================
   INTERACTIE
======================================== */

const minRadius = 0;
const maxRadius = 140;

let radius = 0;
let targetRadius = 0;

const minPush = 0;
const maxPush = 9;

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
   PIXEL GRID
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


  /*
    Duw pixels weg van de cursor.
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
    Terug naar oorspronkelijke positie.
  */

  pixel.vx +=
    (pixel.homeX - pixel.x) * 0.014;

  pixel.vy +=
    (pixel.homeY - pixel.y) * 0.014;


  /*
    Momentum.
  */

  pixel.vx *= 0.92;
  pixel.vy *= 0.92;

  pixel.x += pixel.vx;
  pixel.y += pixel.vy;
}


/* ========================================
   ANIMATIE
======================================== */

function draw() {

  /*
    Radius groeit rustig,
    maar valt sneller terug.
  */

  const radiusSpeed =
    targetRadius === 0
      ? 0.28
      : 0.14;

  radius +=
    (targetRadius - radius) *
    radiusSpeed;


  /*
    Zelfde principe voor de kracht.
  */

  const pushSpeed =
    targetPushStrength === 0
      ? 0.3
      : 0.14;

  pushStrength +=
    (targetPushStrength - pushStrength) *
    pushSpeed;


  /*
    Heel kleine waarden echt op nul zetten.
  */

  if (radius < 0.5 && targetRadius === 0) {
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
    Groene pixels.
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
   MUISBEWEGING
======================================== */

window.addEventListener(
  "mousemove",
  (event) => {

    const now = performance.now();


    /*
      Eerste muisbeweging:
      vorige positie meteen initialiseren.
    */

    if (previousMouseX < -500) {
      previousMouseX = event.clientX;
      previousMouseY = event.clientY;

      mouseX = event.clientX;
      mouseY = event.clientY;

      lastMoveTime = now;

      return;
    }


    const deltaX =
      event.clientX - previousMouseX;

    const deltaY =
      event.clientY - previousMouseY;

    const deltaTime =
      Math.max(
        now - lastMoveTime,
        1
      );


    /*
      Afgelegde afstand.
    */

    const distanceMoved =
      Math.sqrt(
        deltaX * deltaX +
        deltaY * deltaY
      );


    /*
      Pixels per milliseconde.
    */

    const speed =
      distanceMoved / deltaTime;


    /*
      Normaliseer snelheid.

      0    = stil
      1    = snel
    */

    const normalizedSpeed =
      Math.min(
        speed / 2.2,
        1
      );


    /*
      Radius volledig afhankelijk
      van bewegingssnelheid.
    */

    targetRadius =
      normalizedSpeed *
      maxRadius;


    /*
      Kracht ook afhankelijk
      van snelheid.
    */

    targetPushStrength =
      normalizedSpeed *
      maxPush;


    /*
      Cursorpositie bijwerken.
    */

    mouseX = event.clientX;
    mouseY = event.clientY;

    previousMouseX = mouseX;
    previousMouseY = mouseY;

    lastMoveTime = now;


    /*
      Stilstand detecteren.
    */

    clearTimeout(movementTimer);

    movementTimer = setTimeout(() => {

      targetRadius = 0;
      targetPushStrength = 0;

    }, 55);

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

    mouseX = -1000;
    mouseY = -1000;

    previousMouseX = -1000;
    previousMouseY = -1000;

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
