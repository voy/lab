// Scale construction logic

// Uses German note names (H instead of B, B instead of Bb)
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H'];
const ROOT_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'H'];
const MAJOR_PATTERN = [2, 2, 1, 2, 2, 2, 1]; // semitones
const MINOR_PATTERN = [2, 1, 2, 2, 1, 2, 2]; // semitones

// Convert sharps to flats where appropriate based on standard scale spellings
// In German: B = Bb (English), H = B (English)
function normalizeNote(note, root, type) {
  // F Major: F, G, A, B, C, D, E (B = Bb in English)
  if (root === 'F' && type === 'major' && note === 'A#') return 'B';
  
  // D Minor: D, E, F, G, A, B, C (B = Bb in English)
  if (root === 'D' && type === 'minor' && note === 'A#') return 'B';
  
  // C Minor: C, D, Eb, F, G, Ab, B (B = Bb in English)
  if (root === 'C' && type === 'minor') {
    if (note === 'D#') return 'Eb';
    if (note === 'G#') return 'Ab';
    if (note === 'A#') return 'B';
  }
  
  // G Minor: G, A, B, C, D, Eb, F (B = Bb in English)
  if (root === 'G' && type === 'minor') {
    if (note === 'A#') return 'B';
    if (note === 'D#') return 'Eb';
  }
  
  // F Minor: F, G, Ab, B, C, Db, Eb (B = Bb in English)
  if (root === 'F' && type === 'minor') {
    if (note === 'G#') return 'Ab';
    if (note === 'A#') return 'B';
    if (note === 'C#') return 'Db';
    if (note === 'D#') return 'Eb';
  }
  
  return note;
}

export function generateRandomScale() {
  const root = ROOT_NOTES[Math.floor(Math.random() * ROOT_NOTES.length)];
  const type = Math.random() < 0.5 ? 'major' : 'minor';
  return constructScale(root, type);
}

export function generateRandomMajorScale() {
  const root = ROOT_NOTES[Math.floor(Math.random() * ROOT_NOTES.length)];
  return constructScale(root, 'major');
}

export function generateRandomMinorScale() {
  const root = ROOT_NOTES[Math.floor(Math.random() * ROOT_NOTES.length)];
  return constructScale(root, 'minor');
}

export function constructScale(root, type) {
  const pattern = type === 'major' ? MAJOR_PATTERN : MINOR_PATTERN;
  const rootIndex = CHROMATIC.indexOf(root);
  
  const scale = [root];
  let currentIndex = rootIndex;
  
  for (const interval of pattern) {
    currentIndex = (currentIndex + interval) % CHROMATIC.length;
    const note = CHROMATIC[currentIndex];
    scale.push(normalizeNote(note, root, type));
  }
  
  return {
    root,
    type,
    notes: scale // Return 8 notes (root to octave)
  };
}

