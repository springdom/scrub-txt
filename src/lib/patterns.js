/**
 * Built-in detection patterns for scrub.txt
 *
 * Each pattern has:
 *   id       — unique key
 *   label    — display name in UI
 *   enabled  — default on/off state
 *   regex    — detection regex (must have global flag)
 *   tag      — category tag for generator lookup
 *   group    — UI grouping
 *   validate — optional post-match validation function
 */

export const PATTERNS = [
  // ══════════════════════════════════════
  // ── Personal Info ──
  // ══════════════════════════════════════
  {
    id: 'email',
    label: 'Emails',
    enabled: true,
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    tag: 'EMAIL',
    group: 'Personal Info',
  },
  {
    id: 'phone_us',
    label: 'Phone (US)',
    enabled: true,
    regex: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    tag: 'PHONE',
    group: 'Personal Info',
  },
  {
    id: 'phone_intl',
    label: 'Phone (Intl)',
    enabled: true,
    regex: /\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
    tag: 'PHONE',
    group: 'Personal Info',
  },
  {
    id: 'ssn',
    label: 'SSN',
    enabled: true,
    regex: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
    tag: 'SSN',
    group: 'Personal Info',
    validate: (match) => {
      const digits = match.replace(/\D/g, '');
      if (digits.length !== 9) return false;
      if (digits.startsWith('000') || digits.startsWith('666') || digits.startsWith('9')) return false;
      return true;
    },
  },
  {
    id: 'date_of_birth',
    label: 'Dates (DOB)',
    enabled: false,
    regex: /\b(?:0[1-9]|1[0-2])[\/\-](?:0[1-9]|[12]\d|3[01])[\/\-](?:19|20)\d{2}\b/g,
    tag: 'DATE',
    group: 'Personal Info',
  },
  {
    id: 'passport',
    label: 'Passport #',
    enabled: false,
    regex: /\b[A-Z]{1,2}\d{6,9}\b/g,
    tag: 'PASSPORT',
    group: 'Personal Info',
  },

  // ══════════════════════════════════════
  // ── Financial ──
  // ══════════════════════════════════════
  {
    id: 'credit_card',
    label: 'Credit Cards',
    enabled: true,
    regex: /\b(?:\d[ -]*?){13,19}\b/g,
    tag: 'CARD',
    group: 'Financial',
    validate: (match) => {
      const digits = match.replace(/\D/g, '');
      if (digits.length < 13 || digits.length > 19) return false;
      // Luhn algorithm
      let sum = 0;
      let alt = false;
      for (let i = digits.length - 1; i >= 0; i--) {
        let n = parseInt(digits[i], 10);
        if (alt) { n *= 2; if (n > 9) n -= 9; }
        sum += n;
        alt = !alt;
      }
      return sum % 10 === 0;
    },
  },

  // ══════════════════════════════════════
  // ── Keys & Secrets ──
  // ══════════════════════════════════════

  // -- PEM Encoded Keys --
  {
    id: 'private_key_pem',
    label: 'Private Keys (PEM)',
    enabled: true,
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/g,
    tag: 'PRIVATE_KEY',
    group: 'Keys & Secrets',
  },
  {
    id: 'public_key_pem',
    label: 'Public Keys (PEM)',
    enabled: true,
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PUBLIC KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH )?PUBLIC KEY-----/g,
    tag: 'PUBLIC_KEY',
    group: 'Keys & Secrets',
  },
  {
    id: 'certificate_pem',
    label: 'Certificates (PEM)',
    enabled: true,
    regex: /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g,
    tag: 'CERTIFICATE',
    group: 'Keys & Secrets',
  },

  // -- SSH Keys --
  {
    id: 'ssh_public',
    label: 'SSH Public Keys',
    enabled: true,
    regex: /(?:ssh-rsa|ssh-ed25519|ssh-dss|ecdsa-sha2-nistp(?:256|384|521))\s+[A-Za-z0-9+\/=]{40,}(?:\s+\S+)?/g,
    tag: 'SSH_PUB',
    group: 'Keys & Secrets',
  },

  // -- WireGuard --
  {
    id: 'wireguard_key',
    label: 'WireGuard Keys',
    enabled: true,
    regex: /(?:PrivateKey|PublicKey|PresharedKey)\s*=\s*[A-Za-z0-9+\/]{42,44}={0,2}/g,
    tag: 'WG_KEY',
    group: 'Keys & Secrets',
  },
  {
    id: 'wireguard_config',
    label: 'WireGuard Endpoints',
    enabled: true,
    regex: /Endpoint\s*=\s*[^\s]+:\d+/g,
    tag: 'WG_ENDPOINT',
    group: 'Keys & Secrets',
  },

  // -- PGP / GPG --
  {
    id: 'pgp_private',
    label: 'PGP Private Keys',
    enabled: true,
    regex: /-----BEGIN PGP PRIVATE KEY BLOCK-----[\s\S]*?-----END PGP PRIVATE KEY BLOCK-----/g,
    tag: 'PRIVATE_KEY',
    group: 'Keys & Secrets',
  },
  {
    id: 'pgp_public',
    label: 'PGP Public Keys',
    enabled: true,
    regex: /-----BEGIN PGP PUBLIC KEY BLOCK-----[\s\S]*?-----END PGP PUBLIC KEY BLOCK-----/g,
    tag: 'PUBLIC_KEY',
    group: 'Keys & Secrets',
  },
  {
    id: 'pgp_message',
    label: 'PGP Messages',
    enabled: true,
    regex: /-----BEGIN PGP MESSAGE-----[\s\S]*?-----END PGP MESSAGE-----/g,
    tag: 'PGP_MSG',
    group: 'Keys & Secrets',
  },

  // -- Age Encryption --
  {
    id: 'age_secret_key',
    label: 'Age Secret Keys',
    enabled: true,
    regex: /AGE-SECRET-KEY-1[A-Z0-9]{58}/g,
    tag: 'AGE_KEY',
    group: 'Keys & Secrets',
  },

  // -- Hashicorp Vault --
  {
    id: 'vault_token',
    label: 'Vault Tokens',
    enabled: true,
    regex: /hv[sb]\.[A-Za-z0-9]{24,}/g,
    tag: 'VAULT_TOKEN',
    group: 'Keys & Secrets',
  },

  // -- Cloudflare --
  {
    id: 'cloudflare_token',
    label: 'Cloudflare Tokens',
    enabled: true,
    regex: /(?:cf_|v1\.0-)[A-Za-z0-9\-_]{30,}/g,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },

  // -- DigitalOcean --
  {
    id: 'digitalocean_token',
    label: 'DigitalOcean Tokens',
    enabled: true,
    regex: /dop_v1_[a-f0-9]{64}/g,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },

  // -- Doppler --
  {
    id: 'doppler_token',
    label: 'Doppler Tokens',
    enabled: true,
    regex: /dp\.(?:st|sa|ct)\.[A-Za-z0-9_\-]{40,}/g,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },

  // -- Kubernetes --
  {
    id: 'k8s_cert_data',
    label: 'K8s Certificate Data',
    enabled: true,
    regex: /(?:certificate-authority-data|client-certificate-data|client-key-data):\s*[A-Za-z0-9+\/=]{40,}/g,
    tag: 'K8S_SECRET',
    group: 'Keys & Secrets',
  },
  {
    id: 'k8s_token',
    label: 'K8s Tokens',
    enabled: true,
    regex: /(?:token:\s*)[A-Za-z0-9\-_.]{50,}/g,
    tag: 'K8S_SECRET',
    group: 'Keys & Secrets',
  },

  // -- Docker Registry Auth --
  {
    id: 'docker_auth',
    label: 'Docker Auth',
    enabled: true,
    regex: /"auth":\s*"[A-Za-z0-9+\/=]{20,}"/g,
    tag: 'DOCKER_AUTH',
    group: 'Keys & Secrets',
  },

  // -- Terraform --
  {
    id: 'terraform_token',
    label: 'Terraform Tokens',
    enabled: true,
    regex: /(?:credentials\s+"[^"]+"\s*\{\s*token\s*=\s*"[^"]+"|TFE_TOKEN|ATLAS_TOKEN)[\s=]*[A-Za-z0-9\.\-_]{14,}/g,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },

  // -- AWS --
  {
    id: 'aws_access_key',
    label: 'AWS Access Keys',
    enabled: true,
    regex: /(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/g,
    tag: 'AWS_KEY',
    group: 'Keys & Secrets',
  },
  {
    id: 'aws_secret_key',
    label: 'AWS Secret Keys',
    enabled: true,
    regex: /(?:aws_secret_access_key|aws_secret_key|AWS_SECRET_ACCESS_KEY)[\s]*[=:]\s*[A-Za-z0-9\/+=]{40}/g,
    tag: 'AWS_SECRET',
    group: 'Keys & Secrets',
  },

  // -- Google / GCP --
  {
    id: 'gcp_api_key',
    label: 'Google API Keys',
    enabled: true,
    regex: /AIza[0-9A-Za-z\-_]{35}/g,
    tag: 'GCP_KEY',
    group: 'Keys & Secrets',
  },
  {
    id: 'gcp_service_account',
    label: 'GCP Service Account',
    enabled: true,
    regex: /"private_key":\s*"-----BEGIN[^"]*-----END[^"]*"/g,
    tag: 'PRIVATE_KEY',
    group: 'Keys & Secrets',
  },
  {
    id: 'gcp_oauth',
    label: 'Google OAuth Secret',
    enabled: true,
    regex: /GOCSPX-[A-Za-z0-9\-_]{28}/g,
    tag: 'OAUTH_SECRET',
    group: 'Keys & Secrets',
  },

  // -- OpenAI / Anthropic --
  {
    id: 'openai_key',
    label: 'OpenAI Keys',
    enabled: true,
    regex: /sk-(?:proj-)?[A-Za-z0-9\-_]{20,}/g,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },
  {
    id: 'anthropic_key',
    label: 'Anthropic Keys',
    enabled: true,
    regex: /sk-ant-[A-Za-z0-9\-_]{20,}/g,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },

  // -- GitHub --
  {
    id: 'github_pat',
    label: 'GitHub PAT',
    enabled: true,
    regex: /ghp_[A-Za-z0-9]{36}/g,
    tag: 'GITHUB_TOKEN',
    group: 'Keys & Secrets',
  },
  {
    id: 'github_oauth',
    label: 'GitHub OAuth',
    enabled: true,
    regex: /gho_[A-Za-z0-9]{36}/g,
    tag: 'GITHUB_TOKEN',
    group: 'Keys & Secrets',
  },
  {
    id: 'github_app_token',
    label: 'GitHub App Tokens',
    enabled: true,
    regex: /(?:ghu|ghs|ghr)_[A-Za-z0-9]{36}/g,
    tag: 'GITHUB_TOKEN',
    group: 'Keys & Secrets',
  },
  {
    id: 'github_fine_grained',
    label: 'GitHub Fine-Grained',
    enabled: true,
    regex: /github_pat_[A-Za-z0-9_]{22,}/g,
    tag: 'GITHUB_TOKEN',
    group: 'Keys & Secrets',
  },

  // -- Stripe --
  {
    id: 'stripe_secret',
    label: 'Stripe Secret',
    enabled: true,
    regex: /(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{20,}/g,
    tag: 'STRIPE_KEY',
    group: 'Keys & Secrets',
  },
  {
    id: 'stripe_publishable',
    label: 'Stripe Publishable',
    enabled: true,
    regex: /pk_(?:live|test)_[A-Za-z0-9]{20,}/g,
    tag: 'STRIPE_KEY',
    group: 'Keys & Secrets',
  },

  // -- Slack --
  {
    id: 'slack_token',
    label: 'Slack Tokens',
    enabled: true,
    regex: /xox[bpras]-[A-Za-z0-9\-]{10,}/g,
    tag: 'SLACK_TOKEN',
    group: 'Keys & Secrets',
  },
  {
    id: 'slack_webhook',
    label: 'Slack Webhooks',
    enabled: true,
    regex: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]{8,}\/B[A-Z0-9]{8,}\/[A-Za-z0-9]{20,}/g,
    tag: 'WEBHOOK',
    group: 'Keys & Secrets',
  },

  // -- Discord --
  {
    id: 'discord_token',
    label: 'Discord Tokens',
    enabled: true,
    regex: /(?:mfa\.[A-Za-z0-9\-_]{80,}|[MN][A-Za-z0-9]{23,}\.[A-Za-z0-9\-_]{6}\.[A-Za-z0-9\-_]{27,})/g,
    tag: 'DISCORD_TOKEN',
    group: 'Keys & Secrets',
  },
  {
    id: 'discord_webhook',
    label: 'Discord Webhooks',
    enabled: true,
    regex: /https:\/\/(?:discord|discordapp)\.com\/api\/webhooks\/\d{17,}\/[A-Za-z0-9\-_]{60,}/g,
    tag: 'WEBHOOK',
    group: 'Keys & Secrets',
  },

  // -- Twilio --
  {
    id: 'twilio_sid',
    label: 'Twilio SID',
    enabled: true,
    regex: /(?:AC|SK)[a-f0-9]{32}/g,
    tag: 'TWILIO_KEY',
    group: 'Keys & Secrets',
  },

  // -- SendGrid --
  {
    id: 'sendgrid_key',
    label: 'SendGrid Keys',
    enabled: true,
    regex: /SG\.[A-Za-z0-9\-_]{22}\.[A-Za-z0-9\-_]{43}/g,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },

  // -- Mailgun --
  {
    id: 'mailgun_key',
    label: 'Mailgun Keys',
    enabled: true,
    regex: /key-[A-Za-z0-9]{32}/g,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },

  // -- Firebase --
  {
    id: 'firebase_key',
    label: 'Firebase Keys',
    enabled: true,
    regex: /AAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}/g,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },

  // -- NPM --
  {
    id: 'npm_token',
    label: 'NPM Tokens',
    enabled: true,
    regex: /npm_[A-Za-z0-9]{36}/g,
    tag: 'NPM_TOKEN',
    group: 'Keys & Secrets',
  },

  // -- PyPI --
  {
    id: 'pypi_token',
    label: 'PyPI Tokens',
    enabled: true,
    regex: /pypi-[A-Za-z0-9\-_]{50,}/g,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },

  // -- Vercel --
  {
    id: 'vercel_token',
    label: 'Vercel Tokens',
    enabled: true,
    regex: /(?:vercel_|vc_prod_|vc_)[A-Za-z0-9]{20,}/g,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },

  // -- Supabase --
  {
    id: 'supabase_key',
    label: 'Supabase Keys',
    enabled: true,
    regex: /sbp_[a-f0-9]{40}/g,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },

  // -- Shopify --
  {
    id: 'shopify_token',
    label: 'Shopify Tokens',
    enabled: true,
    regex: /shp(?:at|ca|pa|ss)_[a-fA-F0-9]{32}/g,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },

  // -- Azure --
  {
    id: 'azure_key',
    label: 'Azure Keys',
    enabled: true,
    regex: /(?:AccountKey|SharedAccessKey)=[A-Za-z0-9+\/=]{40,}/g,
    tag: 'AZURE_KEY',
    group: 'Keys & Secrets',
  },

  // -- Datadog --
  {
    id: 'datadog_key',
    label: 'Datadog Keys',
    enabled: true,
    regex: /(?:dd-api-key|DD_API_KEY|datadog_api_key)[\s]*[=:]\s*[a-f0-9]{32}/gi,
    tag: 'API_KEY',
    group: 'Keys & Secrets',
  },

  // ══════════════════════════════════════
  // ── Auth & Config ──
  // ══════════════════════════════════════
  {
    id: 'jwt',
    label: 'JWT Tokens',
    enabled: true,
    regex: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
    tag: 'JWT',
    group: 'Auth & Config',
  },
  {
    id: 'bearer_token',
    label: 'Bearer Tokens',
    enabled: true,
    regex: /Bearer\s+[A-Za-z0-9\-_\.]{20,}/g,
    tag: 'BEARER',
    group: 'Auth & Config',
  },
  {
    id: 'basic_auth',
    label: 'Basic Auth',
    enabled: true,
    regex: /Basic\s+[A-Za-z0-9+\/=]{10,}/g,
    tag: 'BASIC_AUTH',
    group: 'Auth & Config',
  },
  {
    id: 'url_auth',
    label: 'Auth URLs',
    enabled: true,
    regex: /https?:\/\/[^\s]*[?&](?:token|key|api_key|secret|password|auth|access_token)=[^\s&]*/gi,
    tag: 'AUTH_URL',
    group: 'Auth & Config',
  },
  {
    id: 'conn_string',
    label: 'Connection Strings',
    enabled: true,
    regex: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis|amqp|mssql):\/\/[^\s]+/gi,
    tag: 'CONN_STRING',
    group: 'Auth & Config',
  },
  {
    id: 'env_var',
    label: 'Env Variables',
    enabled: true,
    regex: /(?:^|\s)(?:export\s+)?[A-Z_]{2,}(?:_KEY|_SECRET|_TOKEN|_PASSWORD|_PASS|_API|_AUTH|_CREDENTIAL)=[^\s]+/gm,
    tag: 'ENV_VAR',
    group: 'Auth & Config',
  },
  {
    id: 'password_field',
    label: 'Passwords',
    enabled: true,
    regex: /(?:password|passwd|pwd)[\s]*[=:]\s*["']?[^\s"',]{6,}["']?/gi,
    tag: 'PASSWORD',
    group: 'Auth & Config',
  },
  {
    id: 'generic_secret',
    label: 'Generic Secrets',
    enabled: false,
    regex: /(?:secret|private|credential)[\s]*[=:]\s*["']?[A-Za-z0-9\-_\/+=]{16,}["']?/gi,
    tag: 'SECRET',
    group: 'Auth & Config',
  },
  {
    id: 'high_entropy',
    label: 'High-Entropy Strings',
    enabled: false,
    regex: /[A-Za-z0-9\-_]{40,}/g,
    tag: 'ENTROPY',
    group: 'Auth & Config',
    validate: (match) => {
      const chars = new Set(match.split(''));
      const ratio = chars.size / match.length;
      const hasUpper = /[A-Z]/.test(match);
      const hasLower = /[a-z]/.test(match);
      const hasDigit = /[0-9]/.test(match);
      return ratio > 0.4 && hasUpper && hasLower && hasDigit;
    },
  },

  // ══════════════════════════════════════
  // ── Network ──
  // ══════════════════════════════════════
  {
    id: 'ipv4',
    label: 'IPv4',
    enabled: true,
    regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    tag: 'IP',
    group: 'Network',
  },
  {
    id: 'ipv6',
    label: 'IPv6',
    enabled: false,
    regex: /(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/g,
    tag: 'IP',
    group: 'Network',
  },
  {
    id: 'mac_addr',
    label: 'MAC Addresses',
    enabled: false,
    regex: /\b[0-9A-Fa-f]{2}(?:[:-][0-9A-Fa-f]{2}){5}\b/g,
    tag: 'MAC',
    group: 'Network',
  },

  // ══════════════════════════════════════
  // ── Identifiers ──
  // ══════════════════════════════════════
  {
    id: 'uuid',
    label: 'UUID / GUID',
    enabled: false,
    regex: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b/g,
    tag: 'UUID',
    group: 'Identifiers',
  },

  // ══════════════════════════════════════
  // ── Crypto ──
  // ══════════════════════════════════════
  {
    id: 'btc_address',
    label: 'Bitcoin (BTC)',
    enabled: false,
    regex: /\b(?:1[1-9A-HJ-NP-Za-km-z]{25,34}|3[1-9A-HJ-NP-Za-km-z]{25,34}|bc1[0-9a-z]{39,59})\b/g,
    tag: 'BTC',
    group: 'Crypto',
  },
  {
    id: 'eth_address',
    label: 'Ethereum (ETH)',
    enabled: false,
    regex: /\b0x[0-9a-fA-F]{40}\b/g,
    tag: 'ETH',
    group: 'Crypto',
  },

  // ══════════════════════════════════════
  // ── Banking ──
  // ══════════════════════════════════════
  {
    id: 'iban',
    label: 'IBAN',
    enabled: false,
    regex: /\b[A-Z]{2}\d{2}[\s]?[\dA-Z]{4}[\s]?(?:[\dA-Z]{4}[\s]?){1,7}[\dA-Z]{1,4}\b/g,
    tag: 'IBAN',
    group: 'Banking',
    validate: (match) => {
      const cleaned = match.replace(/\s/g, '');
      return cleaned.length >= 15 && cleaned.length <= 34;
    },
  },
];

/**
 * Get unique group names in display order
 */
export function getGroups() {
  const seen = new Set();
  const groups = [];
  for (const p of PATTERNS) {
    if (!seen.has(p.group)) {
      seen.add(p.group);
      groups.push(p.group);
    }
  }
  return groups;
}
