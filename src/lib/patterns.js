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
  // ── Personal Info ──
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

  // ── Financial ──
  {
    id: 'credit_card',
    label: 'Credit Cards',
    enabled: true,
    regex: /\b(?:\d[ -]*?){13,19}\b/g,
    tag: 'CARD',
    group: 'Financial',
    validate: (match) => {
      const digits = match.replace(/\D/g, '');
      return digits.length >= 13 && digits.length <= 19;
    },
  },

  // ── Auth & Secrets ──
  {
    id: 'api_key',
    label: 'API Keys',
    enabled: true,
    regex: /(?:sk|pk|api|key|token|secret|bearer|auth)[-_]?[a-zA-Z0-9\-_]{20,}/gi,
    tag: 'API_KEY',
    group: 'Auth & Secrets',
  },
  {
    id: 'aws_key',
    label: 'AWS Keys',
    enabled: true,
    regex: /(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/g,
    tag: 'AWS_KEY',
    group: 'Auth & Secrets',
  },
  {
    id: 'jwt',
    label: 'JWT Tokens',
    enabled: true,
    regex: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
    tag: 'JWT',
    group: 'Auth & Secrets',
  },
  {
    id: 'url_auth',
    label: 'Auth URLs',
    enabled: true,
    regex: /https?:\/\/[^\s]*[?&](?:token|key|api_key|secret|password|auth)=[^\s&]*/gi,
    tag: 'AUTH_URL',
    group: 'Auth & Secrets',
  },
  {
    id: 'conn_string',
    label: 'Connection Strings',
    enabled: true,
    regex: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis|amqp):\/\/[^\s]+/gi,
    tag: 'CONN_STRING',
    group: 'Auth & Secrets',
  },
  {
    id: 'private_key',
    label: 'Private Keys',
    enabled: true,
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    tag: 'PRIVATE_KEY',
    group: 'Auth & Secrets',
  },
  {
    id: 'env_var',
    label: 'Env Variables',
    enabled: true,
    regex: /(?:^|\s)(?:export\s+)?[A-Z_]{2,}(?:_KEY|_SECRET|_TOKEN|_PASSWORD|_PASS|_API|_AUTH|_CREDENTIAL)=[^\s]+/gm,
    tag: 'ENV_VAR',
    group: 'Auth & Secrets',
  },

  // ── Network ──
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
