// Pure functions extracted for unit testing.

export function parseClef(text, clef) {
  return text.replace(/\\n/g, '\n').split('\n')
    .map(l => l.trim())
    .filter(l => !/^(#|\/\/)/.test(l))
    .filter(l => /^[A-Ga-g]\d$/i.test(l))
    .map(l => ({ key: `${l[0].toLowerCase()}/${l[1]}`, clef, name: l[0].toUpperCase() }));
}

const NOTE_ORDER = 'ABCDEFG';

export function stepDir(a, b) {
  if (!a || !b) return 0;
  const d = NOTE_ORDER.indexOf(b.name) - NOTE_ORDER.indexOf(a.name);
  return (d === 1 || d === -6) ? 1 : (d === -1 || d === 6) ? -1 : 0;
}

export function isValidNext(n, prev, lastDir) {
  if (!prev) return true;
  if (n.name === prev.name) return false;
  const dir = stepDir(prev, n);
  if (dir !== 0 && dir === lastDir) return false;
  return true;
}

export function isLedgerNote(n) {
  const oct = parseInt(n.key.split('/')[1]);
  const val = oct * 7 + 'CDEFGAB'.indexOf(n.name);
  if (n.clef === 'treble') return val < 30 || val > 38; // outside E4–F5
  if (n.clef === 'bass')   return val < 18 || val > 26; // outside G2–A3
  return false;
}

export function weightedShuffle(notes) {
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
export function buildBatch(shuffled, prevNote, lastDir, clefRun, size) {
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
