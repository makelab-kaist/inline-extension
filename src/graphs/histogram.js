// Constants
const WINDOW_HEIGHT = 150;
const MIN_INPUT_RANGE = 20;
const MIN_BIN_VALUE = 10;
const BINS = 20;

// Globals
let allData = [];
let binLength = 1;
let range = 500;

// Socket operations
const socket = io('http://localhost:3300');
socket.on('connect', () => {
  // console.log('Ready');
});

socket.on('data', (data) => {
  const {
    id,
    value: { value, stringValue, outputFormat },
  } = data;

  let incomingData = toNumberArray(value);
  allData = [...allData, ...incomingData];
});

// P5.js sketch here
function setup() {
  createCanvas(windowWidth - 100, WINDOW_HEIGHT);
  binLength = width / BINS;
  textAlign(CENTER);
}

function windowResized() {
  resizeCanvas(windowWidth - 100, WINDOW_HEIGHT);
  binLength = width / BINS;
}

function draw() {
  clear();
  // background(0);
  // Compute bins
  const bins = computeBins(allData);

  // Draw the bins
  stroke(200);
  strokeWeight(0.3);

  const yMax = max([...bins, MIN_BIN_VALUE]);
  let binsize = (range / BINS) | 0;

  for (let i = 0; i < bins.length; i++) {
    let y = height - map(bins[i], 0, yMax, 0, height);
    fill('#2066D9'); // blue
    rect(i * binLength, y, binLength, height);
    line(i * binLength, 0, i * binLength, height);
    fill(255);
    textSize(12);
    text(
      `[${i * binsize}-${i * binsize + binsize})`,
      i * binLength + binLength / 2,
      10
    );
    if (bins[i] > 0) {
      fill('#E8A013'); //yellow
      textSize(18);
      text(bins[i], i * binLength + binLength / 2, height - 10);
    }
  }
}

function keyPressed() {
  if (key == 'C' || key == 'c') {
    allData = [];
  }
}

function mouseWheel(event) {
  range += event.delta >= 0 ? MIN_INPUT_RANGE : -MIN_INPUT_RANGE;
  if (range <= MIN_INPUT_RANGE) range = MIN_INPUT_RANGE;
}

function toNumberArray(arr) {
  return arr.map((e) => Number.parseFloat(e));
}

function computeBins(values) {
  const bins = Array(BINS).fill(0);
  let binsize = range / BINS;
  values.forEach((e) => {
    if (!isNaN(e)) {
      let bin = (e / binsize) | 0;
      if (bin >= 0 && bin < bins.length) {
        bins[bin] += 1;
      }
    }
  });
  return bins;
}
