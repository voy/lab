(function () {
  'use strict';

  const SRS_KEY = 'blitz-buerger-srs-v1';
  const TAG_OVERRIDES_KEY = 'blitz-buerger-tag-overrides-v1';
  const SYNC_CODE_KEY = 'blitz-buerger-sync-bucket';
  const LOCAL_UPDATED_AT_KEY = 'blitz-buerger-updated-at';
  const LAST_PUSHED_AT_KEY = 'blitz-buerger-last-pushed-at';
  const LAST_PULLED_AT_KEY = 'blitz-buerger-last-pulled-at';
  const LAST_KNOWN_REMOTE_AT_KEY = 'blitz-buerger-last-known-remote-at';
  const MANTLEDB_BASE = 'https://mantledb.sh/v2';
  const ANSWER_DELAY_MS = 1400;

  function todayStr() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function loadSrs() {
    try { return JSON.parse(localStorage.getItem(SRS_KEY)) || {}; } catch { return {}; }
  }
  function saveSrs(state) {
    localStorage.setItem(SRS_KEY, JSON.stringify(state));
    localStorage.setItem(LOCAL_UPDATED_AT_KEY, new Date().toISOString());
  }
  function loadLocalUpdatedAt() {
    try { return localStorage.getItem(LOCAL_UPDATED_AT_KEY) || null; } catch { return null; }
  }
  function loadTagOverrides() {
    try { return JSON.parse(localStorage.getItem(TAG_OVERRIDES_KEY)) || {}; } catch { return {}; }
  }
  function saveTagOverrides(overrides) {
    localStorage.setItem(TAG_OVERRIDES_KEY, JSON.stringify(overrides));
  }
  function loadSyncCode() {
    try { return localStorage.getItem(SYNC_CODE_KEY) || ''; } catch { return ''; }
  }
  function saveSyncCode(code) {
    localStorage.setItem(SYNC_CODE_KEY, code);
  }
  function loadLastPushedAt() {
    try { return localStorage.getItem(LAST_PUSHED_AT_KEY) || null; } catch { return null; }
  }
  function saveLastPushedAt(iso) {
    localStorage.setItem(LAST_PUSHED_AT_KEY, iso);
  }
  function loadLastPulledAt() {
    try { return localStorage.getItem(LAST_PULLED_AT_KEY) || null; } catch { return null; }
  }
  function saveLastPulledAt(iso) {
    localStorage.setItem(LAST_PULLED_AT_KEY, iso);
  }
  function loadLastKnownRemoteAt() {
    try { return localStorage.getItem(LAST_KNOWN_REMOTE_AT_KEY) || null; } catch { return null; }
  }
  function saveLastKnownRemoteAt(iso) {
    localStorage.setItem(LAST_KNOWN_REMOTE_AT_KEY, iso);
  }

  let srs = loadSrs();
  let tagOverrides = loadTagOverrides();

  // Seed state for any question not yet tracked (first-ever load, or new questions added later).
  (function seedMissing() {
    const today = todayStr();
    let changed = false;
    for (const q of QUESTIONS) {
      if (!srs[q.id]) {
        srs[q.id] = seedState(q, today);
        changed = true;
      }
    }
    if (changed) saveSrs(srs);
  })();

  // ── Tab navigation ─────────────────────────────────────────────────
  const tabButtons = document.querySelectorAll('.tab-btn');
  const screens = {
    quiz: document.getElementById('screen-quiz'),
    stats: document.getElementById('screen-stats'),
    settings: document.getElementById('screen-settings'),
  };

  function showScreen(name) {
    for (const key of Object.keys(screens)) {
      screens[key].hidden = key !== name;
    }
    tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.screen === name));
    if (name === 'stats') renderStats();
    if (name === 'settings') { checkRemoteFreshness(); renderSyncStatus(); }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.screen));
  });

  // ── Quiz screen ────────────────────────────────────────────────────
  const questionTextEl = document.getElementById('question-text');
  const questionImageEl = document.getElementById('question-image');
  const quizProgressEl = document.getElementById('quiz-progress');
  const quizEmptyEl = document.getElementById('quiz-empty');
  const choicesEl = document.getElementById('choices');
  const choiceButtons = Array.from(document.querySelectorAll('.choice-btn'));

  let session = [];
  let sessionIdx = 0;
  let answering = false;

  function buildSession() {
    session = selectSession(QUESTIONS, srs, todayStr());
    sessionIdx = 0;
  }

  function showQuestion() {
    if (sessionIdx >= session.length) buildSession();

    if (session.length === 0) {
      choicesEl.hidden = true;
      questionTextEl.hidden = true;
      quizProgressEl.hidden = true;
      quizEmptyEl.hidden = false;
      return;
    }

    choicesEl.hidden = false;
    questionTextEl.hidden = false;
    quizProgressEl.hidden = false;
    quizEmptyEl.hidden = true;

    const q = session[sessionIdx];
    questionTextEl.textContent = q.text;
    if (q.image) {
      questionImageEl.src = q.image;
      questionImageEl.hidden = false;
    } else {
      questionImageEl.hidden = true;
      questionImageEl.src = '';
    }
    quizProgressEl.textContent = `${sessionIdx + 1} / ${session.length}`;
    choiceButtons.forEach((btn, i) => {
      btn.textContent = q.choices[i] ?? '';
      btn.className = 'choice-btn';
      btn.disabled = false;
    });
    answering = false;
  }

  function handleChoice(i) {
    if (answering || session.length === 0) return;
    answering = true;

    const q = session[sessionIdx];
    const correct = i === q.correctIndex;

    choiceButtons[q.correctIndex].classList.add('correct');
    if (!correct) choiceButtons[i].classList.add('wrong');
    choiceButtons.forEach(btn => { btn.disabled = true; });

    srs[q.id] = applyAnswer(srs[q.id], correct, todayStr());
    saveSrs(srs);

    setTimeout(() => {
      sessionIdx++;
      showQuestion();
    }, ANSWER_DELAY_MS);
  }

  choiceButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => handleChoice(i));
  });

  const ANSWER_KEYS = { a: 0, b: 1, c: 2, d: 3 };
  document.addEventListener('keydown', event => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    if (screens.quiz.hidden) return;
    const i = ANSWER_KEYS[event.key.toLowerCase()];
    if (i === undefined) return;
    handleChoice(i);
  });

  // ── Stats screen ───────────────────────────────────────────────────
  const statsMasteredEl = document.getElementById('stats-mastered');
  const statsTotalEl = document.getElementById('stats-total');
  const statsProblemsEl = document.getElementById('stats-problems');
  const statsProblemsEmptyEl = document.getElementById('stats-problems-empty');

  function renderStats() {
    const total = QUESTIONS.filter(q => !q.imageOnly || q.image).length;
    const mastered = Object.values(srs).filter(s => s.mastered).length;
    statsMasteredEl.textContent = String(mastered);
    statsTotalEl.textContent = String(total);

    const problems = topProblemQuestions(QUESTIONS, srs, 5);
    statsProblemsEl.innerHTML = '';
    statsProblemsEmptyEl.hidden = problems.length > 0;

    for (const q of problems) {
      const state = srs[q.id];
      const wrongCount = state.seen - state.correct;
      const li = document.createElement('li');
      const textSpan = document.createElement('span');
      textSpan.textContent = q.text;
      const countSpan = document.createElement('span');
      countSpan.className = 'wrong-count';
      countSpan.textContent = `${wrongCount}x falsch`;
      li.appendChild(textSpan);
      li.appendChild(countSpan);
      statsProblemsEl.appendChild(li);
    }
  }

  // ── Settings screen: sync ─────────────────────────────────────────
  const syncCodeInput = document.getElementById('sync-code-input');
  const newCodeBtn = document.getElementById('new-code-btn');
  const pushBtn = document.getElementById('push-btn');
  const pullBtn = document.getElementById('pull-btn');
  const syncStatusEl = document.getElementById('sync-status');
  const syncStatusLabelEl = document.getElementById('sync-status-label');
  const syncTsLocalEl = document.getElementById('sync-ts-local');
  const syncTsPushedEl = document.getElementById('sync-ts-pushed');
  const syncTsPulledEl = document.getElementById('sync-ts-pulled');

  function setSyncStatus(text) {
    syncStatusEl.textContent = text;
  }

  function formatTs(iso) {
    return iso ? new Date(iso).toLocaleString('de-DE') : 'nie';
  }

  function maxIso(a, b) {
    if (!a) return b || null;
    if (!b) return a;
    return a > b ? a : b;
  }

  function getSyncStatus() {
    const code = loadSyncCode();
    if (!code) return { label: 'Kein Sync-Code eingerichtet', level: 'none' };

    const lastKnownRemoteAt = loadLastKnownRemoteAt();
    if (!lastKnownRemoteAt) return { label: 'Noch nicht synchronisiert', level: 'none' };

    const localUpdatedAt = loadLocalUpdatedAt();
    const lastSyncedAt = maxIso(loadLastPushedAt(), loadLastPulledAt());

    if (localUpdatedAt && (!lastSyncedAt || localUpdatedAt > lastSyncedAt)) {
      return { label: 'Lokale Änderungen nicht gesichert — Push empfehlenswert', level: 'warn' };
    }
    if (lastKnownRemoteAt > (localUpdatedAt || '')) {
      return { label: 'Neuere Daten auf dem Server — Pull empfehlenswert', level: 'warn' };
    }
    return { label: 'Synchron', level: 'ok' };
  }

  function renderSyncStatus() {
    const status = getSyncStatus();
    syncStatusLabelEl.textContent = status.label;
    syncStatusLabelEl.className = `sync-status-${status.level}`;
    syncTsLocalEl.textContent = formatTs(loadLocalUpdatedAt());
    syncTsPushedEl.textContent = formatTs(loadLastPushedAt());
    syncTsPulledEl.textContent = formatTs(loadLastPulledAt());
  }

  function newSyncCode() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID().slice(0, 8);
    }
    return Math.random().toString(36).slice(2, 10);
  }

  syncCodeInput.value = loadSyncCode();

  syncCodeInput.addEventListener('change', () => {
    saveSyncCode(syncCodeInput.value.trim());
  });

  newCodeBtn.addEventListener('click', () => {
    const code = newSyncCode();
    syncCodeInput.value = code;
    saveSyncCode(code);
  });

  function applyIncomingState(data) {
    srs = data.srs || {};
    tagOverrides = data.tagOverrides || {};
    saveSrs(srs);
    saveTagOverrides(tagOverrides);
    buildSession();
    showQuestion();
    renderStats();
  }

  async function pushSync() {
    const code = syncCodeInput.value.trim();
    if (!code) { setSyncStatus('Bitte zuerst einen Sync-Code eingeben.'); renderSyncStatus(); return; }
    saveSyncCode(code);
    setSyncStatus('Push läuft …');
    try {
      const payload = { version: 1, exportedAt: new Date().toISOString(), updatedAt: loadLocalUpdatedAt(), srs, tagOverrides };
      const res = await fetch(`${MANTLEDB_BASE}/${encodeURIComponent(code)}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const now = new Date().toISOString();
      saveLastPushedAt(now);
      saveLastKnownRemoteAt(payload.updatedAt || now);
      setSyncStatus('Push erfolgreich.');
    } catch (err) {
      setSyncStatus(`Push fehlgeschlagen: ${err.message}`);
    }
    renderSyncStatus();
  }

  async function pullSync() {
    const code = syncCodeInput.value.trim();
    if (!code) { setSyncStatus('Bitte zuerst einen Sync-Code eingeben.'); renderSyncStatus(); return; }
    saveSyncCode(code);
    setSyncStatus('Pull läuft …');
    try {
      const res = await fetch(`${MANTLEDB_BASE}/${encodeURIComponent(code)}/state`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      applyIncomingState(data);
      const now = new Date().toISOString();
      saveLastPulledAt(now);
      saveLastKnownRemoteAt(data.updatedAt || data.exportedAt || now);
      setSyncStatus('Pull erfolgreich.');
    } catch (err) {
      setSyncStatus(`Pull fehlgeschlagen: ${err.message}`);
    }
    renderSyncStatus();
  }

  pushBtn.addEventListener('click', pushSync);
  pullBtn.addEventListener('click', pullSync);

  // ── Stale-data banner (passive check, manual pull only) ───────────
  const staleBannerEl = document.getElementById('stale-banner');
  const staleBannerTextEl = document.getElementById('stale-banner-text');
  const staleBannerPullBtn = document.getElementById('stale-banner-pull-btn');
  const staleBannerDismissBtn = document.getElementById('stale-banner-dismiss-btn');
  let staleBannerDismissed = false;

  function showStaleBanner() {
    if (staleBannerDismissed) return;
    staleBannerTextEl.textContent = 'Neuere Daten auf dem Server gefunden.';
    staleBannerEl.hidden = false;
  }
  function hideStaleBanner() {
    staleBannerEl.hidden = true;
  }

  async function checkRemoteFreshness() {
    const code = loadSyncCode();
    if (!code) return;
    try {
      const res = await fetch(`${MANTLEDB_BASE}/${encodeURIComponent(code)}/state`);
      if (!res.ok) return;
      const data = await res.json();
      const remoteUpdatedAt = data.updatedAt || data.exportedAt;
      if (!remoteUpdatedAt) { hideStaleBanner(); return; }
      saveLastKnownRemoteAt(remoteUpdatedAt);
      const localUpdatedAt = loadLocalUpdatedAt();
      const isStale = !localUpdatedAt || new Date(remoteUpdatedAt) > new Date(localUpdatedAt);
      if (isStale) showStaleBanner();
      else hideStaleBanner();
    } catch {
      // background convenience check — fail silently
    } finally {
      renderSyncStatus();
    }
  }

  staleBannerPullBtn.addEventListener('click', () => {
    pullSync();
    hideStaleBanner();
  });
  staleBannerDismissBtn.addEventListener('click', () => {
    staleBannerDismissed = true;
    hideStaleBanner();
  });

  // ── Settings screen: export / import (sync-independent backup) ───
  const exportBtn = document.getElementById('export-btn');
  const importInput = document.getElementById('import-input');

  exportBtn.addEventListener('click', () => {
    const payload = { version: 1, exportedAt: new Date().toISOString(), updatedAt: loadLocalUpdatedAt(), srs, tagOverrides };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blitz-buerger-backup-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    renderSyncStatus();
  });

  importInput.addEventListener('change', () => {
    const file = importInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        applyIncomingState(data);
        setSyncStatus('Import erfolgreich.');
      } catch (err) {
        setSyncStatus(`Import fehlgeschlagen: ${err.message}`);
      }
      renderSyncStatus();
    };
    reader.readAsText(file);
    importInput.value = '';
  });

  // ── Service worker ─────────────────────────────────────────────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }

  // ── Init ────────────────────────────────────────────────────────────
  buildSession();
  showQuestion();
  checkRemoteFreshness();
})();
