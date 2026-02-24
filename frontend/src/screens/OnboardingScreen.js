/**
 * OnboardingScreen
 *
 * Welcome screen that explains Vera's value proposition and collects the
 * user's email and password to create an account.  No personal information
 * beyond these credentials is collected at this stage.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE = process.env.API_BASE_URL || 'https://api.vera.social';

export default function OnboardingScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and a password.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      navigation.navigate('Payment', { token: data.token, userId: data.userId });
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.logo}>VERA</Text>
          <Text style={styles.tagline}>Verified. Ad-Free. Adults Only.</Text>
          <Text style={styles.subtitle}>
            Canada's first sovereign adult social network – no ads, no bots,
            no data harvesting.
          </Text>

          <View style={styles.badges}>
            {['18+ Verified', 'Zero PII Stored', 'No Ads Ever'].map((b) => (
              <View key={b} style={styles.badge}>
                <Text style={styles.badgeText}>{b}</Text>
              </View>
            ))}
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#888"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 8 characters"
              placeholderTextColor="#888"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account – $3.99</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.fine}>
              One-time $3.99 CAD join fee · $0.99/mo after · Cancel anytime
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d0d' },
  flex: { flex: 1 },
  container: { alignItems: 'center', padding: 24, paddingBottom: 48 },
  logo: { fontSize: 52, fontWeight: '900', color: '#fff', letterSpacing: 8, marginTop: 32 },
  tagline: { fontSize: 14, color: '#bbb', marginTop: 6, letterSpacing: 2 },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 16, lineHeight: 20 },
  badges: { flexDirection: 'row', marginTop: 24, gap: 8 },
  badge: { backgroundColor: '#1a1a1a', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#333' },
  badgeText: { color: '#d4af37', fontSize: 11, fontWeight: '600' },
  form: { width: '100%', marginTop: 40 },
  label: { color: '#aaa', fontSize: 12, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  button: { backgroundColor: '#d4af37', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#0d0d0d', fontWeight: '700', fontSize: 16 },
  fine: { textAlign: 'center', color: '#666', fontSize: 11, marginTop: 12 },
});
