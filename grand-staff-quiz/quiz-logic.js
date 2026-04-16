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
