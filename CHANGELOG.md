# Changelog

All notable changes to scrub.txt will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.1.0] - 2025-02-10

### Added
- Initial release
- Dual-panel scrub interface with real-time detection
- 55+ detection patterns across 5 categories:
  - Personal Info (emails, phones, SSNs, DOB, passports)
  - Financial (credit cards)
  - Keys & Secrets (AWS, GCP, GitHub, Stripe, Slack, Discord, OpenAI, Anthropic, WireGuard, PGP/GPG, SSH, PEM, Age, Vault, Cloudflare, DigitalOcean, Kubernetes, Docker, Terraform, and more)
  - Auth & Config (JWTs, Bearer tokens, Basic Auth, connection strings, env vars, passwords)
  - Network (IPv4, IPv6, MAC addresses)
- Type-aware custom rules with 5 categories: Person, Company, Project, Location, Other
- Realistic dummy data replacement (not placeholder tags)
- Rehydration — paste AI response back to restore original data
- Color-coded output highlighting by data type
- Duplicate custom rule prevention with warning
- How to Use panel with step-by-step guide
- About panel with version info and repo link
- PWA support — installable, works fully offline
- 100% client-side — zero network calls, zero tracking, zero storage
- MIT licensed
