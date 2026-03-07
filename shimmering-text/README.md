# shimmering-text

A terminal animation that renders a paragraph of text with a shimmer — a bright band of light that sweeps left to right across every line simultaneously, like the loading indicator in the Claude CLI.

## Usage

```
node shimmer.js
```

Press `Ctrl+C` to exit.

---

## How it works

### The text

The paragraph is stored as a single string and word-wrapped in software to a fixed column width of 60 characters:

```js
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
```

Words are never broken mid-word. If the next word would push the line past the limit, the current line is pushed and a new one starts. This produces a `LINES` array of strings.

---

### The color model

Each character has two possible colors: a dim base color and a bright peak color, both defined as RGB:

```js
const BASE = { r: 80,  g: 80,  b: 120 }; // muted indigo
const PEAK = { r: 230, g: 235, b: 255 }; // near-white
```

The actual color of any given character is a blend between these two, determined by how close that character is to the shimmer's current position.

---

### The shimmer position

The shimmer is expressed as a single floating-point column number that advances from left to right over time. It starts at `-SHIMMER_WIDTH` (off the left edge) and travels to `WRAP_WIDTH + SHIMMER_WIDTH` (off the right edge), then pauses briefly before resetting.

Every character at column `ci` on every line is coloured based on its distance from this position — so all lines respond identically to the same shimmer value, producing a vertical band that sweeps across the whole paragraph at once.

---

### Computing one character's color

```js
function colorAt(ci, shimmerPos) {
  const dist = Math.abs(ci - shimmerPos);
  const t = smoothstep(Math.max(0, 1 - dist / SHIMMER_WIDTH));
  const r = lerp(BASE.r, PEAK.r, t);
  const g = lerp(BASE.g, PEAK.g, t);
  const b = lerp(BASE.b, PEAK.b, t);
  return `\x1b[38;2;${r};${g};${b}m`;
}
```

**Step 1 — distance.** `Math.abs(ci - shimmerPos)` gives how far this character's column is from the shimmer center.

**Step 2 — normalize and flip.** `1 - dist / SHIMMER_WIDTH` maps the distance into a 0–1 range and flips it so that characters at the center score 1 (brightest) and characters at the edge score 0 (darkest). Characters beyond the edge go negative and are clamped to 0 by `Math.max`.

**Step 3 — smoothstep.** The normalized value is passed through:

```js
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}
```

This remaps the linear 0–1 range along an S-shaped curve. Without it, brightness would fall off at a constant rate — the shimmer would look like a sharp-edged cone. Smoothstep keeps the center very bright for longer before dropping off quickly in the middle, then tapering gently to zero at the edges. The formula `t²(3 - 2t)` is a cubic polynomial chosen specifically because its derivative is zero at both endpoints, producing the "ease in, ease out" quality: the glow rises softly, peaks, and fades softly.

**Step 4 — blend colors.** The smoothed `t` is used to interpolate each RGB channel between `BASE` and `PEAK`:

```js
function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}
```

At `t = 0`, the character is full `BASE` (dim). At `t = 1`, it is full `PEAK` (bright). In between, the channels blend linearly. `Math.round` is needed because RGB values must be integers.

**Step 5 — emit the escape.** The resulting RGB values are packed into an ANSI truecolor escape sequence: `\x1b[38;2;R;G;Bm`. The `\x1b[` opens the escape, `38;2` means "set foreground color to 24-bit RGB", then the three channel values follow.

---

### Rendering a frame in-place

The core challenge of terminal animation is overwriting previous output rather than appending to it.

```js
function render(shimmerPos) {
  let out = '';

  if (!firstRender) {
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
```

On the first frame, the lines are written normally. There is deliberately no `\n` after the last line, so the cursor ends up at the end of the last line of text — still inside the block.

On every subsequent frame, two things happen before writing:

1. `\x1b[${LINES.length - 1}A` — moves the cursor up `N - 1` rows. This is why no trailing newline is written: if the cursor is already on the last line of the block (not one below it), going up `N - 1` lands it exactly on the first line. Going up `N` would overshoot by one.

2. `\r` — moves the cursor to column 0. After the upward move, the cursor could be at any column (wherever the last character of the last line ended). `\r` resets it to the left margin so writing starts cleanly.

After repositioning, the entire block is written again, overwriting the previous frame character by character. Because every line is the same width on every frame, nothing from the previous frame bleeds through.

All output for a frame is assembled into a single string `out` before writing. This matters: if you called `process.stdout.write` separately for each character or line, the terminal would render partial frames visibly, causing flicker.

---

### Cursor visibility

```js
process.stdout.write('\x1b[?25l'); // hide cursor
```

The cursor is hidden at startup so it doesn't flicker visibly as it repositions between frames.

```js
function cleanup() {
  process.stdout.write('\x1b[?25h'); // restore cursor
  process.exit(0);
}
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
```

`SIGINT` is sent by `Ctrl+C`. Without the cleanup handler, the cursor would remain hidden after the program exits, leaving the terminal in a broken state.

---

### The animation loop

```js
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
```

`setInterval` with 16ms gives approximately 60 frames per second. Each tick advances the shimmer position by 0.4 columns. The position starts at `-SHIMMER_WIDTH` so the glow enters smoothly from off the left edge, and the sweep ends once it exits past the right edge by the same margin.

When the sweep completes, a pause of 45 frames (~750ms) runs before the position resets and the next sweep begins. This rhythm — sweep, pause, sweep — is what makes it feel like a living indicator rather than a mechanical loop.
