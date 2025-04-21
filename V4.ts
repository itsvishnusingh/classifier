/* ------------------------------------------------------------------ */
/*  REGEX‑BASED RULE ENGINE – EXTENDED PHRASE LIBRARY                 */
/* ------------------------------------------------------------------ */

const PATTERN_MAP: Record<string, RegExp[]> = {
  /* 1️⃣  Unsubscribe / Opt‑out */
  [LeadEntityStatusType.UNSUBSCRIBED]: [
    /\bunsubscribe\b/i, /\bopt[- ]?out\b/i, /remove (me|us)/i,
    /stop (all )?(emails?|emailing|messages)/i, /no (more|further) emails?/i,
    /gdpr\b/i, /delete my (data|info)/i, /\b(cease|desist)\b/i,
    /\bforget me\b/i, /\bprivacy request\b/i,
  ],

  /* 2️⃣  Bounced / Delivery failure */
  [LeadEntityStatusType.BOUNCED]: [
    /address (not found|invalid|unknown)/i, /does not exist/i,
    /user (unknown|not found)/i, /mailbox (is )?full/i,
    /\b550\b.*(invalid|unknown|user)/i, /quota exceeded/i,
    /delivery (failed|failure)/i, /permanent failure/i,
    /domain .+ not found/i, /host .+ unreachable/i,
  ],

  /* 3️⃣  Out‑of‑office & Auto‑replies */
  [EmailLabel.out_of_office]: [
    /out of (the )?office/i, /\bOOO\b/i, /on (annual|sick|parental) leave/i,
    /away from (my )?desk/i, /limited email access/i, /returning on/i,
    /\bvacation\b/i, /back (on|by) .* (monday|tuesday|wednesday|thursday|friday)/i,
    /auto(\s|-)reply/i, /on PTO\b/i, /bank holiday/i, /public holiday/i,
    /office closed/i,
  ],

  /* 4️⃣  Wrong person / Mis‑routed */
  [EmailLabel.wrong_person]: [
    /wrong (person|contact|department)/i, /not the right (contact|person)/i,
    /no longer (handle|responsible|with)/i, /moved to (a )?new (role|position)/i,
    /please contact (.+) instead/i, /reach out to/i, /forwarding to/i,
    /cc['’]d? the (appropriate|correct)/i, /I’m not decision maker/i,
    /procurement/i, /try sales@/i, /please email .+@.+\./i,
  ],

  /* 5️⃣  Explicit NOT interested / Negative */
  [EmailLabel.not_interested]: [
    /\bnot (interested|a fit|required|relevant|needed)\b/i,
    /\bno (need|thanks|interest|budget)\b/i, /we'?ll pass/i, /pass for now/i,
    /happy with (current|existing)/i, /(already|currently) using/i,
    /using competitor/i, /\bdeclin(e|ing)\b/i, /not a priority/i,
    /stop contacting/i, /please (remove|delete) (me|us)/i,
  ],

  /* 6️⃣  Meeting booked / Scheduling */
  [EmailLabel.meeting_booked]: [
    /calendar (link|invite|slot|event)/i, /\bschedule (a )?(call|meeting|demo)\b/i,
    /here'?s? my (calendly|scheduler|hubspot link)/i,
    /book(ed)? (a )?(slot|time)/i, /invite sent\b/i, /invite attached\b/i,
    /confirmed[:\-]?\s.*(call|demo|meeting)/i, /looking forward to our (call|meeting)/i,
    /see you (on|tomorrow|then)/i, /(zoom|teams|google meet) link/i,
  ],

  /* 7️⃣  Deal won */
  [EmailLabel.won]: [
    /\bready to (sign|move forward|proceed|buy|purchase)\b/i,
    /processing (the )?payment/i, /payment (processed|sent)/i,
    /contract (signed|attached|returned)/i, /approved\b.*budget/i,
    /\bPO\b.*(attached|issued)/i, /generated purchase order/i,
    /kick[- ]?off\b/i, /let'?s start implementation/i, /onboard us/i,
  ],

  /* 8️⃣  Interested but not booked */
  [EmailLabel.interested]: [
    /\binterested\b/i, /\bsounds (good|great|interesting|promising|like a plan)\b/i,
    /(send|share|provide).* (more )?(info|information|details|deck|pricing|quote)/i,
    /(could|can) you (send|share|provide)/i, /tell me more/i, /keen to/i,
    /\bpricing\b/i, /like to (discuss|evaluate|know)/i,
    /\bproof of concept\b/i, /looks (promising|great|good)\b/i,
    /\bnext steps\b/i, /\bwhat’s involved\b/i, /love to learn\b/i,
    /sounds like a fit\b/i, /(sure|okay),? (send|share) (it|them|over)/i,
    /please advise\b/i, /curious to\b/, /open to\b/,
  ],
} as const;
