// Constants
const WINDOW_HEIGHT = 150;
const MIN_BIN_COUNTER = 10;
const MIN_INPUT_RANGE = 20;
const BINS = 20;

// Globals
let bins = [];
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
  addValuesToBins(incomingData);
});

// P5.js sketch here
function setup() {
  createCanvas(windowWidth - 100, WINDOW_HEIGHT);
  createBins();
  textAlign(CENTER);
}

function draw() {
  clear();
  // background(0);
  // Draw the bins
  stroke(200);
  strokeWeight(0.3);

  const yMax = max([...bins, MIN_BIN_COUNTER]);
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

function mouseWheel(event) {
  range += event.delta >= 0 ? 10 : -10;
  if (range <= MIN_INPUT_RANGE) range = MIN_INPUT_RANGE;
  createBins();
}

function createBins() {
  bins = Array(BINS).fill(0);
  binLength = width / BINS;
}

function toNumberArray(arr) {
  return arr.map((e) => {
    // attempt conversion
    try {
      return Number.parseFloat(e);
    } catch (error) {
      return 0;
    }
  });
}

function addValuesToBins(values) {
  let binsize = range / BINS;
  values.forEach((e) => {
    let bin = (e / binsize) | 0;
    if (bin >= 0 && bin < bins.length) {
      bins[bin] += 1;
    }
  });
}
