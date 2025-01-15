let walls = [];
let particle;
let flashes = []; // Lista de destellos

let wallCount = 5; // Número de paredes aleatorias
let rayCount = 1; // Incremento de ángulo para los rayos
let rotationSpeed = 0.01; // Velocidad de rotación para las paredes
let maxFlashes = 0; // Máximo número de destellos (inicia en 0)

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Crear paredes aleatorias
  for (let i = 0; i < wallCount; i++) {
    let x1 = random(width);
    let y1 = random(height);
    let x2 = random(width);
    let y2 = random(height);
    walls.push(new RotatingBoundary(x1, y1, x2, y2));
  }

  // Crear paredes fijas (bordes de la pantalla)
  walls.push(new Boundary(-1, -1, width, -1)); // Pared superior
  walls.push(new Boundary(width, -1, width, height)); // Pared derecha
  walls.push(new Boundary(width, height, -1, height)); // Pared inferior
  walls.push(new Boundary(-1, height, -1, -1)); // Pared izquierda

  particle = new Particle(); // Partícula controlada por el mouse
  noCursor();
}

function draw() {
  // Cambiar el fondo según el número de destellos
  let bgColor;
  switch (maxFlashes) {
    case 1:
      bgColor = color(102, 66, 255); // #6642ff
      break;
    case 2:
      bgColor = color(91, 229, 91); // #5be55b
      break;
    case 3:
      bgColor = color(253, 45, 45); // #fd2d2d
      break;
    case 4:
      bgColor = color(248, 100, 248); // #f8f8f8
      break;
    case 5:
      bgColor = color(32, 32, 32); // #202020
      break;
    default:
      bgColor = color(0);
  }
  background(bgColor);

  // Dibujar y actualizar las paredes
  for (let wall of walls) {
    wall.update(); // Actualizar rotación si aplica
    wall.show();
  }

  // Dibujar y actualizar la partícula controlada por el mouse
  particle.update(mouseX, mouseY);
  particle.show();
  particle.look(walls);

  // Dibujar y actualizar los destellos
  for (let i = flashes.length - 1; i >= 0; i--) {
    flashes[i].update();
    flashes[i].show();
    flashes[i].look(walls);
  }

  // Mostrar texto según el número de partículas
  displayText();

  // Mostrar texto inferior
  textSize(16);
  textAlign(CENTER);
  text("1 particle = About me", width / 2, height - 80);
  text("2 particles = Menu", width / 2, height - 60);
  text("3 particles = Projects", width / 2, height - 40);
  text("4 particles = Contact here", width / 2, height - 20);
  text("5 particles = Social Media", width / 2, height);
}

// Mostrar el texto centrado según el número de partículas
function displayText() {
  let textContent = "";
  switch (maxFlashes) {
    case 1:
      textContent = "About me";
      break;
    case 2:
      textContent = "Menu";
      break;
    case 3:
      textContent = "Projects";
      break;
    case 4:
      textContent = "Contact here";
      break;
    case 5:
      textContent = "Social Media";
      break;
  }
  if (maxFlashes > 0) {
    fill(255);
    textSize(64);
    textAlign(CENTER, CENTER);
    text(textContent, width / 2, height / 2);
  }
}

// Controlar cantidad de partículas con el scroll del mouse
function mouseWheel(event) {
  if (event.delta > 0 && maxFlashes > 0) {
    maxFlashes--;
  } else if (event.delta < 0 && maxFlashes < 5) {
    maxFlashes++;
  }
  flashes = []; // Reiniciar las partículas
  for (let i = 0; i < maxFlashes; i++) {
    flashes.push(new Particle(random(width), random(height), true));
  }
}

// Clase para las paredes rotatorias
class RotatingBoundary {
  constructor(x1, y1, x2, y2) {
    this.originalA = createVector(x1, y1);
    this.originalB = createVector(x2, y2);
    this.center = p5.Vector.lerp(this.originalA, this.originalB, 0.5); // Centro de la línea
    this.angle = random(TWO_PI); // Ángulo inicial
    this.length = dist(x1, y1, x2, y2); // Longitud de la línea
  }

  update() {
    this.angle += rotationSpeed;
  }

  show() {
    let offsetX = this.length / 2 * cos(this.angle);
    let offsetY = this.length / 2 * sin(this.angle);
    let a = createVector(this.center.x - offsetX, this.center.y - offsetY);
    let b = createVector(this.center.x + offsetX, this.center.y + offsetY);
    stroke(255);
    strokeWeight(2);
    line(a.x, a.y, b.x, b.y);
    this.a = a;
    this.b = b;
  }
}

// Clase para las paredes estáticas
class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }
  update() {}
  show() {
    stroke(255);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

// Clase para las partículas
class Particle {
  constructor(x = width / 2, y = height / 2, isFlash = false) {
    this.pos = createVector(x, y);
    this.vel = isFlash ? p5.Vector.random2D().mult(3) : createVector(0, 0);
    this.rays = [];
    for (let a = 0; a < 360; a += rayCount) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }

  update(x, y) {
    if (x !== undefined && y !== undefined) {
      this.pos.set(x, y);
    } else {
      this.pos.add(this.vel);
    }
  }

  look(walls) {
    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }
      if (closest) {
        stroke(255, 100);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 4);
  }
}

// Clase para Rayos
class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;
    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    }
  }
}
