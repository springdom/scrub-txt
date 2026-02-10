/**
 * Fake data generators for scrub.txt
 *
 * Each generator produces realistic-looking dummy data that:
 *   - Is syntactically valid for its type
 *   - Won't be mistaken for real data (uses reserved ranges, test values, etc.)
 *   - Increments so repeated calls produce unique values
 *   - Resets between scrub runs for deterministic output
 */

const FAKE_FIRST = [
  'James', 'Maria', 'David', 'Sarah', 'Michael', 'Emma', 'Robert', 'Lisa',
  'Daniel', 'Anna', 'Thomas', 'Laura', 'William', 'Jennifer', 'Richard', 'Emily',
  'Joseph', 'Rachel', 'Charles', 'Karen',
];

const FAKE_LAST = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Thompson', 'White', 'Harris',
];

const EMAIL_DOMAINS = ['example.com', 'sample.org', 'test.net', 'demo.io', 'placeholder.dev'];
const TEST_CARDS = ['4111 1111 1111 1111', '4242 4242 4242 4242', '5500 0000 0000 0004', '3782 822463 10005'];
const DB_TYPES = ['postgres', 'mongodb', 'mysql', 'redis'];
const FAKE_DATES = ['01/01/1990', '06/15/1985', '03/22/1992', '11/08/1988', '07/04/1995'];

/**
 * Create a fresh set of generators with counters starting at 0.
 * Call this at the start of each scrub run.
 */
export function createGenerators() {
  const counters = {};
  const c = (tag) => {
    counters[tag] = (counters[tag] || 0) + 1;
    return counters[tag];
  };
  const pad = (n, len = 4) => String(n).padStart(len, '0');
  const hex = (n) => n.toString(16).padStart(2, '0');

  return {
    EMAIL: () => {
      const i = c('EMAIL');
      return `user${i}@${EMAIL_DOMAINS[(i - 1) % EMAIL_DOMAINS.length]}`;
    },

    PHONE: () => {
      const i = c('PHONE');
      return `(555) 000-${pad(i)}`;
    },

    SSN: () => {
      const i = c('SSN');
      return `000-00-${pad(i)}`;
    },

    CARD: () => {
      const i = c('CARD');
      return TEST_CARDS[(i - 1) % TEST_CARDS.length];
    },

    IP: () => {
      const i = c('IP');
      return `10.0.${Math.floor(i / 255)}.${(i % 255) + 1}`;
    },

    API_KEY: () => {
      const i = c('API_KEY');
      return `sk-dummy-key-${'0'.repeat(20)}${pad(i)}`;
    },

    AWS_KEY: () => {
      const i = c('AWS_KEY');
      return `AKIADUMMY${'X'.repeat(12)}${pad(i)}`;
    },

    JWT: () => {
      const i = c('JWT');
      return `eyJhbGciOiJIUzI1NiJ9.eyJkdW1teSI6InRlc3QiLCJpZCI6JHtpfX0.${'x'.repeat(20)}${pad(i, 2)}`;
    },

    AUTH_URL: () => {
      const i = c('AUTH_URL');
      return `https://api.example.com/v1/data?token=dummy_token_${pad(i)}`;
    },

    CONN_STRING: () => {
      const i = c('CONN_STRING');
      return `${DB_TYPES[(i - 1) % DB_TYPES.length]}://user:pass@localhost:5432/dummy_db_${i}`;
    },

    PRIVATE_KEY: () => {
      return '-----BEGIN PRIVATE KEY-----\nDUMMY_KEY_PLACEHOLDER_DATA\n-----END PRIVATE KEY-----';
    },

    ENV_VAR: (original) => {
      const i = c('ENV_VAR');
      const eqIdx = original.indexOf('=');
      if (eqIdx > -1) {
        return original.slice(0, eqIdx + 1) + `dummy_value_${i}`;
      }
      return `DUMMY_SECRET=dummy_value_${i}`;
    },

    MAC: () => {
      const i = c('MAC');
      return `00:00:00:${hex(Math.floor(i / 65536) % 256)}:${hex(Math.floor(i / 256) % 256)}:${hex(i % 256)}`;
    },

    DATE: () => {
      const i = c('DATE');
      return FAKE_DATES[(i - 1) % FAKE_DATES.length];
    },

    PASSPORT: () => {
      const i = c('PASSPORT');
      return `X${pad(i, 8)}`;
    },

    PUBLIC_KEY: () => {
      return '-----BEGIN PUBLIC KEY-----\nDUMMY_PUBLIC_KEY_PLACEHOLDER_DATA\n-----END PUBLIC KEY-----';
    },

    CERTIFICATE: () => {
      return '-----BEGIN CERTIFICATE-----\nDUMMY_CERTIFICATE_PLACEHOLDER_DATA\n-----END CERTIFICATE-----';
    },

    SSH_PUB: () => {
      const i = c('SSH_PUB');
      return `ssh-ed25519 AAAA${'C3NzaC1lZDI1NTE5AAAAI'.padEnd(44, 'A')}dummy${pad(i)} user@dummy-host`;
    },

    AWS_SECRET: () => {
      const i = c('AWS_SECRET');
      return `aws_secret_access_key=${'A'.repeat(36)}${pad(i)}`;
    },

    AWS_TOKEN: () => {
      const i = c('AWS_TOKEN');
      return `aws_session_token=${'DummySessionToken'.padEnd(100, 'X')}${pad(i)}`;
    },

    GCP_KEY: () => {
      const i = c('GCP_KEY');
      return `AIzaDummy${'X'.repeat(26)}${pad(i)}`;
    },

    OAUTH_SECRET: () => {
      const i = c('OAUTH_SECRET');
      return `GOCSPX-DummyOAuthSecret${pad(i, 4)}`;
    },

    GITHUB_TOKEN: () => {
      const i = c('GITHUB_TOKEN');
      return `ghp_${'0'.repeat(32)}${pad(i)}`;
    },

    STRIPE_KEY: () => {
      const i = c('STRIPE_KEY');
      return `sk_test_${'0'.repeat(20)}${pad(i)}`;
    },

    SLACK_TOKEN: () => {
      const i = c('SLACK_TOKEN');
      return `xoxb-dummy-token-${pad(i)}`;
    },

    DISCORD_TOKEN: () => {
      const i = c('DISCORD_TOKEN');
      return `MTAwMDAwMDAwMDAwMDAwMDAw.DUMMY.${'-'.repeat(20)}${pad(i)}`;
    },

    WEBHOOK: () => {
      const i = c('WEBHOOK');
      return `https://hooks.example.com/dummy/webhook/${pad(i)}`;
    },

    TWILIO_KEY: () => {
      const i = c('TWILIO_KEY');
      return `AC${'0'.repeat(28)}${pad(i)}`;
    },

    NPM_TOKEN: () => {
      const i = c('NPM_TOKEN');
      return `npm_${'0'.repeat(32)}${pad(i)}`;
    },

    UUID_KEY: () => {
      const i = c('UUID_KEY');
      return `00000000-0000-0000-0000-${pad(i, 12)}`;
    },

    AZURE_KEY: () => {
      const i = c('AZURE_KEY');
      return `AccountKey=${'DummyAzureKey0000'.padEnd(44, '=')}${pad(i)}`;
    },

    BEARER: () => {
      const i = c('BEARER');
      return `Bearer dummy_bearer_${'0'.repeat(20)}${pad(i)}`;
    },

    BASIC_AUTH: () => {
      const i = c('BASIC_AUTH');
      return `Basic ${btoa(`dummy_user_${i}:dummy_pass_${i}`)}`;
    },

    PASSWORD: (original) => {
      const i = c('PASSWORD');
      const eqMatch = original.match(/[=:]\s*/);
      if (eqMatch) {
        const prefix = original.slice(0, original.indexOf(eqMatch[0]) + eqMatch[0].length);
        return `${prefix}dummy_password_${i}`;
      }
      return `password=dummy_password_${i}`;
    },

    SECRET: () => {
      const i = c('SECRET');
      return `secret=dummy_secret_${'0'.repeat(16)}${pad(i)}`;
    },

    ENTROPY: () => {
      const i = c('ENTROPY');
      return `DummyHighEntropyString${'0'.repeat(20)}${pad(i)}`;
    },

    CUSTOM: (original) => {
      const i = c('CUSTOM');
      const first = FAKE_FIRST[(i - 1) % FAKE_FIRST.length];
      const last = FAKE_LAST[(i - 1) % FAKE_LAST.length];
      // Match structure: single word → single name, multi-word → full name
      if (!original.includes(' ')) return first;
      return `${first} ${last}`;
    },
  };
}
