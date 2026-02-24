/**
 * PaymentScreen
 *
 * Handles the one-time $3.99 CAD join fee via Stripe's Payment Sheet,
 * supporting Apple Pay and Google Pay natively.
 *
 * Flow:
 *   1. Create a Stripe customer on the backend.
 *   2. Fetch a PaymentIntent clientSecret from POST /api/payment/join.
 *   3. Present Stripe's native Payment Sheet.
 *   4. On success navigate to VerificationScreen.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStripe } from '@stripe/stripe-react-native';

const API_BASE = process.env.API_BASE_URL || 'https://api.vera.social';

export default function PaymentScreen({ navigation, route }) {
  const { token } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(true);
  const [paymentReady, setPaymentReady] = useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const initSheet = useCallback(async () => {
    try {
      // Step 1 – Create Stripe customer
      const custRes = await fetch(`${API_BASE}/api/payment/create-customer`, {
        method: 'POST',
        headers,
      });
      if (!custRes.ok) throw new Error('Could not initialise payment');

      // Step 2 – Create PaymentIntent
      const intentRes = await fetch(`${API_BASE}/api/payment/join`, {
        method: 'POST',
        headers,
      });
      const { clientSecret } = await intentRes.json();
      if (!clientSecret) throw new Error('Could not create payment intent');

      // Step 3 – Initialise Payment Sheet
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Vera Social Inc.',
        applePay: { merchantCountryCode: 'CA' },
        googlePay: { merchantCountryCode: 'CA', testEnv: __DEV__ },
        style: 'alwaysDark',
      });
      if (error) throw new Error(error.message);
      setPaymentReady(true);
    } catch (err) {
      Alert.alert('Payment setup failed', err.message);
    } finally {
      setLoading(false);
    }
  }, [headers, initPaymentSheet]); // headers is derived from token; initPaymentSheet is stable

  useEffect(() => {
    initSheet();
  }, [initSheet]);

  async function handlePay() {
    const { error } = await presentPaymentSheet();
    if (error) {
      Alert.alert('Payment failed', error.message);
      return;
    }
    navigation.navigate('Verification', { token });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Join Vera</Text>
        <Text style={styles.subtitle}>One-time entry fee</Text>

        <View style={styles.priceCard}>
          <Text style={styles.price}>$3.99 CAD</Text>
          <Text style={styles.priceNote}>+ $0.99 / month after verification</Text>
        </View>

        <View style={styles.features}>
          {[
            '✓  Zero ads – ever',
            '✓  100% human, verified adults',
            '✓  Your data is never sold',
            '✓  Cancel anytime',
          ].map((f) => (
            <Text key={f} style={styles.feature}>{f}</Text>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color="#d4af37" size="large" style={{ marginTop: 40 }} />
        ) : (
          <TouchableOpacity
            style={[styles.button, !paymentReady && styles.buttonDisabled]}
            onPress={handlePay}
            disabled={!paymentReady}
          >
            <Text style={styles.buttonText}>Pay $3.99 & Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d0d' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', textAlign: 'center' },
  subtitle: { color: '#888', textAlign: 'center', marginTop: 8, fontSize: 14 },
  priceCard: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 32, borderWidth: 1, borderColor: '#333' },
  price: { fontSize: 42, fontWeight: '900', color: '#d4af37' },
  priceNote: { color: '#888', marginTop: 8, fontSize: 13 },
  features: { marginTop: 32, gap: 12 },
  feature: { color: '#ccc', fontSize: 15 },
  button: { backgroundColor: '#d4af37', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 40 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#0d0d0d', fontWeight: '700', fontSize: 16 },
});
