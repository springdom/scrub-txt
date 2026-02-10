/**
 * Core scrubbing engine for scrub.txt
 *
 * scrub(text, patterns, customRules) → { scrubbed, mapping, stats }
 *
 * - Runs all enabled patterns and custom rules against the input
 * - Resolves overlapping matches (longer match wins)
 * - Generates realistic dummy replacements
 * - Deduplicates: same original value always maps to same fake
 * - Returns a mapping table for rehydration
 */

import { createGenerators } from './generators.js';

/**
 * @param {string} text - Input text to scrub
 * @param {Array} patterns - Pattern objects with { enabled, regex, tag, validate? }
 * @param {Array} customRules - Custom rules with { text, caseSensitive, tag }
 * @returns {{ scrubbed: string, mapping: Array<{fake, original, tag}>, stats: {total, byType} }}
 */
export function scrub(text, patterns, customRules) {
  if (!text) return { scrubbed: '', mapping: [], stats: { total: 0, byType: {} } };

  const generators = createGenerators();
  const replacements = [];

  // Run auto-detection patterns
  for (const pattern of patterns) {
    if (!pattern.enabled) continue;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (pattern.validate && !pattern.validate(match[0])) continue;
      replacements.push({
        start: match.index,
        end: match.index + match[0].length,
        original: match[0],
        tag: pattern.tag,
      });
    }
  }

  // Run custom rules
  for (const rule of customRules) {
    const flags = rule.caseSensitive ? 'g' : 'gi';
    const escaped = rule.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      replacements.push({
        start: match.index,
        end: match.index + match[0].length,
        original: match[0],
        tag: rule.tag || 'CUSTOM',
      });
    }
  }

  // Sort by position, resolve overlaps (first match wins at equal start, longer wins)
  replacements.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
  const filtered = [];
  let lastEnd = 0;
  for (const r of replacements) {
    if (r.start >= lastEnd) {
      filtered.push(r);
      lastEnd = r.end;
    }
  }

  // Build output with deduplicated fake values
  const seenOriginals = {};
  const mapping = [];
  const byType = {};
  let result = '';
  let cursor = 0;

  for (const r of filtered) {
    result += text.slice(cursor, r.start);

    if (seenOriginals[r.original]) {
      result += seenOriginals[r.original];
    } else {
      const gen = generators[r.tag];
      const fake = gen ? gen(r.original) : `REDACTED_${mapping.length + 1}`;
      seenOriginals[r.original] = fake;
      result += fake;
      mapping.push({ fake, original: r.original, tag: r.tag });
    }

    byType[r.tag] = (byType[r.tag] || 0) + 1;
    cursor = r.end;
  }
  result += text.slice(cursor);

  return {
    scrubbed: result,
    mapping,
    stats: { total: filtered.length, byType },
  };
}

/**
 * Rehydrate an AI response by replacing fake values with originals.
 *
 * @param {string} text - AI response containing fake values
 * @param {Array} mapping - Mapping table from scrub()
 * @returns {string} - Text with original values restored
 */
export function rehydrate(text, mapping) {
  if (!text || !mapping.length) return text;
  let result = text;
  // Sort by longest fake first to prevent partial replacements
  const sorted = [...mapping].sort((a, b) => b.fake.length - a.fake.length);
  for (const m of sorted) {
    result = result.replaceAll(m.fake, m.original);
  }
  return result;
}
