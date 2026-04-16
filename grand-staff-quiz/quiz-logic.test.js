const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { parseClef, stepDir, isValidNext, isLedgerNote, weightedShuffle, buildBatch, pitchVal, addIntervals } = require('./quiz-logic.js');

// ── parseClef ────────────────────────────────────────────────────────────────

describe('parseClef', () => {
  it('parses valid note lines', () => {
    const result = parseClef('C4\nD4\nE4', 'treble');
    assert.deepEqual(result, [
      { key: 'c/4', clef: 'treble', name: 'C' },
      { key: 'd/4', clef: 'treble', name: 'D' },
      { key: 'e/4', clef: 'treble', name: 'E' },
    ]);
  });

  it('normalises note name to uppercase', () => {
    const [note] = parseClef('g4', 'treble');
    assert.equal(note.name, 'G');
    assert.equal(note.key, 'g/4');
  });

  it('skips lines starting with #', () => {
    const result = parseClef('C4\n# skipped\nD4', 'treble');
    assert.equal(result.length, 2);
  });

  it('skips lines starting with //', () => {
    const result = parseClef('C4\n// skipped\nD4', 'treble');
    assert.equal(result.length, 2);
  });

  it('skips lines with invalid format', () => {
    const result = parseClef('C4\nInvalid\nXX\nD4', 'treble');
    assert.equal(result.length, 2);
  });

  it('handles escaped newlines from localStorage', () => {
    const result = parseClef('C4\\nD4', 'treble');
    assert.equal(result.length, 2);
  });
});

// ── stepDir ──────────────────────────────────────────────────────────────────

const note = name => ({ name });

describe('stepDir', () => {
  it('returns 1 for ascending step', () => {
    assert.equal(stepDir(note('A'), note('B')), 1);
    assert.equal(stepDir(note('C'), note('D')), 1);
  });

  it('returns -1 for descending step', () => {
    assert.equal(stepDir(note('B'), note('A')), -1);
    assert.equal(stepDir(note('D'), note('C')), -1);
  });

  it('returns 1 for G→A wrap', () => {
    assert.equal(stepDir(note('G'), note('A')), 1);
  });

  it('returns -1 for A→G wrap', () => {
    assert.equal(stepDir(note('A'), note('G')), -1);
  });

  it('returns 0 for a skip (non-adjacent)', () => {
    assert.equal(stepDir(note('A'), note('C')), 0);
    assert.equal(stepDir(note('C'), note('A')), 0);
  });

  it('returns 0 when either argument is null', () => {
    assert.equal(stepDir(null, note('A')), 0);
    assert.equal(stepDir(note('A'), null), 0);
    assert.equal(stepDir(null, null), 0);
  });
});

// ── isValidNext ──────────────────────────────────────────────────────────────

describe('isValidNext', () => {
  it('allows any note when prev is null', () => {
    assert.equal(isValidNext(note('C'), null, 0), true);
  });

  it('rejects same note as prev', () => {
    assert.equal(isValidNext(note('C'), note('C'), 0), false);
  });

  it('rejects a third consecutive step in the same direction', () => {
    // prev=B, n=C (step +1), lastDir=+1 → would be two ascending steps in a row
    assert.equal(isValidNext(note('C'), note('B'), 1), false);
    assert.equal(isValidNext(note('A'), note('B'), -1), false);
  });

  it('allows a step that reverses direction', () => {
    // A after B is descending (dir=-1), lastDir was +1 → different, allowed
    assert.equal(isValidNext(note('A'), note('B'), 1), true);
  });

  it('allows a skip (non-adjacent) regardless of lastDir', () => {
    // skip returns dir=0, so the consecutive-direction check is bypassed
    assert.equal(isValidNext(note('D'), note('B'), 1), true);
  });
});

// ── isLedgerNote ─────────────────────────────────────────────────────────────

const staffNote = (name, octave, clef) => ({ name, key: `${name.toLowerCase()}/${octave}`, clef });

describe('isLedgerNote', () => {
  // Treble staff: E4–F5 are on the staff; outside = ledger
  it('returns false for treble notes within the staff (E4–F5)', () => {
    assert.equal(isLedgerNote(staffNote('E', 4, 'treble')), false);
    assert.equal(isLedgerNote(staffNote('C', 5, 'treble')), false);
    assert.equal(isLedgerNote(staffNote('F', 5, 'treble')), false);
  });

  it('returns true for treble notes below E4', () => {
    assert.equal(isLedgerNote(staffNote('D', 4, 'treble')), true);
    assert.equal(isLedgerNote(staffNote('C', 4, 'treble')), true);
    assert.equal(isLedgerNote(staffNote('B', 3, 'treble')), true);
  });

  it('returns true for treble notes above F5', () => {
    assert.equal(isLedgerNote(staffNote('G', 5, 'treble')), true);
    assert.equal(isLedgerNote(staffNote('A', 5, 'treble')), true);
  });

  // Bass staff: G2–A3 are on the staff; outside = ledger
  it('returns false for bass notes within the staff (G2–A3)', () => {
    assert.equal(isLedgerNote(staffNote('G', 2, 'bass')), false);
    assert.equal(isLedgerNote(staffNote('D', 3, 'bass')), false);
    assert.equal(isLedgerNote(staffNote('A', 3, 'bass')), false);
  });

  it('returns true for bass notes below G2', () => {
    assert.equal(isLedgerNote(staffNote('F', 2, 'bass')), true);
    assert.equal(isLedgerNote(staffNote('E', 2, 'bass')), true);
  });

  it('returns true for bass notes above A3', () => {
    assert.equal(isLedgerNote(staffNote('B', 3, 'bass')), true);
    assert.equal(isLedgerNote(staffNote('C', 4, 'bass')), true);
  });
});

// ── weightedShuffle ──────────────────────────────────────────────────────────
// Randomness is in the order, not the content — test content invariants only.

const POOL = [
  staffNote('E', 4, 'treble'), // on-staff treble
  staffNote('G', 4, 'treble'), // on-staff treble
  staffNote('C', 4, 'treble'), // ledger treble (below E4)
  staffNote('G', 2, 'bass'),   // on-staff bass
  staffNote('B', 3, 'bass'),   // ledger bass (above A3)
];

function noteId(n) { return n.key + n.clef; }

describe('weightedShuffle', () => {
  it('contains every unique note exactly once', () => {
    const result = weightedShuffle(POOL);
    const ids = result.map(noteId);
    const uniqueIds = new Set(ids);
    assert.equal(uniqueIds.size, POOL.length, 'no duplicates');
    assert.equal(ids.length, POOL.length, 'no notes dropped');
    for (const n of POOL) assert.ok(uniqueIds.has(noteId(n)), `missing ${noteId(n)}`);
  });
});

// ── buildBatch ───────────────────────────────────────────────────────────────
// Pass a known shuffled order so results are deterministic.

const TREBLE_NOTES = ['C4','D4','E4','F4','G4','A4','B4','C5'].map(s =>
  staffNote(s[0], parseInt(s[1]), 'treble'));
const BASS_NOTES   = ['G2','A2','B2','C3','D3','E3','F3','G3'].map(s =>
  staffNote(s[0], parseInt(s[1]), 'bass'));
const MIXED_POOL   = [...TREBLE_NOTES, ...BASS_NOTES];

describe('buildBatch', () => {
  it('returns a batch of the requested size', () => {
    const { batch } = buildBatch(MIXED_POOL, null, 0, 0, 3);
    assert.equal(batch.length, 3);
  });

  it('never places the same note name consecutively', () => {
    for (let run = 0; run < 20; run++) {
      const shuffled = [...MIXED_POOL].sort(() => Math.random() - 0.5);
      const { batch } = buildBatch(shuffled, null, 0, 0, 4);
      for (let i = 1; i < batch.length; i++) {
        assert.notEqual(batch[i].name, batch[i - 1].name,
          `consecutive same note at index ${i}`);
      }
    }
  });

  it('never makes two consecutive same-direction steps', () => {
    for (let run = 0; run < 20; run++) {
      const shuffled = [...MIXED_POOL].sort(() => Math.random() - 0.5);
      const { batch } = buildBatch(shuffled, null, 0, 0, 4);
      let prevDir = 0;
      for (let i = 1; i < batch.length; i++) {
        const dir = stepDir(batch[i - 1], batch[i]);
        if (dir !== 0) {
          assert.notEqual(dir, prevDir,
            `two consecutive ${dir > 0 ? 'ascending' : 'descending'} steps ending at index ${i}`);
        }
        prevDir = dir; // a skip (dir=0) resets tracking, matching buildBatch behaviour
      }
    }
  });

  it('switches clef after two consecutive same-clef notes when possible', () => {
    // Start with two treble notes already in run, force the batch to have a bass note next.
    const prevNote = staffNote('G', 4, 'treble');
    const { batch } = buildBatch(MIXED_POOL, prevNote, 0, 2, 3);
    assert.equal(batch[0].clef, 'bass',
      'first note should switch clef after a run of 2');
  });

  it('tracks direction and clef run across the batch', () => {
    const c4 = staffNote('C', 4, 'treble');
    const d4 = staffNote('D', 4, 'treble');
    const { lastDir, clefRun } = buildBatch([c4, d4], null, 0, 0, 2);
    assert.equal(lastDir, 1);  // C→D is an ascending step
    assert.equal(clefRun, 2);  // two consecutive treble notes
  });
});

// ── pitchVal ─────────────────────────────────────────────────────────────────

describe('pitchVal', () => {
  it('C4 < D4', () => {
    assert.ok(pitchVal(staffNote('C', 4, 'treble')) < pitchVal(staffNote('D', 4, 'treble')));
  });
  it('B3 < C4 (octave boundary)', () => {
    assert.ok(pitchVal(staffNote('B', 3, 'treble')) < pitchVal(staffNote('C', 4, 'treble')));
  });
  it('C4 < C5', () => {
    assert.ok(pitchVal(staffNote('C', 4, 'treble')) < pitchVal(staffNote('C', 5, 'treble')));
  });
});

// ── addIntervals ─────────────────────────────────────────────────────────────

const alwaysMerge = () => 0; // rand() < any prob → always merges, direction = lower-first (0 < 0.5)
const neverMerge  = () => 1; // rand() >= any prob → never merges

// Returns values from a fixed sequence, cycling if exhausted
function seq(...vals) { let i = 0; return () => vals[i++ % vals.length]; }

describe('addIntervals', () => {
  const c4t = staffNote('C', 4, 'treble');
  const e4t = staffNote('E', 4, 'treble');
  const g4t = staffNote('G', 4, 'treble');
  const g2b = staffNote('G', 2, 'bass');

  it('returns notes unchanged when pool < 8', () => {
    const notes = [c4t, e4t];
    assert.deepEqual(addIntervals(notes, 7, alwaysMerge), notes);
  });

  it('keeps same-clef pair lower-first when second rand < 0.5', () => {
    const result = addIntervals([c4t, e4t], 8, seq(0, 0.4));
    assert.deepEqual(result, [c4t, e4t]);
  });

  it('reorders same-clef pair to upper-first when second rand >= 0.5', () => {
    const result = addIntervals([c4t, e4t], 8, seq(0, 0.5));
    assert.deepEqual(result, [e4t, c4t]);
  });

  it('reorders by pitch regardless of original order in batch', () => {
    // e4t comes before c4t but lower-first should give [c4t, e4t]
    const result = addIntervals([e4t, c4t], 8, alwaysMerge); // alwaysMerge → lower-first
    assert.deepEqual(result, [c4t, e4t]);
  });

  it('does not reorder cross-clef pairs', () => {
    const result = addIntervals([c4t, g2b], 8, alwaysMerge);
    assert.deepEqual(result, [c4t, g2b]);
  });

  it('does not reorder when rand is above threshold', () => {
    const result = addIntervals([e4t, c4t], 8, neverMerge);
    assert.deepEqual(result, [e4t, c4t]);
  });

  it('leaves trailing non-reorderable note intact', () => {
    const result = addIntervals([c4t, e4t, g2b], 8, alwaysMerge);
    assert.equal(result.length, 3);
    assert.deepEqual(result[2], g2b);
  });

  it('still creates one interval via fallback when rand never triggers 20%', () => {
    // neverMerge skips all probabilistic merges; fallback reorders first same-clef pair
    // direction: neverMerge()=1 >= 0.5 → upper-first → [e4t, c4t, g4t]
    const result = addIntervals([c4t, e4t, g4t], 8, neverMerge);
    assert.deepEqual(result, [e4t, c4t, g4t]);
  });

  it('guarantees at least one interval even when rand never triggers 20%', () => {
    // neverMerge skips all probabilistic merges; fallback should reorder first same-clef pair
    // neverMerge returns 1, so direction = upper-first (1 >= 0.5) → [e4t, c4t, g2b]
    const result = addIntervals([c4t, e4t, g2b], 8, neverMerge);
    assert.deepEqual(result[0], e4t);
    assert.deepEqual(result[1], c4t);
    assert.deepEqual(result[2], g2b);
  });

  it('does not force an interval when no same-clef consecutive pair exists', () => {
    // alternating clefs — nothing to reorder
    const result = addIntervals([c4t, g2b, e4t, g2b], 8, neverMerge);
    assert.deepEqual(result, [c4t, g2b, e4t, g2b]);
  });
});
