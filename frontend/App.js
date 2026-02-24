/**
 * Vera – App entry point
 *
 * Navigator flow:
 *   Onboarding → Payment (join fee) → Verification (Persona) → Home
 *
 * The `VerificationNavigator` and `HomeNavigator` are gated by the
 * `requireVerifiedSubscriber` logic on the backend; unauthenticated or
 * unverified users are redirected to the appropriate onboarding step.
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import AppNavigator from './src/navigation/AppNavigator';

const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

export default function App() {
  return (
    <SafeAreaProvider>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </StripeProvider>
    </SafeAreaProvider>
  );
}
