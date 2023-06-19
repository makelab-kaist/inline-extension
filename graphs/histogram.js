// Constants & globals
// Visuals
const WINDOW_HEIGHT = 150;
const MARGIN = 20;
const TEXT_SIZE = 20;
const TEXT_OFFSET = 30;
const color = '#147df5';
const highlight = '#ffd300';
const textColor = '#ff3a28';
const bgColor = '#eee';

// Data
let buffer = new Map();

// Bins
const MIN_MAX_VALUE = 10;
const MIN_BINS = 10;
const STEP = MIN_BINS;
const MAX_BINS = 100;
let nbins = MAX_BINS / 2;

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

  if (id !== annotationId) return; // not for me

  let incomingData = toNumberArray(value);
  addToBuffer(incomingData);
});

// P5.js sketch here
function setup() {
  createCanvas(windowWidth - 100, WINDOW_HEIGHT);
}

function windowResized() {
  resizeCanvas(windowWidth - 100, WINDOW_HEIGHT);
}

function draw() {
  clear();
  background(bgColor);

  const bins = toBins(buffer, nbins);
  drawBins(bins);
  drawRanges(bins);
  drawTooltip(bins);
}

function drawBins(binsData) {
  if (binsData.length === 0) return;
  const gap = width / binsData.length;
  const values = binsData.map((e) => e.counter);
  const maxVal = Math.max(...values, MIN_MAX_VALUE);

  stroke(0);
  strokeWeight(1);
  textSize(TEXT_SIZE);

  for (let i = 0; i < binsData.length; i++) {
    // scaled data
    const { counter } = binsData[i];
    const x = i * gap;
    const y = map(counter, 0, maxVal, 0, height);
    if (mouseX >= x && mouseX <= x + gap) {
      fill(highlight);
    } else {
      fill(color);
    }
    rect(x, height - y, gap, height);
    // lines
    stroke(100);
    line(x, 0, x, height);
  }
}

function drawRanges(binsData) {
  if (binsData.length === 0) return;
  // draw ranges
  let minX = binsData[0].from | 0;
  let maxX = binsData[binsData.length - 1].to | 0;
  fill(textColor);
  textAlign(LEFT);
  text(`Min: ${minX} `, MARGIN, MARGIN);
  textAlign(RIGHT);
  text(`Max: ${maxX}`, width - MARGIN, MARGIN);
}

function drawTooltip(binsData) {
  if (binsData.length === 0) return;
  const gap = width / binsData.length;

  let index = (mouseX / gap) | 0;
  if (mouseX < 0) index = 0;
  if (index >= binsData.length) index = binsData.length - 1;
  const { counter, from, to } = binsData[index];
  if (counter == 0) return;

  const label = `${counter} [${from | 0}-${to | 0})`;

  textSize(TEXT_SIZE);
  let x = mouseX + TEXT_OFFSET;
  textAlign(LEFT);
  if (mouseX > width / 2) {
    x = mouseX - TEXT_OFFSET;
    textAlign(RIGHT);
  }
  const y = mouseY;
  fill(textColor);
  noStroke(1);

  text(`${label}`, x, y);
}

// Control
function mouseWheel(event) {
  nbins += event.delta >= 0 ? STEP : -STEP;
  if (nbins <= MIN_BINS) nbins = MIN_BINS;
  if (nbins >= MAX_BINS) nbins = MAX_BINS;
}

function keyPressed() {
  if (key === ' ') {
    // SPACE
    buffer = new Map();
  }
}

// Utils
function toNumberArray(arr) {
  return arr.map((e) => {
    const v = Number.parseFloat(e);
    if (typeof v === 'undefined' || isNaN(v)) return undefined;
    return v;
  });
}

function addToBuffer(incomingData) {
  incomingData.forEach((e) => {
    if (e !== undefined) {
      const counter = buffer.get(e);
      if (counter == undefined) {
        buffer.set(e, 0);
      } else {
        buffer.set(e, counter + 1);
      }
    }
  });
}

function toBins(data, nbins) {
  if (nbins === 0) return [];
  if (data.size == 0) return [];
  const values = [...data.keys()];
  const minvalue = Math.min(...values);
  const maxvalue = Math.max(...values);
  const totrange = maxvalue - minvalue;
  const binrange = totrange / nbins;

  const bins = Array(nbins)
    .fill(0)
    .map((e, i) => {
      return {
        counter: 0,
        from: minvalue + i * binrange,
        to: minvalue + i * binrange + binrange,
      };
    });

  [...data].forEach(([key, value], i) => {
    const index = map(key, minvalue, maxvalue, 0, nbins - 1) | 0;
    bins[index].counter += value;
  });
  return bins;
}
