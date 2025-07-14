import { SubscriptionPlan } from '@/types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 'Free',
    cardsLimit: 5,
    features: ['3 Days Access', 'Basic OCR', 'Export to CSV']
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$19.99/year',
    cardsLimit: 100,
    features: ['100 Cards', 'Advanced OCR', 'Export to Sheets', 'Email Support']
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$24.99/year',
    cardsLimit: 250,
    features: ['250 Cards', 'Advanced OCR', 'Export to Sheets', 'Priority Support']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$36.99/year',
    cardsLimit: 500,
    features: ['500 Cards', 'Advanced OCR', 'All Export Options', 'Premium Support']
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$49.99/year',
    cardsLimit: Infinity,
    features: ['Unlimited Cards', 'Advanced OCR', 'All Export Options', 'Premium Support', 'Team Sharing']
  }
];

export const FREE_TRIAL_DAYS = 3;