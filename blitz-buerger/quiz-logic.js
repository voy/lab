// Pure functions. Browser: loaded as a plain script (globals).
// Node: required by the test runner via the module.exports tail.

const CATEGORIES = ['staatsorgane', 'daten-jahre'];

// ── Auto-tagging (build-time, one-off) ──────────────────────────────────────
// questions.js is already pre-tagged; these are exported so the tagging can
// be re-run/reused if the data ever needs regenerating.

const STAATSORGANE_KEYWORDS = [
  'Bundestag', 'Bundesrat', 'Bundesregierung', 'Bundespräsident',
  'Bundesverfassungsgericht', 'Bundeskanzler', 'Gewaltenteilung',
  'Ministerpräsident', 'Landtag', 'Wahlperiode', 'Legislaturperiode',
];

const DATEN_JAHRE_REGEX = /\b(1[789]\d{2}|20\d{2})\b|\bwann\b|\bseit\b/i;

function questionHaystack(question) {
  return [question.text, ...question.choices].join(' ');
}

function tagStaatsorgane(question) {
  const haystack = questionHaystack(question).toLowerCase();
  return STAATSORGANE_KEYWORDS.some(k => haystack.includes(k.toLowerCase()));
}

function tagDatenJahre(question) {
  return DATEN_JAHRE_REGEX.test(questionHaystack(question));
}

// ── Spaced-repetition scheduler (Leitner boxes with day-intervals) ─────────

const INTERVALS = { 0: 0, 1: 1, 2: 3, 3: 7, 4: 16, 5: 35 };

// Local-date string math, no timezone library. `dateStr` is "YYYY-MM-DD".
function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function isBiasedCategory(question) {
  return Array.isArray(question.categories) &&
    (question.categories.includes('staatsorgane') || question.categories.includes('daten-jahre'));
}

function seedState(question, today) {
  if (isBiasedCategory(question)) {
    return { box: 1, dueDate: today, streak: 0, seen: 0, correct: 0, mastered: false };
  }
  return { box: 3, dueDate: addDays(today, INTERVALS[3]), streak: 0, seen: 0, correct: 0, mastered: false };
}

function applyAnswer(state, correct, today) {
  const seen = state.seen + 1;
  if (correct) {
    const box = Math.min(state.box + 1, 5);
    const streak = state.streak + 1;
    return {
      ...state,
      box,
      streak,
      seen,
      correct: state.correct + 1,
      dueDate: addDays(today, INTERVALS[box]),
      mastered: box === 5 && streak >= 3,
    };
  }
  const box = Math.max(state.box - 2, 0);
  const streak = 0;
  return {
    ...state,
    box,
    streak,
    seen,
    dueDate: today,
    mastered: box === 5 && streak >= 3,
  };
}

function isDue(state, today) {
  return !state.mastered && state.dueDate <= today;
}

function weightedShuffle(items, getWeight) {
  const weighted = items.flatMap(it => Array(Math.max(1, getWeight(it))).fill(it));
  weighted.sort(() => Math.random() - 0.5);
  const seen = new Set();
  return weighted.filter(it => {
    if (seen.has(it.id)) return false;
    seen.add(it.id);
    return true;
  });
}

function sessionWeight(question, states) {
  let weight = 1;
  if (isBiasedCategory(question)) weight += 2;
  const state = states[question.id];
  if (state && state.seen > 0 && state.correct < state.seen) weight += 2;
  return weight;
}

function selectSession(questions, states, today, opts = {}) {
  const minSize = opts.minSize ?? 15;
  const limit = opts.limit ?? 20;

  const active = questions.filter(q => !q.imageOnly || q.image);
  const due = active.filter(q => states[q.id] && isDue(states[q.id], today));

  const pool = [...due];
  if (pool.length < minSize) {
    const poolIds = new Set(pool.map(q => q.id));
    const backlog = active
      .filter(q => !poolIds.has(q.id) && states[q.id] && !states[q.id].mastered)
      .sort((a, b) => (states[a.id].dueDate < states[b.id].dueDate ? -1 : states[a.id].dueDate > states[b.id].dueDate ? 1 : 0));
    for (const q of backlog) {
      if (pool.length >= minSize) break;
      pool.push(q);
    }
  }

  const shuffled = weightedShuffle(pool, q => sessionWeight(q, states));
  return shuffled.slice(0, limit);
}

function topProblemQuestions(questions, states, n = 5) {
  return questions
    .filter(q => states[q.id] && !states[q.id].mastered && states[q.id].seen > 0)
    .map(q => {
      const state = states[q.id];
      return {
        question: q,
        wrongRate: (state.seen - state.correct) / state.seen,
        biased: isBiasedCategory(q),
      };
    })
    .sort((a, b) => {
      if (b.wrongRate !== a.wrongRate) return b.wrongRate - a.wrongRate;
      if (a.biased !== b.biased) return a.biased ? -1 : 1;
      return 0;
    })
    .slice(0, n)
    .map(x => x.question);
}

if (typeof module !== 'undefined') {
  module.exports = {
    CATEGORIES,
    tagStaatsorgane, tagDatenJahre,
    INTERVALS, addDays,
    seedState, applyAnswer, isDue,
    weightedShuffle, selectSession, topProblemQuestions,
  };
}
