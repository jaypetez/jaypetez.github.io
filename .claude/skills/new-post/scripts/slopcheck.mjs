#!/usr/bin/env node
/**
 * Mechanical half of the anti-slop pass for a post in src/content/blog.
 *
 * It reports, it does not gate. Nothing in CI calls this, and a finding is a
 * prompt to look at a line rather than an instruction to change it. The rules
 * that matter most (the deletion test, whether a claim has a name and a date
 * on it, whether the piece takes a position) cannot be checked here at all;
 * see references/anti-slop.md for those.
 *
 *   node .claude/skills/new-post/scripts/slopcheck.mjs src/content/blog/x.md
 *   node .claude/skills/new-post/scripts/slopcheck.mjs --verbose src/...
 */

import { readFileSync } from 'node:fs';

const WRAP_COLUMNS = 78;
const MAX_HITS_SHOWN = 4;

const BANNED_WORDS = [
  'delve',
  'delving',
  'tapestry',
  'a testament to',
  'underscores',
  'underscoring',
  'showcasing',
  'showcases',
  'boasts',
  'nestled',
  'in the heart of',
  'myriad',
  'plethora',
  'multifaceted',
  'vibrant',
  'seamless',
  'seamlessly',
  'synergy',
  'paradigm shift',
  'game-changer',
  'game changer',
  'unleash',
  'fostering',
  'cutting-edge',
  'groundbreaking',
  'revolutionize',
  'revolutionise',
  'in the realm of',
  'arsenal',
  'beacon',
  'moves the needle',
  'secret sauce',
  'unlock value',
  'drive impact',
  'deep dive',
  'meticulous',
  'intricacies',
  'interplay',
  'pivotal',
  'garner',
  'bolstered',
  'indelible',
  'valuable insights',
  'navigating the',
  'the landscape of',
  'in an era where',
];

const RULES = [
  {
    id: 'dashes',
    label: 'em dash, en dash, or " -- " (house style uses none)',
    pattern: /—|–| -- /g,
  },
  {
    id: 'banned',
    label: 'words from the cut-on-sight list',
    pattern: new RegExp(`\\b(?:${BANNED_WORDS.map(escape).join('|')})\\b`, 'gi'),
  },
  {
    id: 'negation-reframe',
    label: 'negation reframe ("it\'s not X, it\'s Y" and relatives)',
    pattern:
      /\b(?:it(?:'s| is)|that(?:'s| is)|this (?:is|isn't))\s+not\s+[^.!?]{2,60}?,\s*(?:it(?:'s| is)|but)\b|\bnot (?:just|only|merely|simply)\b[^.!?]{2,60}?\bbut\b|\bisn't about\b[^.!?]{2,60}?\bit(?:'s| is) about\b/gi,
  },
  {
    id: 'rhetorical-answer',
    label: 'self-answered rhetorical question ("The result? Devastating.")',
    pattern: /\b(?:the|a|an)\s+\w+\?\s+[A-Z][^.!?]{0,40}[.!]/g,
  },
  {
    id: 'vague-attribution',
    label: 'vague attribution (name the source or cut the claim)',
    pattern:
      /\b(?:experts?|researchers|analysts|observers|critics|industry reports?|studies|research|sources|many|some)\s+(?:say|says|argue|argues|suggest|suggests|note|notes|have noted|believe|believes|show|shows|indicate|indicates)\b/gi,
  },
  {
    id: 'copula-avoidance',
    label: 'circumlocution where "is" or "has" would do',
    pattern:
      /\b(?:serves as|stands as|functions as|operates as|represents a|boasts|leverages?)\b/gi,
  },
  {
    id: 'participial-tail',
    label: 'sentence ending in a comma plus a present participle',
    pattern: /,\s+\w+ing\b[^.!?,;:]{0,60}[.!?](?:\s|$)/g,
  },
  {
    id: 'opener-cliche',
    label: 'clichéd opener or transition',
    pattern:
      /\b(?:in today's [\w-]+ world|in a world where|in today's digital age|let's (?:dive|break this|explore)|here's the (?:thing|kicker)|picture this|ever wondered|imagine a world|it's worth noting that|it's important to note|in conclusion|to sum up)\b/gi,
  },
  {
    id: 'emoji',
    label: 'emoji or decorative Unicode',
    pattern: /[←-⇿⌀-➿⬀-⯿️]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDEFF]/g,
  },
];

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripFrontmatter(raw) {
  const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return m ? m[1] : raw;
}

/** Body text with figures, headings, and link URLs removed, for prose stats. */
function proseOf(body) {
  return body
    .replace(/<figure>[\s\S]*?<\/figure>/g, '')
    .replace(/^#{1,6} .*$/gm, '')
    .replace(/^---$/gm, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`[^`]*`/g, '');
}

function sentencesOf(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z"'(])/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length > 1);
}

function paragraphsOf(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const findings = [];
function report(ok, headline, detail) {
  findings.push({ ok, headline, detail });
}

// ---------------------------------------------------------------- entry point

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const file = args.find((a) => !a.startsWith('--'));

if (!file) {
  console.error('usage: slopcheck.mjs [--verbose] src/content/blog/<slug>.md');
  process.exit(2);
}

const raw = readFileSync(file, 'utf8');
const body = stripFrontmatter(raw);
const prose = proseOf(body);
const lines = raw.split(/\r?\n/);

// --- pattern rules -----------------------------------------------------------

for (const rule of RULES) {
  const hits = [];
  lines.forEach((line, i) => {
    // Figures are ASCII art with their own rules; arrows there are deliberate.
    for (const match of line.matchAll(rule.pattern)) {
      hits.push({ line: i + 1, text: match[0].trim().slice(0, 70) });
    }
  });
  const shown = verbose ? hits : hits.slice(0, MAX_HITS_SHOWN);
  report(
    hits.length === 0,
    `${rule.label}: ${hits.length}`,
    shown.map((h) => `line ${h.line}: ${h.text}`),
  );
}

// --- wrap width --------------------------------------------------------------

const bodyOffset = lines.length - body.split(/\r?\n/).length;
const longLines = [];
let inFigure = false;
lines.forEach((line, i) => {
  if (/^<figure>/.test(line)) inFigure = true;
  if (/^<\/figure>/.test(line)) {
    inFigure = false;
    return;
  }
  if (inFigure || i < bodyOffset) return; // figures have their own rules; skip frontmatter
  if (line.length > WRAP_COLUMNS && !line.includes('http') && !line.startsWith('|')) {
    longLines.push(`line ${i + 1}: ${line.length} columns`);
  }
});
report(
  longLines.length === 0,
  `lines over ${WRAP_COLUMNS} columns: ${longLines.length}`,
  verbose ? longLines : longLines.slice(0, MAX_HITS_SHOWN),
);

// --- rhythm ------------------------------------------------------------------

const sentences = sentencesOf(prose);
const lengths = sentences.map((s) => s.split(/\s+/).length);
const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
const variance = lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length;
const burstiness = Math.sqrt(variance) / mean;
report(
  burstiness >= 0.4,
  `burstiness ${burstiness.toFixed(2)} (want 0.40 or more, ideally 0.50 to 0.70)`,
  [`${sentences.length} sentences, mean ${mean.toFixed(1)} words`],
);

const paragraphs = paragraphsOf(prose);
const paraSentences = paragraphs.map((p) => sentencesOf(p).length);
const hasShort = paraSentences.some((n) => n <= 2);
const hasLong = paraSentences.some((n) => n >= 6);
const varianceNote = [
  hasShort ? null : 'none of 2 sentences or fewer',
  hasLong ? null : 'none of 6 sentences or more',
]
  .filter(Boolean)
  .join(', ');
report(
  hasShort && hasLong,
  `paragraph variance: ${varianceNote || 'both short and long present'}`,
  [`${paragraphs.length} paragraphs, sentences each: ${paraSentences.join(' ')}`],
);

// --- connectives -------------------------------------------------------------

const CONNECTIVES =
  /^(?:furthermore|moreover|additionally|however|therefore|consequently|nevertheless|nonetheless|that said|in addition|on the other hand|ultimately|notably|importantly)\b/i;
const connectiveOpeners = paragraphs.filter((p) => CONNECTIVES.test(p));
const connectiveShare = connectiveOpeners.length / paragraphs.length;
report(
  connectiveShare <= 0.25,
  `paragraphs opening with a formal connective: ${connectiveOpeners.length} of ${
    paragraphs.length
  } (${(connectiveShare * 100).toFixed(0)}%, want 25% or less)`,
  connectiveOpeners.map((p) => p.slice(0, 60)).slice(0, MAX_HITS_SHOWN),
);

// --- something to point at ---------------------------------------------------

const POINTABLE = /\b\d|\b(?:19|20)\d\d\b|\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/;
const emptyParas = paragraphs.filter((p) => !POINTABLE.test(p));
const emptyShare = emptyParas.length / paragraphs.length;
report(
  emptyShare <= 0.65,
  `paragraphs with no number, year, or proper name: ${emptyParas.length} of ${
    paragraphs.length
  } (${(emptyShare * 100).toFixed(0)}%, want 65% or less)`,
  emptyParas.map((p) => p.slice(0, 60)).slice(0, MAX_HITS_SHOWN),
);

// --- headings ----------------------------------------------------------------

const headings = [...body.matchAll(/^##\s+(.*)$/gm)].map((m) => m[1].trim());
const firstWords = headings.map((h) => h.split(/\s+/)[0].toLowerCase());
const repeated = firstWords.filter((w, _, all) => all.filter((x) => x === w).length >= 3);
report(
  repeated.length === 0,
  `headings opening with the same word three times: ${repeated.length}`,
  [headings.join(' | ')],
);

const signposted = headings.filter((h) =>
  /^(?:conclusion|final thoughts|key takeaways|summary|looking ahead|introduction|challenges and)/i.test(
    h,
  ),
);
report(signposted.length === 0, `signposted summary headings: ${signposted.length}`, signposted);

const titleCase = headings.filter((h) => {
  // Drop the first word (always capitalised) and the pronoun "I", which is not
  // evidence of anything. What is left should be lowercase in sentence case.
  const words = h
    .split(/\s+/)
    .slice(1)
    .filter((w) => /^[A-Za-z]/.test(w) && w !== 'I');
  const capped = words.filter((w) => /^[A-Z]/.test(w));
  return words.length >= 3 && capped.length > words.length / 2;
});
report(titleCase.length === 0, `Title Case headings: ${titleCase.length}`, titleCase);

// --- length ------------------------------------------------------------------

const words = prose.split(/\s+/).filter(Boolean).length;
report(words >= 1100 && words <= 2100, `word count ${words} (house range 1100 to 2100)`, []);

// --- output ------------------------------------------------------------------

let failed = 0;
for (const f of findings) {
  if (f.ok) {
    console.log(`  ok    ${f.headline}`);
  } else {
    failed += 1;
    console.log(`  LOOK  ${f.headline}`);
    for (const d of f.detail) console.log(`          ${d}`);
  }
}
console.log(
  `\n${findings.length - failed} of ${findings.length} clean.` +
    (failed ? ` ${failed} worth a look. Nothing here is a verdict.` : ''),
);
