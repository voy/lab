# Shopping List

A shareable real-time shopping list PWA. No accounts, no login — a secret link is your identity and edit access.

## How it works

Creating a list generates a unique URL. Anyone with that URL can add items, check them off, and see changes in real time. Old lists fade out automatically instead of accumulating.

## Stack

- **Svelte + Vite** — frontend
- **Firestore** — database with real-time sync
- **Firebase Hosting** — serves the PWA

## Access control

Security lives in Firestore rules — a token embedded in the URL must match the document path on every read and write. The Firebase API key in the frontend code is intentionally public; it identifies the project but grants nothing on its own.

## Dev

```sh
npm install
npm run dev
```

## Deploy

```sh
npm run build && firebase deploy
```
