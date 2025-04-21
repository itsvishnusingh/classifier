/* ------------------------------------------------------------------ */
/*  NAÏVE‑BAYES FALLBACK (no libs, ~60 lines)                          */
/* ------------------------------------------------------------------ */

const STOP = new Set([
  'the','a','an','to','for','of','and','in','on','at','is','it','this','that',
  'i','im','i\'m','we','you','our','your','with','be','as','are','was','were',
  'can','could','would','should','have','has','had','will','shall','do','does',
  'did','from','by','about','please','thanks','thank','hi','hello'
]);

function tokens(txt: string): string[] {
  return txt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter(w => !STOP.has(w));
}

/** Build label→word‑freq and priors from trainingData */
type Stats = { total: number; freq: Record<string, number>; prior: number };
const MODEL: Record<string, Stats> = {};
let vocabSize = 0;

(function buildModel() {
  const labelCounts: Record<string, number> = {};
  for (const { tag, text } of trainingData) {
    const [label] = tag.split('||');
    labelCounts[label] = (labelCounts[label] ?? 0) + 1;
    const s = MODEL[label] ?? (MODEL[label] = { total: 0, freq: {}, prior: 0 });
    for (const t of tokens(text)) {
      s.freq[t] = (s.freq[t] ?? 0) + 1;
      s.total += 1;
    }
  }
  vocabSize = new Set(Object.values(MODEL).flatMap(m => Object.keys(m.freq))).size;
  const totalDocs = trainingData.length;
  for (const [label, count] of Object.entries(labelCounts)) {
    MODEL[label].prior = Math.log(count / totalDocs);
  }
})();

/** Return best label + margin between #1 and #2 (to gauge confidence) */
function bayesClassify(txt: string): { label: string; margin: number } | null {
  const tks = tokens(txt);
  if (!tks.length) return null;

  const scores: [string, number][] = [];
  for (const [label, { freq, total, prior }] of Object.entries(MODEL)) {
    let logProb = prior;
    for (const w of tks) {
      const count = freq[w] ?? 0;
      // Laplace smoothing
      logProb += Math.log((count + 1) / (total + vocabSize));
    }
    scores.push([label, logProb]);
  }
  scores.sort((a, b) => b[1] - a[1]); // descending
  const [best, second] = scores;
  return best ? { label: best[0], margin: (best[1] - (second?.[1] ?? -Infinity)) } : null;
}

/* ------------------------------------------------------------------ */
/*  UPDATED classifyEmail (rule + bayes + fallback)                    */
/* ------------------------------------------------------------------ */

export function classifyEmail(text: string | null | undefined): EmailTagInfo {
  if (!text) {
    return { label: EmailLabel.not_interested, confidence: 0.1, interestType: InterestType.NEGATIVE };
  }
  const normalized = text.trim();

  /* 1️⃣  RULE ENGINE */
  for (const [label, patterns] of Object.entries(PATTERN_MAP)) {
    if (patterns.some(re => re.test(normalized))) {
      return {
        label,
        confidence: 0.95,
        interestType: INTEREST_MAP[label] ?? InterestType.NEUTRAL,
      };
    }
  }

  /* 2️⃣  BAYES BACKSTOP */
  const bayes = bayesClassify(normalized);
  if (bayes && bayes.margin >= 1.0) {          // margin threshold avoids wobbly picks
    const label = bayes.label;
    return {
      label,
      confidence: Number(Math.min(0.9, 0.5 + bayes.margin / 4).toFixed(2)),
      interestType: INTEREST_MAP[label] ?? InterestType.NEUTRAL,
    };
  }

  /* 3️⃣  SAFE FALLBACK */
  return {
    label: EmailLabel.not_interested,
    confidence: 0.25,
    interestType: InterestType.NEGATIVE,
  };
}
