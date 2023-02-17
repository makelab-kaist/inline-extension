// Constants & globals
// Visuals
const WINDOW_HEIGHT = 150;
const MARGIN = 20;
const LEGEND_SIZE = 15;
const TEXT_SIZE = 15;
const TEXT_OFFSET = 50;
const colors = [
  '#ff3a28',
  '#147df5',
  '#05ff11',
  '#ffd300',
  '#0aefff',
  '#deff0a',
  '#580aff',
  '#be0aff',
  '#0aff99',
  '#DC0065',
];
const STROKE_LINE = 1;
const STROKE_DOT = 5;

// Data
const BUFFER_SIZE = 500;
const buffer = Array(BUFFER_SIZE).fill([]);
const MIN_TICKS = 10;
const MAX_TICKS = 500;
const STEP_TICK = 10;
let ticks = MAX_TICKS / 2;

const MIN_Y_RESOLUTION = 10;
let channels = 0;
let minvalue = -MIN_Y_RESOLUTION / 2;
let maxvalue = MIN_Y_RESOLUTION / 2;

let pause = false;

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

  if (pause) return;

  let incomingData = toNumberArray(value);
  addToBuffer(incomingData);
  getNumberOfChannels();
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
  background(0);

  // draw 0 axis
  drawAxis();

  // recompute minvalue
  const toDraw = clipDataToTicks(buffer);
  updateMinMax(toDraw.flat());

  drawMouseShade();

  // draw channels
  const channels = getNumberOfChannels();
  for (let i = 0; i < channels; i++) {
    const channelData = toDraw.map((e) => e[i]);
    const color = getColor(i);
    drawChannel(channelData, color);
    const label = getDataAtIndex(channelData);
    drawTooltip(label, i);
  }

  // draw a legend
  drawLegend(channels, 10);

  if (pause) {
    drawPause();
  }
}

function mouseWheel(event) {
  // increase of decrease visualized ticks within range
  ticks += event.delta >= 0 ? STEP_TICK : -STEP_TICK;
  if (ticks <= MIN_TICKS) ticks = MIN_TICKS;
  if (ticks >= MAX_TICKS) ticks = MAX_TICKS;
}

function keyPressed() {
  if (key === ' ') {
    // SPACE
    pause = !pause;
  }
}

// Draw
function drawTooltip(label, channel) {
  textSize(TEXT_SIZE);
  const color = getColor(channel);
  const x = mouseX + TEXT_OFFSET;
  const y = mouseY + TEXT_SIZE * channel;
  fill(color);
  noStroke(1);
  text(`${label}`, x, y);
}

function drawAxis() {
  const h = height - MARGIN;
  const y = h - map(0, minvalue, maxvalue, MARGIN, h) + MARGIN;
  stroke(255);
  strokeWeight(0.4);
  line(0, y, width, y);
}

function drawChannel(data, color) {
  const gap = width / (ticks - 1);
  let px, py;
  for (let i = 0; i < data.length; i++) {
    const datapoint = data[i];
    if (datapoint === undefined) {
      px = undefined;
      py = undefined;
      continue;
    }
    // or draw
    const x = i * gap;
    const h = height - MARGIN;
    const y = h - map(datapoint, minvalue, maxvalue, MARGIN, h) + MARGIN;

    stroke(color);
    strokeWeight(STROKE_LINE);
    // line
    if (px !== undefined || py !== undefined) line(px, py, x, y);
    // dot
    strokeWeight(STROKE_DOT);
    point(x, y);
    px = x;
    py = y;
  }
}

function drawMouseShade() {
  const gap = width / (ticks - 1);
  const index = Math.floor((mouseX - gap / 2) / gap);
  noStroke();
  fill(255, 255, 255, 50);
  rect(index * gap + gap / 2, 0, gap, height);
}

function drawLegend(n, size) {
  for (let i = 0; i < n; i++) {
    fill(getColor(i));
    noStroke();
    rect(i * (size + size), 0, size, size);
  }
}

function drawPause() {
  textSize(TEXT_SIZE * 5);
  const sz = textWidth('⏸') / 2;
  text('⏸', width / 2 - sz, height / 2 + sz);
}

// Others
function getColor(channel) {
  return colors[channel % colors.length];
}

function getDataAtIndex(channelData) {
  const gap = width / (ticks - 1);
  const index = Math.floor((mouseX - gap / 2) / gap) + 1;
  if (index < 0 || index > channelData.length) return undefined;
  return channelData[index];
}

function toNumberArray(arr) {
  return arr.map((e) => {
    const v = Number.parseFloat(e);
    if (typeof v === 'undefined' || isNaN(v)) return undefined;
    return v;
  });
}

function getNumberOfChannels() {
  return buffer[buffer.length - 1]?.length;
}

function addToBuffer(incomingData) {
  buffer.push(incomingData);
  buffer.shift();
}

function updateMinMax(data) {
  const filtered = data.filter((e) => e !== undefined);
  minvalue = min(filtered) - MIN_Y_RESOLUTION;
  maxvalue = max(filtered) + MIN_Y_RESOLUTION;
}

function clipDataToTicks(data) {
  return data.slice(-ticks);
}
