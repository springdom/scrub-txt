import { useState, useCallback, useMemo } from 'react';
import { PATTERNS, getGroups } from './lib/patterns.js';
import { TAG_COLORS } from './lib/colors.js';
import { scrub, rehydrate } from './lib/engine.js';

/* ── Styles ── */
const font = "'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";

const styles = {
  root: {
    minHeight: '100vh', background: '#08080a', color: '#d4d4d8',
    fontFamily: font, display: 'flex', flexDirection: 'column',
  },
  header: {
    padding: '14px 20px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', borderBottom: '1px solid #18181b', flexShrink: 0,
  },
  logoBox: {
    width: 28, height: 28, borderRadius: 6, background: '#e44d26',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.05em',
  },
  panelHeader: {
    padding: '8px 20px', borderBottom: '1px solid #111113',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
  },
  panelLabel: {
    fontSize: 10, color: '#3f3f46', textTransform: 'uppercase',
    letterSpacing: '0.1em', fontWeight: 600,
  },
  textarea: {
    flex: 1, background: 'transparent', border: 'none', padding: '14px 20px',
    color: '#d4d4d8', fontSize: 12.5, fontFamily: font, resize: 'none',
    outline: 'none', lineHeight: 1.75, width: '100%',
  },
  settingsPanel: {
    borderBottom: '1px solid #18181b', padding: '14px 20px', background: '#0a0a0d',
    maxHeight: 380, overflowY: 'auto', flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 10, fontWeight: 700, color: '#e44d26', marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: '0.1em',
  },
  input: {
    flex: 1, background: '#0e0e11', border: '1px solid #1e1e22', borderRadius: 5,
    padding: '7px 10px', color: '#d4d4d8', fontSize: 11.5, outline: 'none', fontFamily: font,
  },
  statsBar: {
    padding: '6px 20px', background: '#0a0a0d', borderBottom: '1px solid #18181b',
    display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0,
  },
};

const headerBtn = (active) => ({
  background: active ? '#18181b' : 'transparent',
  border: `1px solid ${active ? '#27272a' : '#18181b'}`,
  color: active ? '#e44d26' : '#52525b',
  borderRadius: 5, padding: '5px 10px', fontSize: 11,
  cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
});

const copyBtn = (active) => ({
  background: active ? '#16a34a' : '#e44d26', border: 'none', color: '#fff',
  borderRadius: 4, padding: '4px 12px', fontSize: 10, fontWeight: 600,
  cursor: 'pointer', fontFamily: font, transition: 'all 0.15s', letterSpacing: '0.02em',
});

const smallBtn = {
  background: 'transparent', border: '1px solid #18181b', color: '#52525b',
  borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer', fontFamily: font,
};

const chip = (active) => ({
  background: active ? '#132713' : '#111113',
  border: `1px solid ${active ? '#1e3a1e' : '#1e1e22'}`,
  color: active ? '#4ade80' : '#3f3f46',
  borderRadius: 4, padding: '3px 9px', fontSize: 10.5,
  cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
});

const tag = (color) => ({
  background: color + '18', color, borderRadius: 3,
  padding: '1px 5px', fontSize: 11.5, fontWeight: 500, border: `1px solid ${color}30`,
});

const customChip = {
  background: '#18181b', border: '1px solid #27272a', borderRadius: 3,
  padding: '3px 7px', fontSize: 10.5, display: 'flex', alignItems: 'center', gap: 5,
};

/* ── Placeholder text ── */
const PLACEHOLDER = `Paste text here to scrub...\n\nTry:\nHey, it's Matt Johnson (matt.j@acme.com).\nCall me at (415) 555-1234.\nMy SSN is 234-56-7890.\nAPI key: sk-proj-abc123def456ghi789jklmnop\nServer: 192.168.1.42\nDB: postgres://admin:s3cret@prod-db.acme.com:5432/users`;

/* ── App ── */
export default function App() {
  const [input, setInput] = useState('');
  const [patterns, setPatterns] = useState(PATTERNS);
  const [customRules, setCustomRules] = useState([]);
  const [newRuleText, setNewRuleText] = useState('');
  const [newRuleCaseSensitive, setNewRuleCaseSensitive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rehydratedCopied, setRehydratedCopied] = useState(false);
  const [rehydrateInput, setRehydrateInput] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  const togglePattern = useCallback((id) => {
    setPatterns((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  }, []);

  const addCustomRule = useCallback(() => {
    const text = newRuleText.trim();
    if (!text) return;
    setCustomRules((prev) => [
      ...prev,
      { id: `custom_${Date.now()}`, text, caseSensitive: newRuleCaseSensitive, tag: 'CUSTOM' },
    ]);
    setNewRuleText('');
    setNewRuleCaseSensitive(false);
  }, [newRuleText, newRuleCaseSensitive]);

  const removeCustomRule = useCallback((id) => {
    setCustomRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Core scrub computation
  const { scrubbed, mapping, stats } = useMemo(
    () => scrub(input, patterns, customRules),
    [input, patterns, customRules]
  );

  // Rehydration
  const rehydratedText = useMemo(
    () => rehydrate(rehydrateInput, mapping),
    [rehydrateInput, mapping]
  );

  const copyToClipboard = useCallback(async (text, setter) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setter(true);
    setTimeout(() => setter(false), 2000);
  }, []);

  const enabledCount = patterns.filter((p) => p.enabled).length;
  const groups = getGroups();

  // Highlight fake values in output
  const renderScrubbed = () => {
    if (!scrubbed) return <span style={{ color: '#1e1e22' }}>Scrubbed text appears here...</span>;
    if (mapping.length === 0) return <span>{scrubbed}</span>;

    const fakeValues = mapping.map((m) => m.fake).sort((a, b) => b.length - a.length);
    const escapedFakes = fakeValues.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const splitRegex = new RegExp(`(${escapedFakes.join('|')})`, 'g');
    const parts = scrubbed.split(splitRegex);

    return parts.map((part, i) => {
      const m = mapping.find((x) => x.fake === part);
      if (m) {
        const color = TAG_COLORS[m.tag] || '#888';
        return <span key={i} style={tag(color)}>{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div style={styles.root}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={styles.logoBox}>S</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.03em' }}>
              scrub.txt
            </div>
            <div style={{ fontSize: 10, color: '#3f3f46', marginTop: 1 }}>
              100% client-side · nothing leaves your browser
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => { setShowHowTo(!showHowTo); setShowAbout(false); setShowMapping(false); setShowSettings(false); }}
            style={headerBtn(showHowTo)}
          >
            ? How to Use
          </button>
          <button
            onClick={() => { setShowAbout(!showAbout); setShowMapping(false); setShowSettings(false); setShowHowTo(false); }}
            style={headerBtn(showAbout)}
          >
            ⓘ About
          </button>
          <button
            onClick={() => { setShowMapping(!showMapping); setShowSettings(false); setShowAbout(false); setShowHowTo(false); }}
            style={headerBtn(showMapping)}
          >
            ↩ Rehydrate{mapping.length > 0 ? ` (${mapping.length})` : ''}
          </button>
          <button
            onClick={() => { setShowSettings(!showSettings); setShowMapping(false); setShowAbout(false); setShowHowTo(false); }}
            style={headerBtn(showSettings)}
          >
            ⚙ Rules ({enabledCount + customRules.length})
          </button>
        </div>
      </div>

      {/* ── Settings Panel ── */}
      {showSettings && (
        <div style={styles.settingsPanel}>
          {/* Custom Rules */}
          <div style={{ marginBottom: 18 }}>
            <div style={styles.sectionTitle}>Custom Words & Phrases</div>
            <div style={{ fontSize: 10.5, color: '#3f3f46', marginBottom: 8 }}>
              Names, codenames, companies — replaced with realistic fake names
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomRule()}
                placeholder="e.g. Matt, Project Falcon, Acme Corp..."
                style={styles.input}
              />
              <label style={{
                display: 'flex', alignItems: 'center', gap: 3,
                fontSize: 10, color: '#52525b', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                <input
                  type="checkbox"
                  checked={newRuleCaseSensitive}
                  onChange={(e) => setNewRuleCaseSensitive(e.target.checked)}
                  style={{ accentColor: '#e44d26' }}
                />
                Aa
              </label>
              <button
                onClick={addCustomRule}
                style={{
                  background: '#e44d26', border: 'none', color: '#fff', borderRadius: 5,
                  padding: '7px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: font,
                }}
              >+</button>
            </div>
            {customRules.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {customRules.map((rule) => (
                  <span key={rule.id} style={customChip}>
                    <span style={{ color: '#e44d26' }}>{rule.text}</span>
                    {rule.caseSensitive && <span style={{ color: '#3f3f46', fontSize: 8 }}>Aa</span>}
                    <span
                      onClick={() => removeCustomRule(rule.id)}
                      style={{ color: '#3f3f46', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}
                    >×</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Auto-detection toggles */}
          <div style={styles.sectionTitle}>Auto-Detection</div>
          {groups.map((group) => (
            <div key={group} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#52525b', marginBottom: 5 }}>{group}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {patterns.filter((p) => p.group === group).map((p) => (
                  <button key={p.id} onClick={() => togglePattern(p.id)} style={chip(p.enabled)}>
                    {p.enabled ? '●' : '○'} {p.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Rehydrate Panel ── */}
      {showMapping && (
        <div style={styles.settingsPanel}>
          <div style={styles.sectionTitle}>Rehydrate AI Response</div>
          <div style={{ fontSize: 10.5, color: '#3f3f46', marginBottom: 10 }}>
            Paste the AI's response — dummy data gets swapped back to your real data
          </div>
          {mapping.length === 0 ? (
            <div style={{ fontSize: 11, color: '#27272a', padding: '16px 0', textAlign: 'center' }}>
              No replacements yet — scrub some text first
            </div>
          ) : (
            <>
              <div style={{
                marginBottom: 10, background: '#0e0e11', borderRadius: 5,
                padding: 10, border: '1px solid #1e1e22',
              }}>
                <div style={{
                  fontSize: 9, color: '#3f3f46', marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  Mapping Table
                </div>
                {mapping.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '4px 0', fontSize: 10.5,
                  }}>
                    <span style={{ ...tag(TAG_COLORS[m.tag] || '#888'), fontSize: 9, padding: '0 4px' }}>
                      {m.tag}
                    </span>
                    <code style={{ color: TAG_COLORS[m.tag] || '#888' }}>{m.fake}</code>
                    <span style={{ color: '#27272a' }}>←</span>
                    <code style={{ color: '#71717a' }}>{m.original}</code>
                  </div>
                ))}
              </div>
              <textarea
                value={rehydrateInput}
                onChange={(e) => setRehydrateInput(e.target.value)}
                placeholder="Paste AI response here..."
                style={{
                  ...styles.textarea, flex: 'none', minHeight: 70, background: '#0e0e11',
                  border: '1px solid #1e1e22', borderRadius: 5, padding: 10, boxSizing: 'border-box',
                }}
              />
              {rehydratedText && rehydrateInput && (
                <div style={{ marginTop: 8 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 5,
                  }}>
                    <span style={{ fontSize: 10, color: '#52525b' }}>Restored:</span>
                    <button
                      onClick={() => copyToClipboard(rehydratedText, setRehydratedCopied)}
                      style={copyBtn(rehydratedCopied)}
                    >
                      {rehydratedCopied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <div style={{
                    background: '#0e0e11', border: '1px solid #1e1e22', borderRadius: 5,
                    padding: 10, fontSize: 11.5, color: '#d4d4d8', whiteSpace: 'pre-wrap',
                    maxHeight: 160, overflowY: 'auto', lineHeight: 1.6,
                  }}>
                    {rehydratedText}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── How to Use Panel ── */}
      {showHowTo && (
        <div style={styles.settingsPanel}>
          <div style={styles.sectionTitle}>How to Use</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 12, background: '#e44d26',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>1</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fafafa', marginBottom: 3 }}>Scrub</div>
                <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.6 }}>
                  Paste your text in the left panel. Sensitive data like emails, API keys, phone numbers,
                  and private keys are automatically detected and replaced with realistic dummy values.
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 12, background: '#e44d26',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>2</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fafafa', marginBottom: 3 }}>Copy & Use AI</div>
                <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.6 }}>
                  Hit <span style={{ color: '#e44d26' }}>Copy</span> on the scrubbed output and paste it into
                  ChatGPT, Claude, or any AI service. The AI processes your request using fake data —
                  your real data never touches their servers.
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 12, background: '#e44d26',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>3</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fafafa', marginBottom: 3 }}>Rehydrate</div>
                <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.6 }}>
                  Click <span style={{ color: '#e44d26' }}>↩ Rehydrate</span> and paste the AI's response.
                  All dummy values get swapped back to your originals. You get a fully personalized
                  response without the AI ever seeing your real data.
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 16, paddingTop: 12, borderTop: '1px solid #1e1e22',
          }}>
            <div style={{ ...styles.sectionTitle, marginTop: 4 }}>Tips</div>
            <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.7 }}>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#a1a1aa' }}>Custom rules</span> — Click ⚙ Rules to add names,
                company names, or project codenames. These get replaced with realistic fake names.
              </div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#a1a1aa' }}>Toggle patterns</span> — Not everything needs scrubbing.
                Disable patterns you don't need to reduce false positives.
              </div>
              <div>
                <span style={{ color: '#a1a1aa' }}>Same in, same out</span> — If the same email appears
                5 times, it maps to the same fake email every time, keeping the text coherent.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── About Panel ── */}
      {showAbout && (
        <div style={styles.settingsPanel}>
          <div style={styles.sectionTitle}>About</div>
          <div style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.7, marginBottom: 16 }}>
            <strong style={{ color: '#fafafa' }}>scrub.txt</strong> is a client-side data scrubber
            for safely using AI services. Paste your text, sensitive data gets replaced with
            realistic dummy values, copy it into any AI, then rehydrate the response with your
            real data. Nothing ever leaves your browser.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.1em', width: 60, flexShrink: 0 }}>Version</span>
              <span style={{ fontSize: 11.5, color: '#d4d4d8' }}>0.1.0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.1em', width: 60, flexShrink: 0 }}>License</span>
              <span style={{ fontSize: 11.5, color: '#d4d4d8' }}>MIT</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.1em', width: 60, flexShrink: 0 }}>Source</span>
              <a
                href="https://github.com/springdom/scrub-txt"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11.5, color: '#e44d26', textDecoration: 'none' }}
              >
                github.com/springdom/scrub-txt
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.1em', width: 60, flexShrink: 0 }}>Built by</span>
              <a
                href="https://github.com/springdom"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11.5, color: '#e44d26', textDecoration: 'none' }}
              >
                Springdom
              </a>
            </div>
          </div>

          <div style={{
            marginTop: 16, paddingTop: 12, borderTop: '1px solid #1e1e22',
            fontSize: 10.5, color: '#3f3f46', lineHeight: 1.6,
          }}>
            100% open source · Zero tracking · No backend · No cookies · Works offline
          </div>
        </div>
      )}

      {/* ── Stats Bar ── */}
      {stats.total > 0 && (
        <div style={styles.statsBar}>
          <span style={{ fontSize: 10.5, color: '#e44d26', fontWeight: 600 }}>
            {stats.total} item{stats.total !== 1 ? 's' : ''} scrubbed
          </span>
          {Object.entries(stats.byType).map(([t, count]) => (
            <span key={t} style={{ ...tag(TAG_COLORS[t] || '#888'), fontSize: 9.5 }}>
              {t} ×{count}
            </span>
          ))}
        </div>
      )}

      {/* ── Main Panels ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Input */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #18181b' }}>
          <div style={styles.panelHeader}>
            <span style={styles.panelLabel}>Paste your text</span>
            {input && <button onClick={() => setInput('')} style={smallBtn}>Clear</button>}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDER}
            style={styles.textarea}
          />
        </div>

        {/* Output */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={styles.panelHeader}>
            <span style={styles.panelLabel}>Scrubbed output</span>
            {scrubbed && (
              <button onClick={() => copyToClipboard(scrubbed, setCopied)} style={copyBtn(copied)}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <div style={{
            flex: 1, padding: '14px 20px', fontSize: 12.5, lineHeight: 1.75,
            whiteSpace: 'pre-wrap', overflowY: 'auto',
          }}>
            {renderScrubbed()}
          </div>
        </div>
      </div>
    </div>
  );
}
