# How shimmer.js works

## Running it

```
node shimmer.js
```

Press `Ctrl+C` to exit.

---

## Walkthrough

### 1. The text and color palette

```js
const RAW_TEXT = 'Lorem ipsum dolor sit amet, ...';
const WRAP_WIDTH = 60;

const BASE = { r: 80,  g: 80,  b: 120 };
const PEAK = { r: 230, g: 235, b: 255 };
```

`RAW_TEXT` is the full paragraph as a single string. `WRAP_WIDTH` is the column at which it gets broken into lines. `BASE` is the resting color of each character — a muted indigo-blue. `PEAK` is the brightest point of the shimmer — near-white with a cool tint.

---

### 2. Word wrapping

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

const LINES = wrap(RAW_TEXT, WRAP_WIDTH);
const TOTAL_CHARS = LINES.reduce((s, l) => s + l.length, 0);
const SHIMMER_WIDTH = TOTAL_CHARS * 0.12;
```

`wrap` splits the paragraph into an array of strings, each no wider than `WRAP_WIDTH` characters. Words are never broken — if adding the next word would exceed the width, a new line is started.

`TOTAL_CHARS` is the total number of visible characters across all lines (not counting newlines). The shimmer travels across this entire range. `SHIMMER_WIDTH` is set to 12% of that, giving the bright halo a width proportional to the full text.

---

### 3. Smoothstep and the S-curve

```js
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}
```

`smoothstep` takes a number `t` between 0 and 1 and returns a transformed number, also between 0 and 1 — but remapped along a smooth S-shaped curve.

To see why this matters, compare the two approaches side by side. Say the shimmer center is at character 5, and you want to know how bright character 3 should be. It's 2 steps away. You could just use the raw distance — that's a **linear** falloff:

```
distance from center:  0    1    2    3    4    5
linear brightness:    1.0  0.8  0.6  0.4  0.2  0.0
```

That works, but it looks mechanical — the brightness drops at a constant rate and there's a hard cutoff at the edge. Smoothstep reshapes that same range so it accelerates away from 1 and decelerates into 0:

```
distance from center:  0    1    2    3    4    5
smoothstep brightness: 1.0  0.9  0.6  0.2  0.0  0.0
```

The center stays very bright for longer, then drops off quickly in the middle, then tapers gently to zero. This is why it's called an S-curve — plot `t * t * (3 - 2 * t)` and you get a curve that starts flat, accelerates through the middle, then flattens again at the top. Applied to a glow, the result is a soft halo with a bright core, not a hard-edged spotlight.

The formula `t² (3 - 2t)` is derived by constructing a cubic polynomial that satisfies four constraints: output is 0 at t=0, output is 1 at t=1, and the derivative (slope) is 0 at both ends. Those zero-slope endpoints are what create the "ease in, ease out" flatness.

---

### 4. Linear interpolation

```js
function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}
```

`lerp` ("linear interpolate") blends two numbers given a `t` from 0 to 1.

- At `t = 0`: returns `a` exactly — `a + (b - a) * 0 = a`
- At `t = 1`: returns `b` exactly — `a + (b - a) * 1 = b`
- At `t = 0.5`: returns the midpoint — `a + (b - a) * 0.5`

This is used on each color channel separately. For example, blending the red channel from BASE (80) to PEAK (230):

```
lerp(80, 230, 0.0) → 80    (full BASE color, far from shimmer)
lerp(80, 230, 0.5) → 155   (halfway)
lerp(80, 230, 1.0) → 230   (full PEAK color, at shimmer center)
```

The `Math.round` is there because RGB values must be integers.

---

### 5. Computing the color for one character

```js
function colorAt(flatIndex, shimmerPos) {
  const dist = Math.abs(flatIndex - shimmerPos);
  const t = smoothstep(Math.max(0, 1 - dist / SHIMMER_WIDTH));
  const r = lerp(BASE.r, PEAK.r, t);
  const g = lerp(BASE.g, PEAK.g, t);
  const b = lerp(BASE.b, PEAK.b, t);
  return `\x1b[38;2;${r};${g};${b}m`;
}
```

Each character has a `flatIndex` — its position in the entire text counted straight through, ignoring line breaks. The shimmer position `shimmerPos` is also a flat index. Step by step:

1. **Distance**: `Math.abs(flatIndex - shimmerPos)` — how far is this character from the shimmer center?

2. **Normalize and flip**: `1 - dist / SHIMMER_WIDTH` — divide by the shimmer width to get a 0–1 range, then subtract from 1 to flip it. Characters *at* the center get 1 (maximum), characters at the edge of the shimmer get 0 (minimum), characters beyond the edge go negative and get clamped to 0 by `Math.max`.

3. **Smooth it**: pass through `smoothstep` to get the S-curve brightness.

4. **Apply to color**: use that brightness as `t` in `lerp` for each of R, G, B independently, blending from the dim base color to the bright peak.

5. **Emit ANSI escape**: `\x1b[38;2;R;G;Bm` is the terminal escape sequence for 24-bit ("truecolor") foreground color. `\x1b[` starts the escape, `38;2` means "set foreground to RGB", then the three channel values follow.

Because `flatIndex` crosses line boundaries continuously, the shimmer flows smoothly from the end of one line into the start of the next — it doesn't reset at each line.

---

### 6. Rendering a frame — and how in-place works across multiple lines

```js
let firstRender = true;

function render(shimmerPos) {
  let out = '';

  if (!firstRender) {
    out += `\x1b[${LINES.length}A\r`;
  }
  firstRender = false;

  let flatIndex = 0;
  for (let li = 0; li < LINES.length; li++) {
    for (let ci = 0; ci < LINES[li].length; ci++) {
      out += colorAt(flatIndex, shimmerPos) + LINES[li][ci];
      flatIndex++;
    }
    out += '\x1b[0m\r\n';
  }

  process.stdout.write(out);
}
```

**The single-line case** is simple: `\r` (carriage return) moves the cursor back to column 0 of the current line without moving down, so the next write overwrites the previous frame. This works because `\r` and `\n` are separate operations — `\r` is the mechanical "slide the print head to the left margin" and `\n` is the separate "advance the paper one line". Modern terminals honour them independently.

**The multi-line case** can't use `\r` alone. After writing N lines with `\r\n` at the end of each, the cursor is sitting below the last line of text. `\r` would only bring you back to column 0 of *that* empty line — the block above is untouched. You need to physically move the cursor up.

The ANSI escape `\x1b[nA` moves the cursor up `n` rows. So the sequence is:

```
\x1b[{LINES.length}A    — move cursor up by the number of lines in the block
\r                      — move to column 0 of that line
```

After those two operations the cursor is at the very start of the first line of the block — the exact same position it was in before the first render. Every subsequent write then overwrites the previous frame character for character.

The `firstRender` flag handles the bootstrap: on the very first frame there's nothing to reposition over, so you just write the lines normally. From the second frame onward, the reposition sequence runs first.

Each line ends with `\x1b[0m\r\n`: reset color, carriage return (back to column 0), then line feed (move down one row). The `\r` before `\n` is important — without it, on some terminals `\n` alone advances the row but leaves the cursor at the current column rather than the start of the new line, which would cause drift over multiple frames.

---

### 7. Cursor visibility

```js
process.stdout.write('\x1b[?25l');

function cleanup() {
  process.stdout.write('\x1b[?25h');
  process.exit(0);
}
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
```

`\x1b[?25l` hides the cursor so it doesn't flicker visibly during animation. The `cleanup` function restores it (`\x1b[?25h`) before exiting, so the terminal is left in a clean state when the user hits `Ctrl+C`.

---

### 8. The animation loop

```js
let pos = -SHIMMER_WIDTH;

setInterval(() => {
  if (pausing) { ... }

  render(pos);
  pos += 0.4;

  if (pos > TOTAL_CHARS + SHIMMER_WIDTH) {
    pausing = true;
  }
}, 16);
```

The interval fires every 16ms (~60fps). Each tick advances `pos` by 0.4 characters across the full flat index range. `pos` starts at `-SHIMMER_WIDTH` so the glow enters from off the left edge of the first line, and the sweep ends once the glow exits past the right edge of the last character.

Once it exits, the animation pauses for 45 frames (~750ms) before resetting and sweeping again.
