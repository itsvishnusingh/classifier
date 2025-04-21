/* ------------------------------------------------------------------ */
/*  MICRO‑SIMILARITY FALLBACK                                          */
/* ------------------------------------------------------------------ */

const STOP_WORDS = new Set([
  'the','a','an','to','for','of','and','in','on','at','is','it','this','that',
  'i','i\'m','we','you','our','your','with','be','as','are','was','were','can',
  'could','would','should','have','has','had','will','shall','do','does','did',
  'from','by','about','please','thanks','thank','hi','hello'
]);

/** Very simple tokenizer → lower‑case words, no punctuation, stop‑words removed */
function tokenize(txt: string): string[] {
  return txt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !STOP_WORDS.has(w));
}

/** Jaccard similarity between two token sets */
function jaccard(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

/* Pre‑tokenise training corpus once at module load */
type CorpusItem = { tag: string; tokens: Set<string> };
const CORPUS: CorpusItem[] = trainingData.map(({ tag, text }) => ({
  tag,
  tokens: new Set(tokenize(text)),
}));

/* ------------------------------------------------------------------ */
/*  UPDATED classifyEmail                                              */
/* ------------------------------------------------------------------ */

export function classifyEmail(text: string | null | undefined): EmailTagInfo {
  /* 0️⃣  Null / empty guard */
  if (!text) {
    return { label: EmailLabel.not_interested, confidence: 0.1, interestType: InterestType.NEGATIVE };
  }

  const normalized = text.trim();

  /* 1️⃣  RULE‑BASED PASS */
  for (const [label, patterns] of Object.entries(PATTERN_MAP)) {
    if (patterns.some((re) => re.test(normalized))) {
      return {
        label,
        confidence: 0.95,
        interestType: INTEREST_MAP[label] ?? InterestType.NEUTRAL,
      };
    }
  }

  /* 2️⃣  FUZZY‑MATCH PASS */
  const tokensIncoming = new Set(tokenize(normalized));
  let bestScore = 0;
  let bestTag: string | null = null;

  for (const { tag, tokens } of CORPUS) {
    const score = jaccard(tokensIncoming, tokens);
    if (score > bestScore) {
      bestScore = score;
      bestTag = tag;
    }
  }

  if (bestTag && bestScore >= 0.25) {
    const [label] = bestTag.split('||');
    return {
      label,
      confidence: Number(bestScore.toFixed(2)),
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
