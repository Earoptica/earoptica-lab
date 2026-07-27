const canvas = document.getElementById("pixel-world");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

let mouseX = -1000;
let mouseY = -1000;

const spacing = 20;
const pixelSize = 16;

/* Onzichtbare interactiezone */
const radius = 140;

/* Sterkte van de migratie */
const pushStrength = 6.5;

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
        x: x,
        y: y,
        vx: 0,
        vy: 0
      });
    }
  }
}

function updatePixel(pixel) {
  const dx = pixel.x - mouseX;
  const dy = pixel.y - mouseY;

  const distance = Math.sqrt(
    dx * dx +
    dy * dy
  );

  /*
    Onzichtbare cirkel rond de muis.
    Pixels binnen deze radius worden
    van de cursor weggeduwd.
  */

  if (distance < radius && distance > 0) {
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
    Trek pixels langzaam terug
    naar hun oorspronkelijke plaats.
  */

  pixel.vx +=
    (pixel.homeX - pixel.x) * 0.012;

  pixel.vy +=
    (pixel.homeY - pixel.y) * 0.012;

  /*
    Demping.
    Hogere waarde = langer blijven bewegen.
  */

  pixel.vx *= 0.93;
  pixel.vy *= 0.93;

  pixel.x += pixel.vx;
  pixel.y += pixel.vy;
}

function draw() {
  /*
    Zwarte laag onder de groene pixels.
    Deze wordt zichtbaar wanneer de
    groene pixels migreren.
  */

  ctx.fillStyle = "#000000";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  /*
    Groene pixelhuid
  */

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

window.addEventListener(
  "mousemove",
  (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }
);

window.addEventListener(
  "mouseleave",
  () => {
    mouseX = -1000;
    mouseY = -1000;
  }
);

window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();
draw();
