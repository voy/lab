const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  CATEGORIES, tagStaatsorgane, tagDatenJahre,
  INTERVALS, addDays,
  seedState, applyAnswer, isDue,
  weightedShuffle, selectSession, topProblemQuestions,
} = require('./quiz-logic.js');

// ── fixtures ─────────────────────────────────────────────────────────────────

function q(id, overrides = {}) {
  return {
    id,
    text: 'Frage?',
    choices: ['a', 'b', 'c', 'd'],
    correctIndex: 0,
    scope: 'general',
    categories: [],
    ...overrides,
  };
}

function st(overrides = {}) {
  return { box: 3, dueDate: '2026-01-01', streak: 0, seen: 0, correct: 0, mastered: false, ...overrides };
}

// ── CATEGORIES ────────────────────────────────────────────────────────────────

describe('CATEGORIES', () => {
  it('lists the two bias categories', () => {
    assert.deepEqual(CATEGORIES, ['staatsorgane', 'daten-jahre']);
  });
});

// ── tagStaatsorgane ──────────────────────────────────────────────────────────

describe('tagStaatsorgane', () => {
  it('matches on a keyword in the question text', () => {
    assert.equal(tagStaatsorgane(q('x', { text: 'Wer wählt den Bundestag?' })), true);
  });

  it('matches on a keyword hiding in a choice', () => {
    assert.equal(tagStaatsorgane(q('x', { text: 'Was ist das?', choices: ['Bundesrat', 'b', 'c', 'd'] })), true);
  });

  it('matches compound words without word boundaries', () => {
    assert.equal(tagStaatsorgane(q('x', { text: 'Wann ist die Bundestagswahl?' })), true);
  });

  it('is case-insensitive', () => {
    assert.equal(tagStaatsorgane(q('x', { text: 'wer ist bundeskanzler?' })), true);
  });

  it('returns false with no keyword hit', () => {
    assert.equal(tagStaatsorgane(q('x', { text: 'Was ist Meinungsfreiheit?' })), false);
  });
});

// ── tagDatenJahre ────────────────────────────────────────────────────────────

describe('tagDatenJahre', () => {
  it('matches a four-digit year in the text', () => {
    assert.equal(tagDatenJahre(q('x', { text: 'Was geschah 1949?' })), true);
  });

  it('matches a year hiding in a distractor choice', () => {
    assert.equal(tagDatenJahre(q('x', { text: 'Was geschah damals?', choices: ['1961', 'b', 'c', 'd'] })), true);
  });

  it('matches "wann"', () => {
    assert.equal(tagDatenJahre(q('x', { text: 'Wann wurde das Grundgesetz verkündet?' })), true);
  });

  it('matches "seit"', () => {
    assert.equal(tagDatenJahre(q('x', { text: 'Seit wann gilt das Gesetz?' })), true);
  });

  it('returns false with no date signal', () => {
    assert.equal(tagDatenJahre(q('x', { text: 'Was ist der Bundestag?' })), false);
  });
});

// ── addDays ──────────────────────────────────────────────────────────────────

describe('addDays', () => {
  it('adds days within a month', () => {
    assert.equal(addDays('2026-01-01', 5), '2026-01-06');
  });

  it('crosses a month boundary', () => {
    assert.equal(addDays('2026-01-30', 3), '2026-02-02');
  });

  it('crosses a year boundary', () => {
    assert.equal(addDays('2026-12-30', 5), '2027-01-04');
  });

  it('handles a leap-year February', () => {
    assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  });

  it('adds zero days as a no-op', () => {
    assert.equal(addDays('2026-06-15', 0), '2026-06-15');
  });
});

// ── seedState ────────────────────────────────────────────────────────────────

describe('seedState', () => {
  it('seeds a staatsorgane question at box 1, due today', () => {
    const state = seedState(q('gen-1', { categories: ['staatsorgane'] }), '2026-01-01');
    assert.deepEqual(state, { box: 1, dueDate: '2026-01-01', streak: 0, seen: 0, correct: 0, mastered: false });
  });

  it('seeds a daten-jahre question at box 1, due today', () => {
    const state = seedState(q('gen-2', { categories: ['daten-jahre'] }), '2026-01-01');
    assert.equal(state.box, 1);
    assert.equal(state.dueDate, '2026-01-01');
  });

  it('seeds an unbiased question at box 3, due in 7 days', () => {
    const state = seedState(q('gen-3', { categories: [] }), '2026-01-01');
    assert.deepEqual(state, { box: 3, dueDate: addDays('2026-01-01', INTERVALS[3]), streak: 0, seen: 0, correct: 0, mastered: false });
    assert.equal(state.dueDate, '2026-01-08');
  });
});

// ── applyAnswer ──────────────────────────────────────────────────────────────

describe('applyAnswer', () => {
  it('advances the box and pushes the due date out on a correct answer', () => {
    const before = st({ box: 2, dueDate: '2026-01-01', streak: 1, seen: 4, correct: 3 });
    const after = applyAnswer(before, true, '2026-01-10');
    assert.equal(after.box, 3);
    assert.equal(after.streak, 2);
    assert.equal(after.seen, 5);
    assert.equal(after.correct, 4);
    assert.equal(after.dueDate, addDays('2026-01-10', INTERVALS[3]));
    assert.equal(after.mastered, false);
  });

  it('does not mutate the input state', () => {
    const before = st({ box: 2, streak: 1, seen: 4, correct: 3 });
    const snapshot = { ...before };
    applyAnswer(before, true, '2026-01-10');
    assert.deepEqual(before, snapshot);
  });

  it('caps the box at 5 on a correct answer', () => {
    const before = st({ box: 5, streak: 3, seen: 10, correct: 9 });
    const after = applyAnswer(before, true, '2026-01-10');
    assert.equal(after.box, 5);
  });

  it('drops the box by 2 and resets streak on a wrong answer', () => {
    const before = st({ box: 3, dueDate: '2026-01-05', streak: 2, seen: 4, correct: 3 });
    const after = applyAnswer(before, false, '2026-01-10');
    assert.equal(after.box, 1);
    assert.equal(after.streak, 0);
    assert.equal(after.seen, 5);
    assert.equal(after.correct, 3);
    assert.equal(after.dueDate, '2026-01-10');
    assert.equal(after.mastered, false);
  });

  it('floors the box at 0 on a wrong answer', () => {
    const before = st({ box: 1, streak: 0, seen: 1, correct: 0 });
    const after = applyAnswer(before, false, '2026-01-10');
    assert.equal(after.box, 0);
  });

  it('reaches mastered only at box 5 with a streak of 3+', () => {
    const before = st({ box: 4, streak: 2, seen: 9, correct: 9 });
    const after = applyAnswer(before, true, '2026-01-10');
    assert.equal(after.box, 5);
    assert.equal(after.streak, 3);
    assert.equal(after.mastered, true);
  });

  it('is not mastered at box 5 with a streak below 3', () => {
    const before = st({ box: 5, streak: 1, seen: 9, correct: 9 });
    const after = applyAnswer(before, true, '2026-01-10');
    assert.equal(after.box, 5);
    assert.equal(after.streak, 2);
    assert.equal(after.mastered, false);
  });

  it('un-masters immediately on a wrong answer', () => {
    const before = st({ box: 5, streak: 4, seen: 20, correct: 19, mastered: true });
    const after = applyAnswer(before, false, '2026-01-10');
    assert.equal(after.mastered, false);
    assert.equal(after.box, 3);
  });
});

// ── isDue ────────────────────────────────────────────────────────────────────

describe('isDue', () => {
  it('is due when dueDate is today', () => {
    assert.equal(isDue(st({ dueDate: '2026-01-10' }), '2026-01-10'), true);
  });

  it('is due when dueDate is in the past', () => {
    assert.equal(isDue(st({ dueDate: '2026-01-05' }), '2026-01-10'), true);
  });

  it('is not due when dueDate is in the future', () => {
    assert.equal(isDue(st({ dueDate: '2026-01-15' }), '2026-01-10'), false);
  });

  it('is never due once mastered', () => {
    assert.equal(isDue(st({ dueDate: '2026-01-01', mastered: true }), '2026-01-10'), false);
  });
});

// ── weightedShuffle ──────────────────────────────────────────────────────────

describe('weightedShuffle', () => {
  it('keeps every item exactly once regardless of weight', () => {
    const items = [q('a'), q('b'), q('c')];
    const result = weightedShuffle(items, () => 3);
    assert.equal(result.length, 3);
    assert.deepEqual(new Set(result.map(i => i.id)), new Set(['a', 'b', 'c']));
  });

  it('never drops the lowest-weight item', () => {
    const items = [q('a'), q('b')];
    for (let i = 0; i < 20; i++) {
      const result = weightedShuffle(items, it => (it.id === 'a' ? 10 : 1));
      assert.equal(result.length, 2);
    }
  });
});

// ── selectSession ────────────────────────────────────────────────────────────

describe('selectSession', () => {
  it('excludes imageOnly questions with no sourced image even when due', () => {
    const questions = [q('img-1', { imageOnly: true }), q('gen-1')];
    const states = { 'img-1': st({ dueDate: '2026-01-10' }), 'gen-1': st({ dueDate: '2026-01-10' }) };
    const session = selectSession(questions, states, '2026-01-10', { minSize: 1, limit: 5 });
    assert.deepEqual(session.map(q => q.id), ['gen-1']);
  });

  it('includes imageOnly questions once they have a sourced image', () => {
    const questions = [q('img-1', { imageOnly: true, image: 'images/img-1.svg' }), q('gen-1')];
    const states = { 'img-1': st({ dueDate: '2026-01-10' }), 'gen-1': st({ dueDate: '2026-01-10' }) };
    const session = selectSession(questions, states, '2026-01-10', { minSize: 2, limit: 5 });
    assert.ok(session.some(q => q.id === 'img-1'));
  });

  it('respects the limit', () => {
    const questions = Array.from({ length: 10 }, (_, i) => q(`q${i}`));
    const states = {};
    questions.forEach(q => { states[q.id] = st({ dueDate: '2026-01-10' }); });
    const session = selectSession(questions, states, '2026-01-10', { minSize: 1, limit: 4 });
    assert.equal(session.length, 4);
  });

  it('tops up from the closest-to-due backlog when the due pool is thin', () => {
    const questions = [
      q('due-1'),
      q('near-1'), q('near-2'), q('far-1'),
    ];
    const states = {
      'due-1': st({ dueDate: '2026-01-10' }),
      'near-1': st({ dueDate: '2026-01-12' }),
      'near-2': st({ dueDate: '2026-01-15' }),
      'far-1': st({ dueDate: '2026-01-20' }),
    };
    const session = selectSession(questions, states, '2026-01-10', { minSize: 3, limit: 10 });
    assert.equal(session.length, 3);
    assert.ok(session.some(q => q.id === 'due-1'));
    assert.ok(session.some(q => q.id === 'near-1'));
    assert.ok(!session.some(q => q.id === 'far-1'));
  });

  it('never tops up with a mastered or image-only question', () => {
    const questions = [q('due-1'), q('mastered-1'), q('img-1', { imageOnly: true })];
    const states = {
      'due-1': st({ dueDate: '2026-01-10' }),
      'mastered-1': st({ dueDate: '2026-01-01', mastered: true }),
      'img-1': st({ dueDate: '2026-01-01' }),
    };
    const session = selectSession(questions, states, '2026-01-10', { minSize: 5, limit: 10 });
    assert.deepEqual(session.map(q => q.id), ['due-1']);
  });

  it('does not exceed the pool size when minSize is larger than the deck', () => {
    const questions = [q('a'), q('b')];
    const states = { a: st({ dueDate: '2026-01-10' }), b: st({ dueDate: '2026-01-20' }) };
    const session = selectSession(questions, states, '2026-01-10', { minSize: 15, limit: 20 });
    assert.equal(session.length, 2);
  });
});

// ── topProblemQuestions ──────────────────────────────────────────────────────

describe('topProblemQuestions', () => {
  it('ranks by wrong-rate descending', () => {
    const questions = [q('good'), q('bad')];
    const states = {
      good: st({ seen: 10, correct: 9 }),
      bad: st({ seen: 10, correct: 2 }),
    };
    const result = topProblemQuestions(questions, states, 2);
    assert.deepEqual(result.map(q => q.id), ['bad', 'good']);
  });

  it('breaks ties in favour of biased categories', () => {
    const questions = [
      q('plain', { categories: [] }),
      q('biased', { categories: ['staatsorgane'] }),
    ];
    const states = {
      plain: st({ seen: 10, correct: 5 }),
      biased: st({ seen: 10, correct: 5 }),
    };
    const result = topProblemQuestions(questions, states, 2);
    assert.deepEqual(result.map(q => q.id), ['biased', 'plain']);
  });

  it('excludes mastered and never-seen questions', () => {
    const questions = [q('mastered'), q('unseen'), q('active')];
    const states = {
      mastered: st({ seen: 10, correct: 2, mastered: true }),
      unseen: st({ seen: 0, correct: 0 }),
      active: st({ seen: 4, correct: 1 }),
    };
    const result = topProblemQuestions(questions, states, 5);
    assert.deepEqual(result.map(q => q.id), ['active']);
  });

  it('respects n', () => {
    const questions = [q('a'), q('b'), q('c')];
    const states = {
      a: st({ seen: 5, correct: 1 }),
      b: st({ seen: 5, correct: 2 }),
      c: st({ seen: 5, correct: 3 }),
    };
    const result = topProblemQuestions(questions, states, 1);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 'a');
  });
});
