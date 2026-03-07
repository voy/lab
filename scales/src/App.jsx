import { useState, useEffect, useRef } from 'react'
import { generateRandomScale, generateRandomMajorScale, generateRandomMinorScale, constructScale } from './utils/scaleLogic'
import PianoKeyboard from './components/PianoKeyboard'
import './App.css'

const HINT_TIMEOUT = 30000;
const ROOT_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'H'];

function App() {
  const [scale, setScale] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('showAdvanced');
    return saved === 'true';
  });
  const timerRef = useRef(null);
  const checkedRef = useRef(false);

  // Apply dark mode based on system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (e.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    };
    
    // Set initial theme immediately
    if (mediaQuery.matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Initial scale generation
  useEffect(() => {
    const newScale = generateRandomScale();
    setScale(newScale);
    setSelectedNotes(new Set());
    setChecked(false);
    setIsCorrect(false);
    setShowHint(false);
    checkedRef.current = false;
  }, []);
  
  // Timer for hint display
  useEffect(() => {
    if (!scale) return;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Reset hint and checked ref when scale changes
    setShowHint(false);
    checkedRef.current = false;
    
    // Set timer for 90 seconds
    timerRef.current = setTimeout(() => {
      // Only show hint if not already checked
      if (!checkedRef.current) {
        setShowHint(true);
      }
    }, HINT_TIMEOUT);
    
    // Cleanup timer on unmount or scale change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [scale?.root, scale?.type]);
  
  // Hide hint when answer is checked
  useEffect(() => {
    checkedRef.current = checked;
    if (checked) {
      setShowHint(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
  }, [checked]);

  const handleNoteToggle = (note) => {
    if (checked) return; // Don't allow changes after checking
    
    setSelectedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(note)) {
        newSet.delete(note);
      } else {
        newSet.add(note);
      }
      return newSet;
    });
  };

  const handleCheck = () => {
    if (!scale) return;
    
    // Hide hint when checking answer
    setShowHint(false);
    
    // Find root note position in first octave (indices 0-6)
    const rootIndex = ['C', 'D', 'E', 'F', 'G', 'A', 'H'].indexOf(scale.root);
    
    // Build expected scale starting from root in first octave
    const expectedKeys = new Set();
    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'H', 'C', 'D', 'E', 'F', 'G', 'A', 'H'];
    
    // Add root note (first octave)
    expectedKeys.add(`white-${rootIndex}`);
    
    // Build scale pattern from root - scale.notes are in German
    const scaleNotes = scale.notes;
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
    
    // Process scale notes sequentially to build expected keys
    // Include all 8 notes (root + 7 scale degrees including octave)
    let lastKeyIndex = rootIndex;
    
    scaleNotes.forEach((note, scaleIndex) => {
      if (scaleIndex === 0) return; // Skip root, already added
      
      // Check if this note is a black key (B, C#, D#, F#, G#)
      const isBlackKey = blackKeyPositions.some(({ note: bkNote, enharmonic: bkEnh }) => 
        bkNote === note || (bkEnh && bkEnh === note)
      );
      
      if (isBlackKey) {
        // Find the black key that comes after the last key we added
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
          expectedKeys.add(`black-${bestMatch.octave}-${noteId}`);
          lastKeyIndex = bestMatch.position; // Update to after this black key
        }
      } else {
        // It's a white key - find it and update lastKeyIndex
        // For the octave note (last note), we need to find the next occurrence after the 7th note
        // The loop should already find it correctly, but ensure we're looking in the right range
        for (let j = lastKeyIndex; j < whiteKeys.length; j++) {
          if (whiteKeys[j] === note) {
            expectedKeys.add(`white-${j}`);
            lastKeyIndex = j + 1;
            break;
          }
        }
      }
    });
    
    // Compare selected keys with expected keys
    const selectedArray = Array.from(selectedNotes);
    const expectedArray = Array.from(expectedKeys);
    
    const isMatch = 
      selectedArray.length === expectedArray.length &&
      selectedArray.every(key => expectedKeys.has(key));
    
    setIsCorrect(isMatch);
    setChecked(true);
  };

  const resetScaleState = (newScale) => {
    // Clear timer and hide hint
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setShowHint(false);
    checkedRef.current = false;
    
    setScale(newScale);
    setSelectedNotes(new Set());
    setChecked(false);
    setIsCorrect(false);
  };

  const handleNewScale = () => {
    const newScale = generateRandomScale();
    resetScaleState(newScale);
  };

  const handleRandomMajor = () => {
    const newScale = generateRandomMajorScale();
    resetScaleState(newScale);
  };

  const handleRandomMinor = () => {
    const newScale = generateRandomMinorScale();
    resetScaleState(newScale);
  };

  const handleSpecificScale = (root, type) => {
    const newScale = constructScale(root, type);
    resetScaleState(newScale);
  };

  const toggleAdvanced = () => {
    const newValue = !showAdvanced;
    setShowAdvanced(newValue);
    localStorage.setItem('showAdvanced', String(newValue));
  };
  
  // Get pattern hint as W-H notation
  const getPatternHint = () => {
    if (!scale) return '';
    const pattern = scale.type === 'major' 
      ? [2, 2, 1, 2, 2, 2, 1] 
      : [2, 1, 2, 2, 1, 2, 2];
    return pattern.map(interval => interval === 2 ? 'G' : 'H').join('-');
  };

  if (!scale) return <div>Laden...</div>;

  const scaleTypeLabel = scale.type === 'major' ? 'Dur' : 'Moll';

  return (
    <div className="app">
      <header>
        <h1>Tonleiter lernen</h1>
      </header>
      <main>
        <div className="scale-info">
          <h2>Konstruiere: {scale.root} {scaleTypeLabel}</h2>
          <p className="instruction">Klicke die Tasten, die zu dieser Tonleiter gehören</p>
          {showHint && !checked && (
            <div className="pattern-hint">
              <span className="hint-label">Hinweis:</span> {getPatternHint()}
            </div>
          )}
        </div>
        <PianoKeyboard 
          scale={scale}
          selectedNotes={selectedNotes}
          onNoteToggle={handleNoteToggle}
          checked={checked}
          isCorrect={isCorrect}
        />
        <div className="controls">
          <button 
            onClick={handleCheck} 
            disabled={checked}
            className="check-button"
          >
            Antwort prüfen
          </button>
          {checked && (
            <>
              <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                {isCorrect ? '✓ Richtig!' : '✗ Falsch'}
              </div>
              {!isCorrect && (
                <div className="correct-answer">
                  Richtige Antwort: {scale.notes.join(' - ')}
                </div>
              )}
            </>
          )}
          <div className="scale-selection">
            <div className="random-buttons">
              <button 
                onClick={handleNewScale} 
                className="scale-button"
              >
                Neue zufällige Tonleiter
              </button>
            </div>
            <button 
              onClick={toggleAdvanced} 
              className="advanced-toggle"
            >
              {showAdvanced ? '▼ Erweiterte Einstellungen ausblenden' : '▶ Erweiterte Einstellungen'}
            </button>
            {showAdvanced && (
              <>
                <div className="random-buttons">
                  <button 
                    onClick={handleRandomMajor} 
                    className="scale-button"
                  >
                    Zufällige Dur-Tonleiter
                  </button>
                  <button 
                    onClick={handleRandomMinor} 
                    className="scale-button"
                  >
                    Zufällige Moll-Tonleiter
                  </button>
                </div>
                <div className="specific-scales">
                  <div className="scale-group">
                    <h3>Dur-Tonleitern</h3>
                    <div className="scale-buttons-grid">
                      {ROOT_NOTES.map(root => (
                        <button
                          key={`${root}-major`}
                          onClick={() => handleSpecificScale(root, 'major')}
                          className="scale-button small"
                        >
                          {root} Dur
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="scale-group">
                    <h3>Moll-Tonleitern</h3>
                    <div className="scale-buttons-grid">
                      {ROOT_NOTES.map(root => (
                        <button
                          key={`${root}-minor`}
                          onClick={() => handleSpecificScale(root, 'minor')}
                          className="scale-button small"
                        >
                          {root} Moll
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

