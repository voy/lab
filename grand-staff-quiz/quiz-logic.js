// Pure functions. Browser: loaded as a plain script (globals).
// Node: required by the test runner via the module.exports tail.

function parseClef(text, clef) {
  return text.replace(/\\n/g, '\n').split('\n')
    .map(l => l.trim())
    .filter(l => !/^(#|\/\/)/.test(l))
    .filter(l => /^[A-Ga-g]\d$/i.test(l))
    .map(l => ({ key: `${l[0].toLowerCase()}/${l[1]}`, clef, name: l[0].toUpperCase() }));
}

const NOTE_ORDER = 'ABCDEFG';

function stepDir(a, b) {
  if (!a || !b) return 0;
  const d = NOTE_ORDER.indexOf(b.name) - NOTE_ORDER.indexOf(a.name);
  return (d === 1 || d === -6) ? 1 : (d === -1 || d === 6) ? -1 : 0;
}

function isValidNext(n, prev, lastDir) {
  if (!prev) return true;
  if (n.name === prev.name) return false;
  const dir = stepDir(prev, n);
  if (dir !== 0 && dir === lastDir) return false;
  return true;
}

function isLedgerNote(n) {
  const oct = parseInt(n.key.split('/')[1]);
  const val = oct * 7 + 'CDEFGAB'.indexOf(n.name);
  if (n.clef === 'treble') return val < 30 || val > 38; // outside E4–F5
  if (n.clef === 'bass')   return val < 18 || val > 26; // outside G2–A3
  return false;
}

function weightedShuffle(notes) {
  const weighted = notes.flatMap(n => isLedgerNote(n) ? [n, n] : [n]);
  weighted.sort(() => Math.random() - 0.5);
  const seen = new Set();
  return weighted.filter(n => {
    const id = n.key + n.clef;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

// Pure batch-selection loop. Takes an already-shuffled pool so randomness is
// injected by the caller, making this fully testable.
function buildBatch(shuffled, prevNote, lastDir, clefRun, size) {
  const batch = [];
  let prev = prevNote;
  let dir  = lastDir;
  let run  = clefRun;
  const remaining = [...shuffled];
  for (let i = 0; i < size; i++) {
    const mustSwitch = prev && run >= 2;
    let idx = mustSwitch
      ? remaining.findIndex(n => isValidNext(n, prev, dir) && n.clef !== prev.clef)
      : remaining.findIndex(n => isValidNext(n, prev, dir));
    if (idx === -1) idx = remaining.findIndex(n => isValidNext(n, prev, dir));
    if (idx === -1) idx = 0;
    const [chosen] = remaining.splice(idx, 1);
    batch.push(chosen);
    run = prev && chosen.clef === prev.clef ? run + 1 : 1;
    dir = stepDir(prev, chosen);
    prev = chosen;
  }
  return { batch, lastDir: dir, clefRun: run };
}

const INTERVAL_PROB = 0.20;

function pitchVal(note) {
  return parseInt(note.key.split('/')[1]) * 7 + 'CDEFGAB'.indexOf(note.name);
}

function addIntervals(notes, poolSize, rand = Math.random) {
  if (poolSize < 8) return notes;
  const out = [];
  let i = 0;
  let hadInterval = false;
  while (i < notes.length) {
    const a = notes[i], b = notes[i + 1];
    if (b && a.clef === b.clef && rand() < INTERVAL_PROB) {
      const [lower, upper] = pitchVal(a) <= pitchVal(b) ? [a, b] : [b, a];
      const upperFirst = rand() >= 0.5;
      out.push(upperFirst ? upper : lower);
      out.push(upperFirst ? lower : upper);
      i += 2;
      hadInterval = true;
    } else {
      out.push(a);
      i++;
    }
  }
  if (!hadInterval) {
    for (let j = 0; j < out.length - 1; j++) {
      if (out[j].clef === out[j + 1].clef) {
        const [lower, upper] = pitchVal(out[j]) <= pitchVal(out[j + 1]) ? [out[j], out[j + 1]] : [out[j + 1], out[j]];
        const upperFirst = rand() >= 0.5;
        out[j]     = upperFirst ? upper : lower;
        out[j + 1] = upperFirst ? lower : upper;
        break;
      }
    }
  }
  return out;
}

// Diatonic note at `steps` above the bottom line of the given clef.
// Treble bottom line = E4, bass bottom line = G2.
function stepToNote(steps, clef) {
  const [base, baseOct] = clef === 'treble' ? ['E', 4] : ['G', 2];
  const NOTE_NAMES = 'CDEFGAB';
  const total  = NOTE_NAMES.indexOf(base) + steps;
  const name   = NOTE_NAMES[((total % 7) + 7) % 7];
  const octave = baseOct + Math.floor(total / 7);
  if (octave < 0 || octave > 9) return null;
  return { name, key: `${name.toLowerCase()}/${octave}` };
}

// MIDI note number → { name, key, clef } or null for black keys.
// Clef split at middle C: C4 and up = treble, below = bass.
function midiToNote(midiNumber) {
  const NAMES = ['C',null,'D',null,'E','F',null,'G',null,'A',null,'B'];
  const name = NAMES[midiNumber % 12];
  if (!name) return null;
  const octave  = Math.floor(midiNumber / 12) - 1;
  const noteVal = octave * 7 + 'CDEFGAB'.indexOf(name);
  const clef    = noteVal >= 28 ? 'treble' : 'bass';
  return { name, key: `${name.toLowerCase()}/${octave}`, clef };
}

// Three-branch correctness check:
//   key === null          → name-only match (keyboard/button input)
//   key set, ignoreOctave → name-only match
//   key set, strict       → exact key match (MIDI/click input at the right pitch)
function isCorrectAnswer(name, key, currentNote, ignoreOctave) {
  if (key !== null && !ignoreOctave) return key === currentNote.key;
  return name === currentNote.name;
}

const ACCURACY_WINDOW = 20;
const SPEED_WINDOW    = 20;
const SPEED_MIN_ACC   = 0.80;
const SPEED_MIN_N     = 3;

// Display-ready stats from raw history.
// Speed is gated: needs ≥SPEED_MIN_N samples AND ≥SPEED_MIN_ACC accuracy.
function computeStats(answerHistory, speedHistory) {
  const n = answerHistory.length;
  const correct = answerHistory.filter(Boolean).length;
  const accuracyPct   = n === 0 ? null : Math.round(correct / n * 100);
  const accuracyLabel = n < ACCURACY_WINDOW ? `${correct}/${n}` : `last ${ACCURACY_WINDOW}`;

  const accRate   = n === 0 ? 0 : correct / n;
  const sn        = speedHistory.length;
  const showSpeed = sn >= SPEED_MIN_N && accRate >= SPEED_MIN_ACC;
  const speedMs   = showSpeed ? speedHistory.reduce((a, b) => a + b, 0) / sn : null;
  const speedLabel = showSpeed
    ? (sn < SPEED_WINDOW ? `${sn}/${SPEED_WINDOW}` : `last ${SPEED_WINDOW}`)
    : null;

  return { accuracyPct, accuracyLabel, speedMs, speedLabel };
}

if (typeof module !== 'undefined') {
  module.exports = {
    parseClef, stepDir, isValidNext, isLedgerNote,
    weightedShuffle, buildBatch, pitchVal, addIntervals,
    stepToNote, midiToNote,
    isCorrectAnswer, computeStats,
    ACCURACY_WINDOW, SPEED_WINDOW, SPEED_MIN_ACC, SPEED_MIN_N,
  };
}
