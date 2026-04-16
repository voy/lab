# grand-staff-quiz

A self-made drill for reading notes on the grand staff faster.

## The backstory

I've been playing piano for a few years, but reading sheet music — actually reading it, not slowly decoding it note by note — has always been the weak link. My teacher is patient about most things, but not this. As he watches me struggle through a piece, grinding to a halt on every other note, he gets frustrated. He picks up a pencil and writes the note name above it. Then the next one. Then the one after that. By the end of a lesson the sheet is half covered in pencilled letters, which means I'm no longer reading music — I'm reading his handwriting. It leads nowhere.

I needed to get faster, and I wanted to do it on a real piano. Flashcard apps on a screen weren't the point — I needed my hands on the keys, building the connection between seeing a note and playing it without stopping to think. So I built something that hooks up to a MIDI keyboard and drills me on reading the grand staff the way it actually appears in piano music.

## What it does

Shows a grand staff (treble and bass clef together, the way piano music actually looks) with notes to identify — by keyboard, by tapping the on-screen buttons on mobile, or by playing them on a MIDI keyboard. What gets drilled and how much appears at a time is configurable. Open it and poke around.

## Setting up MIDI on macOS

**Wired keyboard:** plug in via USB — Chrome picks it up automatically when you click Connect MIDI in settings.

**Bluetooth keyboard:** macOS requires one manual step before the browser can see it.

1. Open **Audio MIDI Setup** (Spotlight → "Audio MIDI Setup", or `/Applications/Utilities/`)
2. Open the MIDI Studio window: **Window → Show MIDI Studio** (⌘2)
3. Click the **Bluetooth** button in the toolbar (the Bluetooth icon, top centre)
4. Your keyboard should appear in the list — click **Connect**
5. Once connected here it shows up as a regular MIDI device in Chrome
6. Back in the quiz, open Settings, click **Connect MIDI**, then play a note to confirm

The connection persists across browser sessions as long as Bluetooth stays paired in Audio MIDI Setup. If it drops, re-open Audio MIDI Setup and reconnect — you don't need to touch the quiz.

**Browser:** the Web MIDI API is supported in Chrome and Edge. Safari and Firefox don't support it.

## Stack

Single HTML file, vanilla JavaScript. Uses [VexFlow](https://www.vexflow.com/) for rendering the musical notation. No build step.
