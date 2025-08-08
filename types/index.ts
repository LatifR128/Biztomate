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
  _fallbackId?: string; // Optional identifier for fallback data
  _isFallback?: boolean; // Enhanced fallback flag
  _manualOverride?: boolean; // Flag for manually added duplicates
  deviceId?: string; // Device identifier for tracking
  deviceLabel?: string; // Human-readable device name
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  subscriptionPlan: 'free' | 'basic' | 'standard' | 'premium' | 'unlimited';
  subscriptionEndDate?: number;
  trialEndDate?: number;
  scannedCards: number;
  maxCards: number;
  createdAt: number;
  updatedAt: number;
}

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: string;
  cardsLimit: number;
  productId: string;
  features: string[];
};
