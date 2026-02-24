/**
 * VerificationBadge
 *
 * A small "18+ Verified" badge displayed next to any verified user's profile.
 * Renders a compact single-line badge or a pill depending on the `small` prop.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function VerificationBadge({ small = false }) {
  return (
    <View style={[styles.badge, small && styles.badgeSmall]}>
      <Text style={[styles.text, small && styles.textSmall]}>✓ 18+ Verified</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#1f2e1f',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#4caf50',
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    color: '#4caf50',
    fontSize: 12,
    fontWeight: '700',
  },
  textSmall: {
    fontSize: 10,
  },
});
