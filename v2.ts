import { InterestType, LeadEntityStatusType } from '@leadsend/storage';

export const EMAIL_CLASSIFICATION_NAME = 'mailer-classification.json';

export enum EmailLabel {
  interested = 'interested',
  meeting_booked = 'meeting_booked',
  meeting_completed = 'meeting_completed',
  won = 'won',
  out_of_office = 'out_of_office',
  wrong_person = 'wrong_person',
  not_interested = 'not_interested',
  lost = 'lost',
  unsubscribed = 'unsubscribed',
  bounced = 'bounced',
}

export class TrainingData {
  text: string;
  tag: string;
}

export class EmailTagInfo {
  label: string;
  confidence?: number;
  interestType?: string;
}

// ✅ Rule-based matchers added here
const matchers = {
  interested: [
    'interested',
    'send more info',
    'please share more details',
    'sounds good',
    'sounds interesting',
    'sounds promising',
    'sure, send',
    'please send',
    'i’d like to know more',
    'i would like to know more',
    'keen to learn more',
    'open to learn more',
  ],
  meeting_booked: [
    'calendar link',
    'here is my calendar',
    'meet you in the call',
    'looking forward to the call',
    'meeting booked',
    'scheduled a meeting',
    'added to calendar',
    'demo scheduled',
    'call confirmed',
    'zoom link',
    'teams link',
    'see you on',
  ],
  unsubscribed: [
    'unsubscribe',
    'remove me',
    'stop emailing',
    'gdpr',
    'opt-out',
    'do not contact',
    'stop all emails',
    'get lost',
    'fuck off',
    'block you',
  ],
  out_of_office: [
    'out of office',
    'on vacation',
    'on leave',
    'away from office',
    'traveling',
    'will respond after',
    'auto-reply',
    'limited email access',
  ],
  wrong_person: [
    'wrong person',
    'not the right contact',
    'not my responsibility',
    'not my department',
    'reach out to someone else',
    'i no longer handle',
    'contact john@',
    'please contact',
  ],
  not_interested: [
    'not interested',
    'no interest',
    'no thanks',
    'not a fit',
    'not a priority',
    'happy with current solution',
    'don’t contact again',
    'we’re good',
    'not looking to change',
    'already using',
    'not the right time',
    'irrelevant',
    'unrelated',
  ],
};

// ✅ Drop-in classifier function
export function classifyEmail(text: string): EmailTagInfo {
  const lowerText = text.toLowerCase();

  for (const keyword of matchers.unsubscribed) {
    if (lowerText.includes(keyword)) {
      return {
        label: EmailLabel.unsubscribed,
        interestType: InterestType.NEGATIVE,
        confidence: 0.99,
      };
    }
  }

  for (const keyword of matchers.out_of_office) {
    if (lowerText.includes(keyword)) {
      return {
        label: EmailLabel.out_of_office,
        interestType: InterestType.NEUTRAL,
        confidence: 0.95,
      };
    }
  }

  for (const keyword of matchers.wrong_person) {
    if (lowerText.includes(keyword)) {
      return {
        label: EmailLabel.wrong_person,
        interestType: InterestType.NEUTRAL,
        confidence: 0.95,
      };
    }
  }

  for (const keyword of matchers.meeting_booked) {
    if (lowerText.includes(keyword)) {
      return {
        label: EmailLabel.meeting_booked,
        interestType: InterestType.POSITIVE,
        confidence: 0.97,
      };
    }
  }

  for (const keyword of matchers.interested) {
    if (lowerText.includes(keyword)) {
      return {
        label: EmailLabel.interested,
        interestType: InterestType.POSITIVE,
        confidence: 0.96,
      };
    }
  }

  for (const keyword of matchers.not_interested) {
    if (lowerText.includes(keyword)) {
      return {
        label: EmailLabel.not_interested,
        interestType: InterestType.NEGATIVE,
        confidence: 0.90,
      };
    }
  }

  // Fallback if nothing matches
  return {
    label: EmailLabel.not_interested,
    interestType: InterestType.NEGATIVE,
    confidence: 0.50,
  };
}

// ✅ Original training data preserved (used for legacy/model training if needed)
export const trainingData: TrainingData[] = [
  {
    text: "Yes, I'm interested in learning more about your product",
    tag: EmailLabel.interested + '||' + InterestType.POSITIVE,
  },
  {
    text: 'Unsubscribe me from all future emails',
    tag: EmailLabel.unsubscribed + '||' + InterestType.NEGATIVE,
  },
  {
    text: 'Looking forward to our call tomorrow at 10am',
    tag: EmailLabel.meeting_booked + '||' + InterestType.POSITIVE,
  },
  {
    text: "I'm out of office until next Monday",
    tag: EmailLabel.out_of_office + '||' + InterestType.NEUTRAL,
  },
  {
    text: "I think you have the wrong person",
    tag: EmailLabel.wrong_person + '||' + InterestType.NEGATIVE,
  },
  {
    text: "We're not looking to make any changes at the moment",
    tag: EmailLabel.not_interested + '||' + InterestType.NEGATIVE,
  },
];
