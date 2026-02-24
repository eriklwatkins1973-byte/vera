import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useStripeIdentity } from '@stripe/stripe-identity-react-native';

/**
 * VERA ENTRANCE GATE
 * The first screen a new user sees.
 * Combines the $3.99 "Founding Member" fee and Age Verification.
 */

const EntranceGate = ({ onAccessGranted }) => {
  const { presentPaymentSheet } = useStripe();
  const { present: presentIdentitySheet, loading: idLoading } = useStripeIdentity();
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. PROCESS THE $3.99 PAYMENT
  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // In a real app, you'd fetch paymentIntent from your /backend
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert('Payment Cancelled', error.message);
        return;
      }

      // Payment successful, now trigger ID verification
      await handleVerification();
    } catch (error) {
      Alert.alert('Payment Error', error.message || 'Unable to process payment.');
      setIsProcessing(false);
    }
  };

  // 2. TRIGGER THE ID VERIFICATION
  const handleVerification = async () => {
    try {
      const { status } = await presentIdentitySheet();

      if (status === 'FlowCompleted') {
        Alert.alert('Success', 'Age Verified. ID data has been shredded.');
        onAccessGranted(); // Unlock the app
      } else {
        Alert.alert('Verification Required', 'Vera is an adults-only community.');
      }
    } catch (error) {
      Alert.alert('Verification Error', error.message || 'Unable to complete verification.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>VERA</Text>
      <Text style={styles.tagline}>The Sovereign Adult Network</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Become a Founding Member</Text>
        <Text style={styles.cardText}>
          One-time $3.99 verification fee. Includes 6 months of ad-free,
          privacy-first access. No bots. No minors.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handlePayment}
          disabled={isProcessing || idLoading}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Verify & Enter — $3.99</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Privacy Policy: We shred all ID data after verification.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 20 },
  logo: { color: '#FFF', fontSize: 42, fontWeight: 'bold', textAlign: 'center', letterSpacing: 5 },
  tagline: { color: '#888', textAlign: 'center', marginBottom: 50, fontSize: 14 },
  card: { backgroundColor: '#111', padding: 30, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  cardTitle: { color: '#FFF', fontSize: 20, fontWeight: '600', marginBottom: 10 },
  cardText: { color: '#AAA', lineHeight: 22, marginBottom: 25 },
  button: { backgroundColor: '#FFF', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  footer: { color: '#444', fontSize: 11, textAlign: 'center', marginTop: 30 },
});

export default EntranceGate;
