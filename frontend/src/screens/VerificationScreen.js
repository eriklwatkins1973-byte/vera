/**
 * VerificationScreen
 *
 * Opens the Persona hosted verification flow inside a secure WebView.
 *
 * Flow:
 *   1. Call POST /api/verification/start to register the inquiry ID.
 *   2. Load the Persona verification URL in an in-app WebView.
 *   3. Detect the completion redirect and navigate to HomeScreen.
 *
 * Vera never receives or stores any document or biometric data – the entire
 * verification process happens within Persona's secure infrastructure.  Only
 * the boolean outcome is communicated back via webhook ("Verify & Shred").
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import VerificationBadge from '../components/VerificationBadge';

const API_BASE = process.env.API_BASE_URL || 'https://api.vera.social';
const PERSONA_COMPLETE_URL_PREFIX = 'https://withpersona.com/verify?status=complete';

export default function VerificationScreen({ navigation, route }) {
  const { token } = route.params;
  const [verifyUrl, setVerifyUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const startVerification = useCallback(async () => {
    setLoading(true);
    try {
      // In a real integration the mobile client generates a Persona inquiry
      // via the Persona SDK and obtains an inquiryId before calling this
      // endpoint.  Here we use a placeholder to illustrate the data flow.
      const placeholderInquiryId = `inq_${Date.now()}`;

      const res = await fetch(`${API_BASE}/api/verification/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ inquiryId: placeholderInquiryId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start verification');
      setVerifyUrl(data.verifyUrl);
    } catch (err) {
      Alert.alert('Verification error', err.message);
    } finally {
      setLoading(false);
    }
  }, [headers]); // headers object is derived from token; token is the only changing dep

  function handleNavigationChange(navState) {
    if (navState.url.startsWith(PERSONA_COMPLETE_URL_PREFIX)) {
      setVerifying(true);
      // Poll for the webhook-confirmed verification status
      pollVerificationStatus();
    }
  }

  async function pollVerificationStatus(attempts = 0) {
    if (attempts > 10) {
      Alert.alert('Verification pending', 'Verification is being processed. You will be notified when it is complete.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/verification/status`, { headers });
      const data = await res.json();
      if (data.age_verified) {
        navigation.navigate('Home', { token });
      } else {
        setTimeout(() => pollVerificationStatus(attempts + 1), 2000);
      }
    } catch {
      setTimeout(() => pollVerificationStatus(attempts + 1), 2000);
    }
  }

  if (verifying) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color="#d4af37" size="large" />
          <Text style={styles.verifyingText}>Confirming your age…</Text>
          <Text style={styles.verifyingNote}>
            Your ID documents are processed by Persona and are never stored by Vera.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (verifyUrl) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <WebView
          source={{ uri: verifyUrl }}
          onNavigationStateChange={handleNavigationChange}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webviewLoading}>
              <ActivityIndicator color="#d4af37" size="large" />
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <VerificationBadge />
        <Text style={styles.title}>Age Verification</Text>
        <Text style={styles.body}>
          To keep Vera a safe, adult-only space, we require a one-time age
          verification.{'\n\n'}
          Your ID is reviewed by our verification partner (Persona) and is{' '}
          <Text style={styles.bold}>never transmitted to or stored by Vera</Text>.
          {'\n\n'}
          This is the "Verify & Shred" protocol: only a pass/fail signal
          reaches us.
        </Text>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={startVerification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0d0d0d" />
          ) : (
            <Text style={styles.buttonText}>Start Verification</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d0d' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 24 },
  body: { color: '#aaa', fontSize: 15, lineHeight: 24, marginTop: 16 },
  bold: { color: '#d4af37', fontWeight: '700' },
  button: { backgroundColor: '#d4af37', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 40 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#0d0d0d', fontWeight: '700', fontSize: 16 },
  webviewLoading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0d0d' },
  verifyingText: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 24 },
  verifyingNote: { color: '#888', textAlign: 'center', marginTop: 12, lineHeight: 20 },
});
