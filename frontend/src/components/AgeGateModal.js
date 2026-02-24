/**
 * AgeGateModal
 *
 * A full-screen overlay shown when an unauthenticated or unverified user
 * attempts to access a gated screen.  Redirects to the onboarding flow.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function AgeGateModal({ visible, onVerify, onDismiss }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🔞</Text>
          <Text style={styles.title}>Adults Only</Text>
          <Text style={styles.body}>
            Vera is an 18+ platform. You must verify your age before
            accessing this content.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onVerify}>
            <Text style={styles.buttonText}>Verify My Age</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDismiss}>
            <Text style={styles.cancel}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 32, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#333' },
  emoji: { fontSize: 48 },
  title: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 12 },
  body: { color: '#aaa', textAlign: 'center', marginTop: 12, lineHeight: 20 },
  button: { backgroundColor: '#d4af37', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 24 },
  buttonText: { color: '#0d0d0d', fontWeight: '700', fontSize: 16 },
  cancel: { color: '#666', marginTop: 16, fontSize: 14 },
});
