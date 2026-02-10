# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in scrub.txt, **please do not open a public issue.** Instead, report it privately so we can fix it before it's disclosed.

**Email:** opening an issue at https://github.com/springdom/scrub-txt/issues

Please include:
- A description of the vulnerability
- Steps to reproduce it
- The potential impact
- Any suggested fixes (optional but appreciated)

We will acknowledge your report within 48 hours and aim to release a fix within 7 days for critical issues.

## Scope

The following are in scope for security reports:

- **Pattern bypasses** — sensitive data formats that evade detection (e.g., a valid API key format that isn't caught)
- **Data leakage** — any scenario where user input could leave the browser
- **Rehydration errors** — mapping table issues that could expose original data in unexpected ways
- **XSS or injection** — if crafted input could execute code in the browser
- **Dependency vulnerabilities** — security issues in third-party packages

The following are out of scope:

- False positives (normal text being flagged) — these are bugs, not security issues, please open a regular issue
- Patterns that are disabled by default not catching data — they're opt-in by design
- Social engineering or phishing attacks unrelated to the codebase

## Security Design Principles

scrub.txt is designed with a zero-trust architecture:

- **No network calls.** The app makes zero outbound requests after initial page load. This is verifiable by inspecting the Network tab in browser DevTools.
- **No external dependencies in the engine.** The core scrubbing logic (`engine.js`, `patterns.js`, `generators.js`) has zero imports beyond each other.
- **No storage of sensitive data.** Nothing is written to localStorage, sessionStorage, cookies, or IndexedDB. All data exists only in memory and is gone when you close the tab.
- **No analytics or tracking.** No Google Analytics, no Mixpanel, no telemetry of any kind.
- **PWA for offline use.** The service worker caches only application files, never user data.

## Verifying These Claims

We encourage users to verify our security claims independently:

1. **Network tab** — open DevTools, paste sensitive data, confirm zero network requests
2. **Source audit** — grep the source for `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`
3. **Offline test** — enable airplane mode, confirm the app works fully
4. **CSP test** — add `connect-src 'none'` Content Security Policy, confirm the app still functions

See our [Technical Explainer](docs/technical-explainer.md) for detailed verification steps.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅        |

## Recognition

We're happy to credit security researchers who responsibly disclose vulnerabilities. Let us know if you'd like to be listed in our acknowledgments.
