import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseClef, stepDir, isValidNext, isLedgerNote } from './quiz-logic.js';

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

  it('skips blank lines', () => {
    const result = parseClef('\nC4\n\nD4\n', 'treble');
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

  it('attaches the correct clef', () => {
    const [note] = parseClef('G2', 'bass');
    assert.equal(note.clef, 'bass');
  });

  it('returns empty array for empty input', () => {
    assert.deepEqual(parseClef('', 'treble'), []);
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
    assert.equal(isValidNext(note('A'), note('B'), 1), true);  // descend after ascending
    // wait — A after B is descending, lastDir was +1, dir is -1 → different, allowed
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
