#!/usr/bin/env node

const RAW_TEXT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const WRAP_WIDTH = 60;

const BASE = { r: 80,  g: 80,  b: 120 };
const PEAK = { r: 230, g: 235, b: 255 };

function wrap(text, width) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && line.length + 1 + word.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const LINES = wrap(RAW_TEXT, WRAP_WIDTH);
const SHIMMER_WIDTH = 12;

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function colorAt(flatIndex, shimmerPos) {
  const dist = Math.abs(flatIndex - shimmerPos);
  const t = smoothstep(Math.max(0, 1 - dist / SHIMMER_WIDTH));
  const r = lerp(BASE.r, PEAK.r, t);
  const g = lerp(BASE.g, PEAK.g, t);
  const b = lerp(BASE.b, PEAK.b, t);
  return `\x1b[38;2;${r};${g};${b}m`;
}

let firstRender = true;

function render(shimmerPos) {
  let out = '';

  if (!firstRender) {
    // Cursor is at end of the last line. Go up N-1 rows, then back to col 0.
    out += `\x1b[${LINES.length - 1}A\r`;
  }
  firstRender = false;

  for (let li = 0; li < LINES.length; li++) {
    for (let ci = 0; ci < LINES[li].length; ci++) {
      out += colorAt(ci, shimmerPos) + LINES[li][ci];
    }
    out += '\x1b[0m';
    if (li < LINES.length - 1) out += '\n';
  }

  process.stdout.write(out);
}

// Hide cursor
process.stdout.write('\x1b[?25l');

function cleanup() {
  process.stdout.write('\x1b[?25h');
  process.exit(0);
}
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

const PAUSE_FRAMES = 45;
let pos = -SHIMMER_WIDTH;
let pauseFrames = 0;
let pausing = false;

setInterval(() => {
  if (pausing) {
    if (++pauseFrames >= PAUSE_FRAMES) {
      pausing = false;
      pauseFrames = 0;
      pos = -SHIMMER_WIDTH;
    }
    return;
  }

  render(pos);
  pos += 0.4;

  if (pos > WRAP_WIDTH + SHIMMER_WIDTH) {
    pausing = true;
  }
}, 16);
