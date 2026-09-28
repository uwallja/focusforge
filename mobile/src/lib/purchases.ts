// RevenueCat placeholder facade.
//
// FocusForge stores its premium flag locally (see store.ts) so the app is fully
// functional without a network. This module is the single integration point for
// react-native-purchases. To enable real purchases:
//
//   1. npm install react-native-purchases
//   2. Add your RevenueCat API key / entitlement IDs below.
//   3. Uncomment the SDK wiring and replace the mock body.
//
// Real in-app purchases only run in a development/production EAS build.
// The web preview and Expo Go always return mock data here.

export interface PremiumOffering {
  id: string;
  title: string;
  price: string;
  period: string;
  perks: string[];
}

export const PREMIUM_PERKS = [
  'Unlimited courses',
  'Custom focus intervals',
  'Advanced analytics',
  'Premium themes',
  'Goal forecasting',
  'Future cloud sync',
];

export const MOCK_OFFERINGS: PremiumOffering[] = [
  {
    id: 'premium_monthly',
    title: 'Monthly plan',
    price: '$4.99',
    period: 'per month',
    perks: PREMIUM_PERKS,
  },
  {
    id: 'premium_yearly',
    title: 'Annual plan',
    price: '$29.99',
    period: 'per year',
    perks: PREMIUM_PERKS,
  },
  {
    id: 'premium_lifetime',
    title: 'Lifetime plan',
    price: '$79.99',
    period: 'one-time',
    perks: [...PREMIUM_PERKS, 'Lifetime access'],
  },
];

export const DEMO_MODE_MESSAGE = 'Demo Mode - Purchases are not connected.';

let initialized = false;

export async function initPurchases(): Promise<void> {
  // Placeholder — real impl:
  // import Purchases from 'react-native-purchases';
  // Purchases.configure({ apiKey: 'your_public_sdk_key' });
  if (process.env.EXPO_PUBLIC_RAPIDNATIVE_MODE) {
    initialized = true;
    return;
  }
  initialized = true;
}

export async function getOfferings(): Promise<PremiumOffering[]> {
  await initPurchases();
  // Placeholder — real impl:
  // const offerings = await Purchases.getOfferings();
  // return offering.availablePackages.map(...)
  return MOCK_OFFERINGS;
}

export async function purchaseOffering(
  _offeringId: string,
): Promise<{ success: boolean; entitlementId?: string }> {
  // Placeholder — real impl:
  // const { customerInfo } = await Purchases.purchasePackage(pkg);
  // return { success: customerInfo.entitlements.active['premium'] !== undefined }
  return { success: true, entitlementId: 'premium' };
}

export async function restorePurchases(): Promise<boolean> {
  // Placeholder — real impl:
  // const customerInfo = await Purchases.restorePurchases();
  // return customerInfo.entitlements.active['premium'] !== undefined
  return false;
}
