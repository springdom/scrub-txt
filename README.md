# scrub.txt

**Client-side data scrubber for safely using AI services.**

Paste your text → sensitive data gets replaced with realistic dummy values → copy into ChatGPT/Claude/any AI → paste the AI response back → get your real data restored.

**Nothing ever leaves your browser.** Zero backend, zero tracking, zero data collection.

![MIT License](https://img.shields.io/badge/license-MIT-green)

---

## Why?

Every time you paste text into an AI service, you risk exposing:

- Names, emails, phone numbers, addresses
- API keys, tokens, connection strings
- SSNs, credit card numbers, medical data
- Internal project names, proprietary code
- Anything else you wouldn't want in a training dataset

**scrub.txt** catches this data automatically and replaces it with realistic fakes — so the AI gives you a useful response without ever seeing your real information.

## How It Works

### 1. Scrub
Paste your text. The tool auto-detects sensitive data using pattern matching and replaces it with type-appropriate dummy values:

| Real Data | Replaced With |
|-----------|---------------|
| `matt@acme.com` | `user1@example.com` |
| `(415) 555-1234` | `(555) 000-0001` |
| `234-56-7890` | `000-00-0001` |
| `sk-proj-abc123...` | `sk-dummy-key-000...0001` |
| `192.168.1.42` | `10.0.0.1` |
| `postgres://admin:s3cret@...` | `postgres://user:pass@localhost:5432/dummy_db_1` |

### 2. Use AI
Copy the scrubbed text and paste it into any AI service. The AI processes your request using the dummy values.

### 3. Rehydrate
Paste the AI's response into the Rehydrate panel. All dummy values get swapped back to your originals. You get a fully personalized response — but the AI never saw your real data.

## Custom Rules

The auto-detection catches structured patterns (emails, phones, keys, etc.), but it can't know your name is "Matt" or your project is called "Falcon."

Click **⚙ Rules** to add custom words and phrases. These get replaced with realistic fake names:

- `Matt` → `James`
- `Matt Johnson` → `James Smith`
- `Project Falcon` → `David`
- `Acme Corp` → `Maria`

Custom rules support case-sensitive matching and word-boundary detection.

## Auto-Detection

Built-in pattern detection for:

**Personal Info:** Emails, US/international phone numbers, SSNs, dates of birth, passport numbers

**Financial:** Credit card numbers (with basic validation)

**Auth & Secrets:** API keys, AWS access keys, JWT tokens, URLs with auth parameters, database connection strings, private keys (PEM), environment variables with secrets

**Network:** IPv4/IPv6 addresses, MAC addresses

Each pattern can be toggled on/off individually.

## Getting Started

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/scrub-txt.git
cd scrub-txt

# Install
npm install

# Dev server
npm run dev

# Build for production
npm run build
```

The production build outputs to `dist/` — deploy anywhere that serves static files.

### Deploy

**Vercel** (recommended):
```bash
npm i -g vercel
vercel
```

**Netlify:**
```bash
npm run build
# drag dist/ folder to netlify.com/drop
```

**GitHub Pages:**
Add `base: '/scrub-txt/'` to `vite.config.js` and deploy the `dist/` folder.

## Architecture

```
src/
├── App.jsx              # Main UI component
├── main.jsx             # React entry point
├── index.css            # Global styles
└── lib/
    ├── patterns.js      # Detection regex patterns + metadata
    ├── generators.js    # Dummy data generators per type
    ├── engine.js        # Core scrub() and rehydrate() functions
    └── colors.js        # Tag color assignments
```

The engine is framework-agnostic — `scrub()` and `rehydrate()` are pure functions that take strings and return strings. You can use them in a CLI tool, browser extension, or any other context.

## Installable (PWA)

scrub.txt ships as a Progressive Web App. Visit the deployed site and click "Install" in your browser to use it offline as a standalone app.

## Roadmap

- [ ] **Browser extension** — intercept paste events directly in ChatGPT/Claude/etc.
- [ ] **Name dictionary** — auto-detect common first/last names without custom rules
- [ ] **Address detection** — heuristic patterns for US/international addresses
- [ ] **Local NER model** — run Named Entity Recognition in-browser via ONNX/Transformers.js
- [ ] **Bulk custom rules** — paste a list of terms to add all at once
- [ ] **Export/import rulesets** — share scrubbing profiles as JSON
- [ ] **Confidence indicators** — show why each item was flagged
- [ ] **File scrubbing** — drag & drop documents, not just text
- [ ] **Community pattern library** — user-contributed detection patterns

## Contributing

Contributions welcome! The easiest way to contribute:

1. **Add detection patterns** — edit `src/lib/patterns.js` to add new regex patterns
2. **Add generators** — edit `src/lib/generators.js` to add matching dummy data generators
3. **Report false positives/negatives** — open an issue with example text

## Privacy

This tool is designed around a single principle: **your data never leaves your browser.**

- All processing happens client-side in JavaScript
- No backend, no API calls, no analytics, no cookies
- The PWA works fully offline
- Source code is open for verification

## License

MIT — use it however you want.
