const socket = io('http://localhost:3300');
let msg = 0;

socket.on('connect', () => {
  console.log('Connected here we go');
});

socket.on('data', (data) => {
  console.log(data);
  msg = data;
});

function setup() {
  createCanvas(windowWidth - 100, 100);
  textSize(32);
}

function draw() {
  background(125);
  fill(255, 0, 0);
  ellipse(mouseX, mouseY, SIZE, SIZE);
  stroke(0);
  text(msg, 20, 20);
}
