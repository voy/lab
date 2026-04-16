# grand-staff-quiz

A self-made drill for reading notes on the grand staff faster.

## The backstory

I've been playing piano for a few years, but reading sheet music — actually reading it, not slowly decoding it note by note — has always been the weak link. My teacher is patient about most things, but not this. As he watches me struggle through a piece, grinding to a halt on every other note, he gets frustrated. He picks up a pencil and writes the note name above it. Then the next one. Then the one after that. By the end of a lesson the sheet is half covered in pencilled letters, which means I'm no longer reading music — I'm reading his handwriting. It leads nowhere.

I needed to get faster, and I wanted to do it on a real piano. Flashcard apps on a screen weren't the point — I needed my hands on the keys, building the connection between seeing a note and playing it without stopping to think. So I built something that hooks up to a MIDI keyboard and drills me on reading the grand staff the way it actually appears in piano music.

## What it does

The app shows a short batch of notes on a grand staff (treble and bass clef together, the way real piano music looks). You answer each one using the A–G keys on your keyboard, by clicking the on-screen buttons, or by playing the actual note on a MIDI keyboard. Answer correctly and it moves on immediately. Answer wrong and it highlights where the correct note was in amber, then moves on after a brief pause.

Notes are shown in a batch of 3–4 at a time so you can see upcoming notes in context, the way you would on a real score. Past notes fade to grey. Ledger-line notes appear more often because those are harder.

You can configure exactly which notes to drill — useful for targeting specific problem areas (for me, currently: ledger lines below the treble clef and anything in the bass that isn't near middle C). Lines can be commented out with `#` to temporarily skip them without losing your setup.

Accuracy is tracked as a rolling average over the last 20 answers so you can see how you're doing right now, not just historically. Streak is tracked separately because the two measure different things.

## Stack

Single HTML file, vanilla JavaScript. Uses [VexFlow](https://www.vexflow.com/) for rendering the musical notation. No build step.
