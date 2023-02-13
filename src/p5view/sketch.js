const socket = io('http://localhost:3300');

socket.on('connect', () => {
  console.log('Connected here we go');
});

socket.on('data', (data) => {
  console.log(data);
});

function setup() {
  createCanvas(windowWidth - 100, 100);
}

function draw() {
  background(125);
  fill(255, 0, 0);
  ellipse(mouseX, mouseY, SIZE, SIZE);
}
