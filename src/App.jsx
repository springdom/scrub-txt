import { useState, useCallback, useMemo, useEffect } from 'react';
import { PATTERNS, getGroups } from './lib/patterns.js';
import { TAG_COLORS } from './lib/colors.js';
import { scrub, rehydrate } from './lib/engine.js';

/* ── Theme ── */
const themes = {
  dark: {
    bg: '#0a0a0a', bgPanel: '#0e0e0e', bgInput: '#141414',
    text: '#e0e0e0', textBright: '#f0f0f0', textBody: '#d0d0d0', textMuted: '#a0a0a0',
    textDim: '#aaa', textFaint: '#666', textPlaceholder: '#333',
    border: '#222', borderLight: '#1a1a1a', borderInput: '#2a2a2a', borderActive: '#333',
    chipBg: '#141414', chipBorder: '#2a2a2a',
    chipActiveBg: '#0d1f0d', chipActiveBorder: '#1a3a1a',
    customChipBg: '#1a1a1a', customChipBorder: '#333',
    headerBtnActiveBg: '#1a1a1a',
    errorBg: '#1a0a0a', errorBorder: '#331515',
    selectionBg: '#e44d2640',
    scrollThumb: '#333', scrollThumbHover: '#444',
    placeholderTextarea: '#404040', placeholderInput: '#505050',
  },
  light: {
    bg: '#f5f5f5', bgPanel: '#eaeaea', bgInput: '#fff',
    text: '#1a1a1a', textBright: '#000', textBody: '#555', textMuted: '#888',
    textDim: '#666', textFaint: '#aaa', textPlaceholder: '#ccc',
    border: '#ddd', borderLight: '#e0e0e0', borderInput: '#ccc', borderActive: '#bbb',
    chipBg: '#fff', chipBorder: '#ccc',
    chipActiveBg: '#e6f4e6', chipActiveBorder: '#8bc78b',
    customChipBg: '#e8e8e8', customChipBorder: '#ccc',
    headerBtnActiveBg: '#e0e0e0',
    errorBg: '#fef2f2', errorBorder: '#f5c6c6',
    selectionBg: '#e44d2640',
    scrollThumb: '#c0c0c0', scrollThumbHover: '#a0a0a0',
    placeholderTextarea: '#bbb', placeholderInput: '#999',
  },
};

/* ── Styles ── */
const font = "'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace";

const getStyles = (t) => ({
  root: {
    height: '100vh', background: t.bg, color: t.text,
    fontFamily: font, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  header: {
    padding: '14px 20px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', borderBottom: `1px solid ${t.border}`, flexShrink: 0,
  },
  logoBox: {
    width: 28, height: 28, borderRadius: 6, background: '#e44d26',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.05em',
  },
  panelHeader: {
    padding: '8px 20px', borderBottom: `1px solid ${t.borderLight}`,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
  },
  panelLabel: {
    fontSize: 10, color: t.textDim, textTransform: 'uppercase',
    letterSpacing: '0.1em', fontWeight: 600,
  },
  textarea: {
    flex: 1, background: 'transparent', border: 'none', padding: '14px 20px',
    color: t.text, fontSize: 12.5, fontFamily: font, resize: 'none',
    outline: 'none', lineHeight: 1.75, width: '100%', overflowY: 'auto',
  },
  settingsPanel: {
    borderBottom: `1px solid ${t.border}`, padding: '14px 20px', background: t.bgPanel,
    maxHeight: 500, overflowY: 'auto', flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 10, fontWeight: 700, color: '#e44d26', marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: '0.1em',
  },
  input: {
    flex: 1, background: t.bgInput, border: `1px solid ${t.borderInput}`, borderRadius: 5,
    padding: '7px 10px', color: t.text, fontSize: 11.5, outline: 'none', fontFamily: font,
  },
  statsBar: {
    padding: '6px 20px', background: t.bgPanel, borderBottom: `1px solid ${t.border}`,
    display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0,
  },
});

const headerBtn = (active, t) => ({
  background: active ? t.headerBtnActiveBg : 'transparent',
  border: `1px solid ${active ? t.borderActive : t.border}`,
  color: active ? '#e44d26' : t.textDim,
  borderRadius: 5, padding: '5px 10px', fontSize: 11,
  cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
});

const copyBtn = (active) => ({
  background: active ? '#16a34a' : '#e44d26', border: 'none', color: '#fff',
  borderRadius: 4, padding: '4px 12px', fontSize: 10, fontWeight: 600,
  cursor: 'pointer', fontFamily: font, transition: 'all 0.15s', letterSpacing: '0.02em',
});

const getSmallBtn = (t) => ({
  background: 'transparent', border: `1px solid ${t.border}`, color: t.textDim,
  borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer', fontFamily: font,
});

const chip = (active, t) => ({
  background: active ? t.chipActiveBg : t.chipBg,
  border: `1px solid ${active ? t.chipActiveBorder : t.chipBorder}`,
  color: active ? (t === themes.light ? '#16a34a' : '#4ade80') : t.textMuted,
  borderRadius: 4, padding: '3px 9px', fontSize: 10.5,
  cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
});

const tag = (color) => ({
  background: color + '18', color, borderRadius: 3,
  padding: '1px 5px', fontSize: 11.5, fontWeight: 500, border: `1px solid ${color}30`,
});

const getCustomChip = (t) => ({
  background: t.customChipBg, border: `1px solid ${t.customChipBorder}`, borderRadius: 3,
  padding: '3px 7px', fontSize: 10.5, display: 'flex', alignItems: 'center', gap: 5,
});

/* ── Placeholder text ── */
const PLACEHOLDER = `Paste text here to scrub...\n\nTry:\nHey, it's Matt Johnson (matt.j@acme.com).\nCall me at (415) 555-1234.\nMy SSN is 234-56-7890.\nAPI key: sk-proj-abc123def456ghi789jklmnop\nServer: 192.168.1.42\nDB: postgres://admin:s3cret@prod-db.acme.com:5432/users`;

/* ── App ── */
export default function App() {
  const [input, setInput] = useState('');
  const [patterns, setPatterns] = useState(PATTERNS);
  const [customRules, setCustomRules] = useState([]);
  const [newRuleText, setNewRuleText] = useState('');
  const [newRuleCaseSensitive, setNewRuleCaseSensitive] = useState(false);
  const [newRuleType, setNewRuleType] = useState('CUSTOM_PERSON');
  const [showSettings, setShowSettings] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rehydratedCopied, setRehydratedCopied] = useState(false);
  const [rehydrateInput, setRehydrateInput] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('scrub-theme') !== 'light'; } catch { return true; }
  });

  const t = dark ? themes.dark : themes.light;
  const styles = useMemo(() => getStyles(t), [dark]);
  const smallBtn = useMemo(() => getSmallBtn(t), [dark]);
  const customChip = useMemo(() => getCustomChip(t), [dark]);

  useEffect(() => {
    try { localStorage.setItem('scrub-theme', dark ? 'dark' : 'light'); } catch {}
    document.body.style.background = t.bg;
    document.body.style.color = t.text;
    // Update CSS custom properties for scrollbar & placeholder
    const root = document.documentElement;
    root.style.setProperty('--scroll-thumb', t.scrollThumb);
    root.style.setProperty('--scroll-thumb-hover', t.scrollThumbHover);
    root.style.setProperty('--placeholder-textarea', t.placeholderTextarea);
    root.style.setProperty('--placeholder-input', t.placeholderInput);
  }, [dark, t]);

  const togglePattern = useCallback((id) => {
    setPatterns((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  }, []);

  const [duplicateWarning, setDuplicateWarning] = useState('');

  const addCustomRule = useCallback(() => {
    const text = newRuleText.trim();
    if (!text) return;
    // Check for duplicate (case-insensitive comparison)
    const existing = customRules.find((r) => r.text.toLowerCase() === text.toLowerCase());
    if (existing) {
      const typeLabel = {
        CUSTOM_PERSON: 'Person', CUSTOM_ORG: 'Company', CUSTOM_PROJECT: 'Project',
        CUSTOM_LOCATION: 'Location', CUSTOM_OTHER: 'Other', CUSTOM: 'Custom',
      }[existing.tag] || 'Custom';
      setDuplicateWarning(`"${text}" already exists as ${typeLabel} — remove it first to change type`);
      setTimeout(() => setDuplicateWarning(''), 3000);
      return;
    }
    setCustomRules((prev) => [
      ...prev,
      { id: `custom_${Date.now()}`, text, caseSensitive: newRuleCaseSensitive, tag: newRuleType },
    ]);
    setNewRuleText('');
    setNewRuleCaseSensitive(false);
    setDuplicateWarning('');
  }, [newRuleText, newRuleCaseSensitive, newRuleType, customRules]);

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
    if (!scrubbed) return <span style={{ color: t.textPlaceholder }}>Scrubbed text appears here...</span>;
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
            <div style={{ fontSize: 13.5, fontWeight: 700, color: t.text, letterSpacing: '-0.03em' }}>
              scrubtxt
            </div>
            <div style={{ fontSize: 10, color: t.textMuted, marginTop: 1 }}>
              100% client-side · nothing leaves your browser
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => { setShowHowTo(!showHowTo); setShowAbout(false); setShowMapping(false); setShowSettings(false); }}
            style={headerBtn(showHowTo, t)}
          >
            ? How to Use
          </button>
          <button
            onClick={() => { setShowAbout(!showAbout); setShowMapping(false); setShowSettings(false); setShowHowTo(false); }}
            style={headerBtn(showAbout, t)}
          >
            ⓘ About
          </button>
          <button
            onClick={() => { setShowMapping(!showMapping); setShowSettings(false); setShowAbout(false); setShowHowTo(false); }}
            style={headerBtn(showMapping, t)}
          >
            ↩ Rehydrate{mapping.length > 0 ? ` (${mapping.length})` : ''}
          </button>
          <button
            onClick={() => { setShowSettings(!showSettings); setShowMapping(false); setShowAbout(false); setShowHowTo(false); }}
            style={headerBtn(showSettings, t)}
          >
            ⚙ Rules ({enabledCount + customRules.length})
          </button>
          <button
            onClick={() => setDark(!dark)}
            style={{
              ...headerBtn(false, t),
              fontSize: 13, padding: '5px 8px', lineHeight: 1,
            }}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? '☀' : '☾'}
          </button>
        </div>
      </div>

      {/* ── Settings Panel ── */}
      {showSettings && (
        <div style={styles.settingsPanel}>
          {/* Custom Rules */}
          <div style={{ marginBottom: 18 }}>
            <div style={styles.sectionTitle}>Custom Words & Phrases</div>
            <div style={{ fontSize: 10.5, color: t.textMuted, marginBottom: 8 }}>
              Add names, companies, projects, or locations — replaced with matching fake data
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              <input
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomRule()}
                placeholder={
                  newRuleType === 'CUSTOM_PERSON' ? 'e.g. Matt Johnson, Sarah...' :
                  newRuleType === 'CUSTOM_ORG' ? 'e.g. Acme Corp, SpaceX...' :
                  newRuleType === 'CUSTOM_PROJECT' ? 'e.g. Project Falcon, Moonshot...' :
                  newRuleType === 'CUSTOM_LOCATION' ? 'e.g. 742 Evergreen Terrace...' :
                  'e.g. any sensitive text...'
                }
                style={{ ...styles.input, minWidth: 180 }}
              />
              <select
                value={newRuleType}
                onChange={(e) => setNewRuleType(e.target.value)}
                style={{
                  background: t.bgInput, border: `1px solid ${t.borderInput}`, borderRadius: 5,
                  padding: '7px 8px', color: t.text, fontSize: 11, outline: 'none',
                  fontFamily: font, cursor: 'pointer',
                }}
              >
                <option value="CUSTOM_PERSON">👤 Person</option>
                <option value="CUSTOM_ORG">🏢 Company</option>
                <option value="CUSTOM_PROJECT">📁 Project</option>
                <option value="CUSTOM_LOCATION">📍 Location</option>
                <option value="CUSTOM_OTHER">🏷️ Other</option>
              </select>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 3,
                fontSize: 10, color: t.textDim, cursor: 'pointer', whiteSpace: 'nowrap',
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
            {duplicateWarning && (
              <div style={{
                fontSize: 10.5, color: '#f87171', marginBottom: 8,
                padding: '5px 8px', background: t.errorBg, border: `1px solid ${t.errorBorder}`,
                borderRadius: 4,
              }}>
                {duplicateWarning}
              </div>
            )}
            {customRules.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {customRules.map((rule) => {
                  const typeLabel = {
                    CUSTOM_PERSON: '👤', CUSTOM_ORG: '🏢', CUSTOM_PROJECT: '📁',
                    CUSTOM_LOCATION: '📍', CUSTOM_OTHER: '🏷️', CUSTOM: '🏷️',
                  }[rule.tag] || '🏷️';
                  return (
                    <span key={rule.id} style={customChip}>
                      <span style={{ fontSize: 10 }}>{typeLabel}</span>
                      <span style={{ color: TAG_COLORS[rule.tag] || '#e44d26' }}>{rule.text}</span>
                      {rule.caseSensitive && <span style={{ color: t.textMuted, fontSize: 8 }}>Aa</span>}
                      <button
                        onClick={() => removeCustomRule(rule.id)}
                        style={{
                          color: t.textMuted, cursor: 'pointer', fontSize: 13, lineHeight: 1,
                          background: 'none', border: 'none', padding: 0, fontFamily: font,
                        }}
                        aria-label={`Remove ${rule.text}`}
                      >×</button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Auto-detection toggles */}
          <div style={styles.sectionTitle}>Auto-Detection</div>
          {groups.map((group) => (
            <div key={group} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: t.textDim, marginBottom: 5 }}>{group}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {patterns.filter((p) => p.group === group).map((p) => (
                  <button key={p.id} onClick={() => togglePattern(p.id)} style={chip(p.enabled, t)}>
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
          <div style={{ fontSize: 10.5, color: t.textMuted, marginBottom: 10 }}>
            Paste the AI's response — dummy data gets swapped back to your real data
          </div>
          {mapping.length === 0 ? (
            <div style={{ fontSize: 11, color: t.textFaint, padding: '16px 0', textAlign: 'center' }}>
              No replacements yet — scrub some text first
            </div>
          ) : (
            <>
              <div style={{
                marginBottom: 10, background: t.bgInput, borderRadius: 5,
                padding: 10, border: `1px solid ${t.borderInput}`,
              }}>
                <div style={{
                  fontSize: 9, color: t.textMuted, marginBottom: 6,
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
                    <span style={{ color: t.textFaint }}>←</span>
                    <code style={{ color: t.textBody }}>{m.original}</code>
                  </div>
                ))}
              </div>
              <textarea
                value={rehydrateInput}
                onChange={(e) => setRehydrateInput(e.target.value)}
                placeholder="Paste AI response here..."
                style={{
                  ...styles.textarea, flex: 'none', minHeight: 150, background: t.bgInput,
                  border: `1px solid ${t.borderInput}`, borderRadius: 5, padding: 10, boxSizing: 'border-box',
                  resize: 'vertical', maxHeight: 400,
                }}
              />
              {rehydratedText && rehydrateInput && (
                <div style={{ marginTop: 8 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 5,
                  }}>
                    <span style={{ fontSize: 10, color: t.textDim }}>Restored:</span>
                    <button
                      onClick={() => copyToClipboard(rehydratedText, setRehydratedCopied)}
                      style={copyBtn(rehydratedCopied)}
                    >
                      {rehydratedCopied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <div style={{
                    background: t.bgInput, border: `1px solid ${t.borderInput}`, borderRadius: 5,
                    padding: 10, fontSize: 11.5, color: t.text, whiteSpace: 'pre-wrap',
                    maxHeight: 300, overflowY: 'auto', lineHeight: 1.6,
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
                <div style={{ fontSize: 12, fontWeight: 600, color: t.textBright, marginBottom: 3 }}>Scrub</div>
                <div style={{ fontSize: 11, color: t.textBody, lineHeight: 1.6 }}>
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
                <div style={{ fontSize: 12, fontWeight: 600, color: t.textBright, marginBottom: 3 }}>Copy & Use AI</div>
                <div style={{ fontSize: 11, color: t.textBody, lineHeight: 1.6 }}>
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
                <div style={{ fontSize: 12, fontWeight: 600, color: t.textBright, marginBottom: 3 }}>Rehydrate</div>
                <div style={{ fontSize: 11, color: t.textBody, lineHeight: 1.6 }}>
                  Click <span style={{ color: '#e44d26' }}>↩ Rehydrate</span> and paste the AI's response.
                  All dummy values get swapped back to your originals. You get a fully personalized
                  response without the AI ever seeing your real data.
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 16, paddingTop: 12, borderTop: `1px solid ${t.borderInput}`,
          }}>
            <div style={{ ...styles.sectionTitle, marginTop: 4 }}>Tips</div>
            <div style={{ fontSize: 11, color: t.textBody, lineHeight: 1.7 }}>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: t.text }}>Custom rules</span> — Click ⚙ Rules to add names,
                company names, or project codenames. These get replaced with realistic fake names.
              </div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: t.text }}>Toggle patterns</span> — Not everything needs scrubbing.
                Disable patterns you don't need to reduce false positives.
              </div>
              <div>
                <span style={{ color: t.text }}>Same in, same out</span> — If the same email appears
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
          <div style={{ fontSize: 12, color: t.textBody, lineHeight: 1.7, marginBottom: 16 }}>
            <strong style={{ color: t.textBright }}>scrubtxt</strong> is a client-side data scrubber
            for safely using AI services. Paste your text, sensitive data gets replaced with
            realistic dummy values, copy it into any AI, then rehydrate the response with your
            real data. Nothing ever leaves your browser.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', width: 60, flexShrink: 0 }}>Version</span>
              <span style={{ fontSize: 11.5, color: t.text }}>0.1.0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', width: 60, flexShrink: 0 }}>License</span>
              <span style={{ fontSize: 11.5, color: t.text }}>MIT</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', width: 60, flexShrink: 0 }}>Source</span>
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
              <span style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', width: 60, flexShrink: 0 }}>Built by</span>
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
            marginTop: 16, paddingTop: 12, borderTop: `1px solid ${t.borderInput}`,
            fontSize: 10.5, color: t.textMuted, lineHeight: 1.6,
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
          {Object.entries(stats.byType).map(([tp, count]) => (
            <span key={tp} style={{ ...tag(TAG_COLORS[tp] || '#888'), fontSize: 9.5 }}>
              {tp} ×{count}
            </span>
          ))}
        </div>
      )}

      {/* ── Main Panels ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Input */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${t.border}`, minHeight: 0 }}>
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
