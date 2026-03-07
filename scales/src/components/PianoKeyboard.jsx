import './PianoKeyboard.css'

const BLACK_KEYS = [
  // First octave
  { note: 'C#', enharmonic: 'Db', octave: 1, position: 1 },
  { note: 'D#', enharmonic: 'Eb', octave: 1, position: 2 },
  { note: 'F#', enharmonic: 'Gb', octave: 1, position: 4 },
  { note: 'G#', enharmonic: 'Ab', octave: 1, position: 5 },
  { note: 'B', octave: 1, position: 6 }, // B in German = Bb in English
  // Second octave
  { note: 'C#', enharmonic: 'Db', octave: 2, position: 8 },
  { note: 'D#', enharmonic: 'Eb', octave: 2, position: 9 },
  { note: 'F#', enharmonic: 'Gb', octave: 2, position: 11 },
  { note: 'G#', enharmonic: 'Ab', octave: 2, position: 12 },
  { note: 'B', octave: 2, position: 13 }, // B in German = Bb in English
];

function PianoKeyboard({ scale, selectedNotes, onNoteToggle, checked, isCorrect }) {
  const scaleNotes = new Set(scale.notes);
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'H', 'C', 'D', 'E', 'F', 'G', 'A', 'H']; // German: H instead of B
  const rootIndex = ['C', 'D', 'E', 'F', 'G', 'A', 'H'].indexOf(scale.root);
  
  // Build expected keys starting from root
  const getExpectedKeys = () => {
    const expected = new Set();
    expected.add(`white-${rootIndex}`);
    
    let currentIndex = rootIndex;
    for (let i = 1; i < scale.notes.length; i++) {
      const targetNote = scale.notes[i];
      for (let j = currentIndex + 1; j < whiteKeys.length; j++) {
        if (whiteKeys[j] === targetNote) {
          expected.add(`white-${j}`);
          currentIndex = j;
          break;
        }
      }
    }
    
    // Add black keys that are in the scale pattern
    // We need to find which black keys appear in the scale sequence
    const blackKeyPositions = [
      { note: 'C#', enharmonic: 'Db', octave: 1, position: 1 },
      { note: 'D#', enharmonic: 'Eb', octave: 1, position: 2 },
      { note: 'F#', enharmonic: 'Gb', octave: 1, position: 4 },
      { note: 'G#', enharmonic: 'Ab', octave: 1, position: 5 },
      { note: 'B', octave: 1, position: 6 }, // B in German = Bb in English
      { note: 'C#', enharmonic: 'Db', octave: 2, position: 8 },
      { note: 'D#', enharmonic: 'Eb', octave: 2, position: 9 },
      { note: 'F#', enharmonic: 'Gb', octave: 2, position: 11 },
      { note: 'G#', enharmonic: 'Ab', octave: 2, position: 12 },
      { note: 'B', octave: 2, position: 13 }, // B in German = Bb in English
    ];
    
    // For each note in the scale, if it's a black key, find the appropriate black key position
    // We need to determine which black key to use based on where it appears in the scale sequence
    let lastKeyIndex = rootIndex;
    
    scale.notes.forEach((note, scaleIndex) => {
      if (scaleIndex === 0) return; // Skip root, already added
      
      // Check if this note is a black key
      const isBlackKey = blackKeyPositions.some(({ note: bkNote, enharmonic: bkEnh }) => 
        bkNote === note || (bkEnh && bkEnh === note)
      );
      
      if (isBlackKey) {
        // Find the black key that comes after the last key we added
        // Black keys are positioned between white keys, so we need to find the one
        // that comes after lastKeyIndex
        let bestMatch = null;
        let bestKeyIndex = Infinity;
        
        for (const { note: bkNote, enharmonic: bkEnh, octave, position } of blackKeyPositions) {
          if (bkNote === note || (bkEnh && bkEnh === note)) {
            const keyIndex = position - 1; // Convert to 0-indexed white key position
            // Find the black key that's closest to but >= lastKeyIndex
            if (keyIndex >= lastKeyIndex - 1 && keyIndex < bestKeyIndex) {
              bestMatch = { note: bkNote || 'B', octave, position };
              bestKeyIndex = keyIndex;
            }
          }
        }
        
        if (bestMatch) {
          const noteId = bestMatch.note || 'B';
          expected.add(`black-${bestMatch.octave}-${noteId}`);
          lastKeyIndex = bestMatch.position; // Update to after this black key
        }
      } else {
        // It's a white key - find it and update lastKeyIndex
        // For the octave note (last note), we need to find the next occurrence after the 7th note
        // The loop should already find it correctly, but ensure we're looking in the right range
        for (let j = lastKeyIndex; j < whiteKeys.length; j++) {
          if (whiteKeys[j] === note) {
            expected.add(`white-${j}`);
            lastKeyIndex = j + 1;
            break;
          }
        }
      }
    });
    
    return expected;
  };
  
  const expectedKeys = checked ? getExpectedKeys() : new Set();
  
  // Check if a specific key is selected
  const isSelected = (keyId) => {
    return selectedNotes.has(keyId);
  };
  
  // Check if a specific key is in the expected scale
  const isInScale = (keyId) => {
    return expectedKeys.has(keyId);
  };
  
  // Get the display name (prefer the one in the scale)
  const getDisplayName = (note, enharmonic) => {
    // Check if the scale uses this note
    if (scaleNotes.has(note)) return note;
    if (enharmonic && scaleNotes.has(enharmonic)) return enharmonic;
    // Default to the note name
    return note;
  };

  const handleWhiteKeyClick = (note, index) => {
    if (checked) return;
    const keyId = `white-${index}`;
    onNoteToggle(keyId);
  };

  const handleBlackKeyClick = (note, enharmonic, octave) => {
    if (checked) return;
    const keyId = `black-${octave}-${note || 'B'}`;
    onNoteToggle(keyId);
  };

  const getWhiteKeyClassName = (note, index) => {
    const keyId = `white-${index}`;
    const selected = isSelected(keyId);
    const inScale = isInScale(keyId);
    const isRoot = index === rootIndex && !checked;
    
    let classes = 'white-key';
    
    if (checked) {
      if (selected && inScale) {
        classes += ' correct';
      } else if (selected && !inScale) {
        classes += ' incorrect';
      } else if (!selected && inScale) {
        classes += ' missed';
      }
    } else {
      if (selected) {
        classes += ' selected';
      }
    }
    
    if (isRoot) {
      classes += ' root';
    }
    
    return classes;
  };

  const getBlackKeyClassName = (note, enharmonic, octave) => {
    const keyId = `black-${octave}-${note || 'B'}`;
    const selected = isSelected(keyId);
    const inScale = isInScale(keyId);
    
    let classes = 'black-key';
    
    if (checked) {
      if (selected && inScale) {
        classes += ' correct';
      } else if (selected && !inScale) {
        classes += ' incorrect';
      } else if (!selected && inScale) {
        classes += ' missed';
      }
    } else {
      if (selected) {
        classes += ' selected';
      }
    }
    
    return classes;
  };

  return (
    <div className="piano-keyboard">
      <div className="white-keys">
        {whiteKeys.map((note, index) => (
          <div
            key={`white-${index}`}
            className={getWhiteKeyClassName(note, index)}
            onClick={() => handleWhiteKeyClick(note, index)}
          >
            <span className="note-label">{note}</span>
          </div>
        ))}
      </div>
      <div className="black-keys">
        {BLACK_KEYS.map(({ note, enharmonic, octave, position }) => {
          const displayName = getDisplayName(note || 'B', enharmonic);
          const noteId = note || 'B';
          // Calculate position: black keys are centered between white keys
          // Position N means the black key is between white key (N-1) and white key N
          // Use transform to center precisely
          const keyWidth = 100 / 14; // ~7.143% per white key
          
          // Center point between the two white keys
          // White key (N-1) ends at (N-1) * keyWidth
          // White key N starts at N * keyWidth  
          // Center is at: (N-1) * keyWidth + keyWidth/2 = (N - 0.5) * keyWidth
          const centerPercent = (position - 0.5) * keyWidth;
          
          return (
            <div
              key={`black-${octave}-${noteId}`}
              className={getBlackKeyClassName(noteId, enharmonic, octave)}
              style={{ 
                left: `${centerPercent}%`,
                transform: 'translateX(-50%)'
              }}
              onClick={() => handleBlackKeyClick(noteId, enharmonic, octave)}
            >
              <span className="note-label">{displayName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PianoKeyboard;

