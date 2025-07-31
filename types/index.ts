export interface BusinessCard {
  id: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  notes?: string;
  imageUri?: string;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  subscriptionPlan: 'free' | 'basic' | 'standard' | 'premium' | 'unlimited';
  subscriptionEndDate?: number;
  trialEndDate?: number;
  scannedCards: number;
  maxCards: number;
}

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: string;
  cardsLimit: number;
  productId: string;
  features: string[];
};