function setup() {
  createCanvas(windowWidth - 100, 100);
}

function draw() {
  background(125);
  fill(255, 0, 0);
  ellipse(mouseX, mouseY, SIZE, SIZE);
}

window.setup = setup;
window.draw = draw;
