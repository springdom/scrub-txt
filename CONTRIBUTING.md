# Contributing to scrub.txt

Thanks for your interest in contributing to scrub.txt! This project is built to help people safely use AI services without leaking sensitive data, and every contribution makes it better for everyone.

## Quick Start

```bash
git clone https://github.com/springdom/scrub-txt.git
cd scrub-txt
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Changes hot-reload instantly.

## Ways to Contribute

### 1. Add a Detection Pattern (Easiest)

This is the single best way to contribute. If you know the format of an API key, token, or secret that we don't currently detect, you can add it in minutes.

**Where:** `src/lib/patterns.js`

Every pattern is an object with this structure:

```js
{
  id: 'service_key',           // unique snake_case id
  label: 'Service Name Keys',  // what shows in the Rules panel
  enabled: true,               // on by default? (use false for high false-positive patterns)
  regex: /pattern-here/g,      // must have the global flag
  tag: 'API_KEY',              // which generator to use (see below)
  group: 'Keys & Secrets',     // UI grouping
}
```

**Available tags** (each produces different fake data):
- `API_KEY` — generic key replacement
- `PRIVATE_KEY` — PEM private key block
- `PUBLIC_KEY` — PEM public key block
- `CERTIFICATE` — PEM certificate block
- `SSH_PUB` — SSH public key
- `WG_KEY` — WireGuard key
- `JWT` — JSON Web Token
- `WEBHOOK` — webhook URL
- `BEARER` — Bearer token
- `PASSWORD` — password assignment
- `ENV_VAR` — environment variable
- `CONN_STRING` — database connection string

If none of these fit, you can add a new tag — just also add a matching generator in `src/lib/generators.js` and a color in `src/lib/colors.js`.

**Testing your pattern:**

1. Add the pattern to `patterns.js`
2. Run `npm run dev`
3. Paste a sample of the key/token format into the input
4. Verify it gets detected and replaced with sensible fake data
5. Test edge cases — make sure it doesn't false-positive on normal text

### 2. Report a Bug

Open an issue with:
- What you expected to happen
- What actually happened
- A sample input that reproduces the issue (scrub any real sensitive data first!)
- Browser and OS

### 3. Request a Pattern

If you know a key format that should be detected but you're not comfortable writing regex, open an issue with:
- The service name
- A description or example of the key format (use fake/expired keys only)
- Any documentation links about the format

### 4. Improve the UI

The entire UI is in `src/App.jsx`. If you're making visual changes, include a screenshot in your PR.

### 5. Improve the Engine

The core logic is in `src/lib/engine.js`. The `scrub()` and `rehydrate()` functions are pure — they take data in and return data out with no side effects. Please keep it that way.

## Project Structure

```
src/
├── App.jsx              # All UI code (single component)
├── main.jsx             # React entry point
├── index.css            # Global styles
└── lib/
    ├── patterns.js      # Detection patterns (regex + metadata)
    ├── generators.js    # Fake data factories per tag type
    ├── engine.js        # scrub() and rehydrate() core functions
    └── colors.js        # Color assignments for UI highlighting
```

## Pull Request Guidelines

- Keep PRs focused — one pattern, one bug fix, or one feature per PR
- Run `npm run build` before submitting to make sure nothing breaks
- If adding a pattern, include a test case in the PR description showing what it catches
- Don't introduce external dependencies without discussion first — the project is intentionally dependency-light

## Code Style

- No linter configured yet — just match the existing style
- 2-space indentation
- Single quotes for strings
- Trailing commas in arrays and objects

## Important Principles

- **Everything stays client-side.** No network calls, no analytics, no tracking. This is non-negotiable.
- **No external dependencies in the engine.** `patterns.js`, `generators.js`, and `engine.js` must remain framework-agnostic with zero imports beyond each other.
- **False positives are worse than false negatives.** A pattern that flags normal text is more harmful than missing an obscure key format. When in doubt, set `enabled: false` as the default.
- **Realistic fake data over placeholder tags.** We use `user1@example.com` not `[EMAIL_1]`. This keeps AI responses useful.

## Questions?

Open a Discussion on GitHub or file an issue. We're happy to help you get started.
