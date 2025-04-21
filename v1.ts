import { InterestType, LeadEntityStatusType } from '@leadsend/storage';

export enum EmailLabel {
  interested = 'interested',
  meeting_booked = 'meeting_booked',
  won = 'won',
  out_of_office = 'out_of_office',
  wrong_person = 'wrong_person',
  not_interested = 'not_interested',
  lost = 'lost',
  unsubscribed = 'unsubscribed',
  bounced = 'bounced',
}

export interface EmailTagInfo {
  label: EmailLabel;
  interestType: InterestType;
  confidence: number; // Between 0 and 1
}

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

  // Default fallback
  return {
    label: EmailLabel.not_interested,
    interestType: InterestType.NEGATIVE,
    confidence: 0.50,
  };
}
