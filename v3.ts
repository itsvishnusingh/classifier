import { InterestType, LeadEntityStatusType } from '@leadsend/storage';

/* ------------------------------------------------------------------ */
/*  ENUMS & DATA (unchanged)                                          */
/* ------------------------------------------------------------------ */

export const EMAIL_CLASSIFICATION_NAME = 'mailer-classification.json';

export enum EmailLabel {
  interested       = 'interested',
  meeting_booked   = 'meeting_booked',
  meeting_completed= 'meeting_completed',
  won              = 'won',
  out_of_office    = 'out_of_office',
  wrong_person     = 'wrong_person',
  not_interested   = 'not_interested',
  lost             = 'lost',
}

export class TrainingData {
  text!: string;
  tag!: string;
}

export class EmailTagInfo {
  label?: string;
  confidence?: number;          // 0‑1
  interestType?: InterestType;
}

/* keep your existing hand‑curated examples here … */
export const trainingData: TrainingData[] = [ /* …unchanged… */ ];

/* ------------------------------------------------------------------ */
/*  REGEX‑BASED RULE ENGINE                                           */
/* ------------------------------------------------------------------ */

/** Ordered from the *strongest* (riskiest to mis‑label) to the weakest. */
const PATTERN_MAP: Record<string, RegExp[]> = {
  /* unsubscribe / opt‑out */
  [LeadEntityStatusType.UNSUBSCRIBED]: [
    /\bunsubscribe\b/i, /\bopt[- ]?out\b/i, /remove me/i, /stop all (emails?|emailing)/i,
    /\b(no further|any more) emails?\b/i, /gdpr\b/i, /\bdelete my data\b/i,
  ],

  /* bounced / permanent failure */
  [LeadEntityStatusType.BOUNCED]: [
    /address (not found|invalid)/i, /does not exist/i, /mailbox.+full/i,
    /\b550\b.*(invalid|unknown)/i, /\bquota exceeded\b/i, /delivery failed/i,
  ],

  /* out of office / auto‑reply */
  [EmailLabel.out_of_office]: [
    /out of (the )?office/i, /\bOOO\b/i, /away from (my|the) desk/i, /limited email access/i,
    /on (annual|sick|parental|medical) leave/i, /returning on/i, /\bvacation\b/i,
    /auto(\s|-)reply/i,
  ],

  /* wrong person / role moved */
  [EmailLabel.wrong_person]: [
    /wrong (person|contact|department)/i, /not the right (contact|person)/i,
    /no longer (handle|responsible)/i, /please contact .* instead/i,
    /moved to (a )?new (role|position)/i, /reach(ed)? the incorrect/i,
  ],

  /* explicit NOT interested */
  [EmailLabel.not_interested]: [
    /\bnot (interested|a fit|required)\b/i, /no (need|thanks|interest)/i,
    /happy with (current|existing)/i, /already (using|have) .*solution/i,
    /do ?n'?t contact/i, /\bremove\b.*list/i, /\bstop\b.*(email|message)/i,
  ],

  /* meeting booked – contains calendar links, invites, or explicit scheduling */
  [EmailLabel.meeting_booked]: [
    /calendar (link|invite)/i, /\bschedule (a )?(call|meeting|demo)\b/i,
    /\blooking forward to our (call|meeting)\b/i, /\binvite sent\b/i,
    /confirmed[:\-]? .* (call|demo|meeting)/i, /see you (on|tomorrow|then)/i,
  ],

  /* deal won / clear go‑ahead */
  [EmailLabel.won]: [
    /\bread[y|y to] to (sign|move forward|proceed|buy|purchase)/i,
    /processing (the )?payment/i, /contract (signed|attached|returned)/i,
    /\bselected\b.*proposal/i, /\bapproval\b.*received/i,
  ],

  /* interested but not yet booked */
  [EmailLabel.interested]: [
    /\binterested\b/i, /\bsounds (good|great|interesting|promising)\b/i,
    /(send|share).* (more )?(info|information|details|pricing)/i,
    /tell me more/i, /\bpricing\b/i, /like to (discuss|evaluate)/i,
    /\bproof of concept\b/i, /\blooks promising\b/i,
  ],
} as const;

/* Helper to map our label to InterestType */
const INTEREST_MAP: Record<string, InterestType> = {
  [EmailLabel.interested]:        InterestType.POSITIVE,
  [EmailLabel.meeting_booked]:    InterestType.POSITIVE,
  [EmailLabel.meeting_completed]: InterestType.POSITIVE,
  [EmailLabel.won]:               InterestType.POSITIVE,

  [EmailLabel.out_of_office]:     InterestType.NEUTRAL,
  [EmailLabel.wrong_person]:      InterestType.NEGATIVE,

  [EmailLabel.not_interested]:    InterestType.NEGATIVE,
  [EmailLabel.lost]:              InterestType.NEGATIVE,

  [LeadEntityStatusType.UNSUBSCRIBED]: InterestType.NEGATIVE,
  [LeadEntityStatusType.BOUNCED]:      InterestType.NEGATIVE,
};

/* ------------------------------------------------------------------ */
/*  PUBLIC API                                                        */
/* ------------------------------------------------------------------ */

/**
 * Lightweight classifier:
 *   • runs deterministic regex rules in strict order
 *   • returns first match; else falls back to NOT_INTERESTED | NEGATIVE
 */
export function classifyEmail(text: string | null | undefined): EmailTagInfo {
  if (!text) {
    return { label: EmailLabel.not_interested, confidence: 0.1, interestType: InterestType.NEGATIVE };
  }

  const normalized = text.trim();

  for (const [label, patterns] of Object.entries(PATTERN_MAP)) {
    if (patterns.some((re) => re.test(normalized))) {
      return {
        label,
        confidence: 0.95,                 // deterministic match
        interestType: INTEREST_MAP[label] ?? InterestType.NEUTRAL,
      };
    }
  }

  /* Fallback – safest default */
  return {
    label: EmailLabel.not_interested,
    confidence: 0.25,
    interestType: InterestType.NEGATIVE,
  };
}
