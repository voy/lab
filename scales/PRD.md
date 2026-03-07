# Product Requirements Document: Musical Scale Learning Application

## 1. Overview

### 1.1 Purpose

A web-based educational application that helps users learn and practice constructing major and minor musical scales. The application displays a random scale on each page load and tests the user's knowledge of scale construction patterns.

### 1.2 Target Audience

-   Music students learning scale theory
-   Musicians wanting to practice scale construction
-   Anyone interested in understanding musical scale patterns

### 1.3 Goals

-   Provide an interactive way to learn major and minor scale construction
-   Test user knowledge through visual and interactive elements
-   Reinforce understanding of scale patterns through repetition

## 2. Features

### 2.1 Core Features

#### 2.1.1 Scale Display

-   **Visual Representation**: Display the current scale using a visual interface (piano keyboard, staff notation, or note names)
-   **Scale Information**: Show the root note and scale type (major/minor)
-   **Note Highlighting**: Visually distinguish which notes belong to the scale

#### 2.1.2 Random Scale Generation

-   **On Page Load**: Generate a new random scale each time the page loads
-   **Root Notes**: Randomly select from C, D, E, F, G, A, B (natural notes only - no F#, Bb, etc. as roots)
-   **Scale Types**: Randomly select between major and minor scales
-   **Pattern Application**: Apply correct interval patterns with full accidentals:
    -   Major: W-W-H-W-W-W-H (Whole-Whole-Half-Whole-Whole-Whole-Half)
    -   Minor: W-H-W-W-H-W-W (Whole-Half-Whole-Whole-Half-Whole-Whole)
-   **Accidentals**: Scales can and should include accidentals (e.g., F Major includes Bb, D Major includes F# and C#)

#### 2.1.3 Interactive Testing

-   **Question Format**: Present the user with a root note and scale type
-   **User Input**: Allow user to select/construct the scale
-   **Feedback**: Provide immediate feedback on correctness
-   **Visual Feedback**: Highlight correct/incorrect selections

### 2.2 Display Options

#### Option A: Piano Keyboard Visualization

-   Display a piano keyboard with white keys (C, D, E, F, G, A, B) and black keys (accidentals)
-   Highlight keys that belong to the scale (including accidentals like Bb, F#, etc.)
-   Use Canvas, SVG, or CSS for rendering

#### Option B: Note List Display

-   Show scale notes as a list or sequence
-   Display note names including accidentals (e.g., F, G, A, Bb, C, D, E)
-   Indicate scale pattern visually

#### Option C: Staff Notation

-   Display notes on a musical staff
-   Use Canvas for rendering musical notation

**Recommendation**: Start with Option A (Piano Keyboard) as it's most intuitive and visually engaging.

## 3. Technical Requirements

### 3.1 Technology Stack

-   **Frontend Framework**: React (minimal setup)
-   **Language**: JavaScript (ES6+)
-   **Rendering**: HTML/CSS with optional Canvas API (for piano keyboard visualization)
-   **Styling**: Plain CSS
-   **Build Tool**: Minimal setup - Vite or simple HTML/JS setup

### 3.2 Browser Support

-   Modern browsers (Chrome, Firefox, Safari, Edge)
-   No IE11 support required

### 3.3 Dependencies

-   React (minimal - core library only)
-   No external music libraries required (scale logic can be implemented natively)
-   No additional UI libraries or frameworks

## 4. User Stories

### 4.1 As a user, I want to:

1. See a random scale displayed when I load the page
2. Understand which notes belong to the displayed scale
3. See the root note and scale type clearly labeled
4. Get a new random scale on each page reload
5. (Future) Interactively test my knowledge by constructing scales

## 5. Functional Requirements

### 5.1 Scale Generation Logic

#### 5.1.1 Root Note Selection

-   Randomly select from: C, D, E, F, G, A, B
-   Equal probability for each note

#### 5.1.2 Scale Type Selection

-   Randomly select: Major or Minor
-   Equal probability for each type

#### 5.1.3 Scale Construction

-   **Major Scale Pattern**: W-W-H-W-W-W-H (Whole-Whole-Half-Whole-Whole-Whole-Half)
    -   Example: C Major = C, D, E, F, G, A, B, C
    -   Example: F Major = F, G, A, Bb, C, D, E, F (includes Bb)
    -   Example: D Major = D, E, F#, G, A, B, C#, D (includes F# and C#)
-   **Minor Scale Pattern**: W-H-W-W-H-W-W (Whole-Half-Whole-Whole-Half-Whole-Whole)
    -   Example: A Minor = A, B, C, D, E, F, G, A
    -   Example: D Minor = D, E, F, G, A, Bb, C, D (includes Bb)
    -   Example: E Minor = E, F#, G, A, B, C, D, E (includes F#)
-   **Root Note Constraint**: Root notes must be natural notes only (C, D, E, F, G, A, B)
-   **Scale Notes**: Scales can and should include accidentals (sharps and flats) as required by the pattern
-   **Implementation**: Apply interval patterns correctly, including all accidentals needed for proper scale construction

#### 5.1.4 Scale Display

-   Show all 7 notes of the scale (root to octave)
-   Highlight or emphasize scale notes
-   Display root note and scale type as text

### 5.2 Visual Requirements

#### 5.2.1 Piano Keyboard (Recommended)

-   Display white keys: C, D, E, F, G, A, B
-   Display black keys (accidentals): C#/Db, D#/Eb, F#/Gb, G#/Ab, A#/Bb
-   Visual distinction for keys in the scale vs. not in the scale
-   Highlight accidentals that are part of the scale (e.g., Bb in F Major)
-   Clear labeling of note names
-   Responsive design (works on mobile and desktop)

#### 5.2.2 Information Display

-   Root note: Clearly displayed (e.g., "Root: C")
-   Scale type: Clearly displayed (e.g., "Type: Major")
-   Scale notes: List or visual representation of all scale notes

### 5.3 Interaction Requirements (Phase 1 - Display Only)

-   **Initial Version**: Display-only (no user input required)
-   **Future Enhancement**: Add interactive testing mode

## 6. Design Specifications

### 6.1 Layout

-   **Header**: Application title
-   **Main Content Area**:
    -   Scale information (root note, type)
    -   Visual scale representation (piano keyboard or note list)
    -   Scale notes list
-   **Footer**: Optional instructions or credits

### 6.2 Color Scheme

-   **Scale Notes**: Highlighted color (e.g., blue, green)
-   **Non-Scale Notes**: Neutral color (e.g., gray, white)
-   **Root Note**: Special highlight (e.g., darker shade or different color)
-   **Background**: Clean, minimal design

### 6.3 Typography

-   Clear, readable fonts
-   Sufficient contrast for accessibility
-   Scale information prominently displayed

## 7. Implementation Details

### 7.1 Component Structure

```
App
├── Header
├── ScaleDisplay
│   ├── ScaleInfo (root note, type)
│   ├── PianoKeyboard (Canvas-based)
│   └── ScaleNotesList
└── Footer
```

### 7.2 Key Functions

#### 7.2.1 Scale Generation

```javascript
// Pseudo-code
function generateRandomScale() {
    const rootNotes = ["C", "D", "E", "F", "G", "A", "B"];
    const scaleTypes = ["major", "minor"];

    const root = randomSelect(rootNotes);
    const type = randomSelect(scaleTypes);

    return constructScale(root, type);
}
```

#### 7.2.2 Scale Construction

```javascript
// Pseudo-code
function constructScale(root, type) {
    // Full chromatic scale with accidentals
    const chromatic = [
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    ];
    const majorPattern = [2, 2, 1, 2, 2, 2, 1]; // semitones
    const minorPattern = [2, 1, 2, 2, 1, 2, 2]; // semitones

    const pattern = type === "major" ? majorPattern : minorPattern;
    // Build scale based on pattern, starting from root
    // Return array of note names including accidentals (e.g., ["F", "G", "A", "Bb", "C", "D", "E"])
}
```

### 7.3 Keyboard Implementation

-   Use HTML5 Canvas, SVG, or CSS for piano keyboard rendering
-   Draw white keys (C, D, E, F, G, A, B) as rectangles
-   Draw black keys (accidentals) positioned correctly between white keys
-   Fill keys with different colors based on scale membership
-   Add note labels to keys (including accidentals like Bb, F#)

## 8. Acceptance Criteria

### 8.1 Scale Generation

-   [ ] Application generates a random scale on each page load
-   [ ] Root note is randomly selected from C, D, E, F, G, A, B
-   [ ] Scale type is randomly selected from Major or Minor
-   [ ] Scale construction follows correct interval patterns
-   [ ] Scales correctly include accidentals when required (e.g., Bb in F Major, F# and C# in D Major)
-   [ ] Root notes are always natural notes (C, D, E, F, G, A, B)

### 8.2 Display

-   [ ] Root note is clearly displayed
-   [ ] Scale type is clearly displayed
-   [ ] Scale notes are visually represented (including accidentals)
-   [ ] Scale notes are distinguishable from non-scale notes
-   [ ] Accidentals are clearly displayed (e.g., Bb, F#, C#)
-   [ ] Application is responsive (works on mobile and desktop)

### 8.3 Technical

-   [ ] Application loads without errors
-   [ ] Each page reload generates a new random scale
-   [ ] No console errors
-   [ ] Code is clean and maintainable

## 9. Future Enhancements (Out of Scope for MVP)

### 9.1 Interactive Testing Mode

-   Allow users to click keys to construct the scale
-   Provide feedback on correctness
-   Show correct answer if user is wrong

### 9.2 Statistics

-   Track user performance
-   Show percentage of correct answers
-   Display streak counter

### 9.3 Additional Features

-   Add more scale types (pentatonic, blues, etc.)
-   Add audio playback of scales
-   Include scale pattern explanation

## 10. Success Metrics

### 10.1 User Engagement

-   Time spent on page
-   Number of page reloads (indicating interest in seeing new scales)

### 10.2 Educational Value

-   User understanding of scale patterns
-   Ability to identify scales correctly (in future testing mode)

## 11. Timeline & Phases

### Phase 1: MVP (Minimum Viable Product)

-   Random scale generation
-   Visual display of scale
-   Basic styling
-   **Estimated Time**: 1-2 days

### Phase 2: Enhanced Display

-   Improved visual design
-   Better piano keyboard rendering
-   Responsive design improvements
-   **Estimated Time**: 1 day

### Phase 3: Interactive Testing (Future)

-   User input functionality
-   Feedback system
-   **Estimated Time**: 2-3 days

## 12. Notes & Constraints

### 12.1 Constraints

-   **Root Notes Only**: Root notes must be natural notes (C, D, E, F, G, A, B) - no F#, Bb, etc. as starting notes
-   **Scale Notes**: Scales can and should include accidentals (e.g., F Major includes Bb, D Major includes F# and C#)
-   Only major and minor scales
-   Each reload = new random scale (no manual refresh button needed)

### 12.2 Assumptions

-   Users have basic understanding of musical notes
-   Users understand the concept of major and minor scales
-   Canvas API is supported in target browsers

### 12.3 Technical Notes

-   Scale construction must account for the full chromatic scale (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
-   Apply interval patterns correctly to determine which notes (including accidentals) belong to each scale
-   Root notes are limited to natural notes, but scales themselves include all necessary accidentals
-   Example: F Major correctly includes Bb (not B natural)

## 13. Edge Cases

### 13.1 Scale Construction with Accidentals

-   **Root Note Constraint**: Root notes are limited to natural notes (C, D, E, F, G, A, B)
-   **Scale Construction**: Scales must be constructed correctly with all required accidentals
-   **Examples**:
    -   F Major = F, G, A, **Bb**, C, D, E, F
    -   D Major = D, E, **F#**, G, A, B, **C#**, D
    -   Bb Major = **Not allowed** (root must be natural note)
    -   F# Minor = **Not allowed** (root must be natural note)
-   **Implementation**: Use chromatic scale to apply interval patterns correctly, then display all notes including accidentals

### 13.2 Note Sequence Handling

-   Ensure proper wrapping when scale extends beyond one octave
-   Handle edge cases where root note is near the end of the sequence

## 14. Revision History

| Version | Date           | Author  | Changes              |
| ------- | -------------- | ------- | -------------------- |
| 1.0     | [Current Date] | Initial | Initial PRD creation |
