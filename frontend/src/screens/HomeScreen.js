/**
 * HomeScreen
 *
 * Main social feed screen – only reachable by a user who is:
 *   - age_verified = TRUE
 *   - subscription_active = TRUE
 *
 * The backend enforces these constraints via the `requireVerifiedSubscriber`
 * middleware on all social-feature API endpoints.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VerificationBadge from '../components/VerificationBadge';

const PLACEHOLDER_POSTS = [
  { id: '1', author: 'vera_team', body: 'Welcome to Vera 🎉 – the first 100% verified adult social network in Canada. No bots. No ads. Just real people.' },
  { id: '2', author: 'policy_update', body: 'Your data is yours. Vera collects no PII and runs on a subscription model – your activity is never sold.' },
];

export default function HomeScreen() {
  function renderPost({ item }) {
    return (
      <View style={styles.post}>
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.author[0].toUpperCase()}</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.author}>@{item.author}</Text>
            <VerificationBadge small />
          </View>
        </View>
        <Text style={styles.postBody}>{item.body}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>VERA</Text>
        <VerificationBadge />
      </View>
      <FlatList
        data={PLACEHOLDER_POSTS}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.feed}
      />
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d0d0d' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  logo: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 4 },
  feed: { padding: 16, gap: 12 },
  post: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#d4af37', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#0d0d0d', fontWeight: '700' },
  authorInfo: { marginLeft: 10 },
  author: { color: '#fff', fontWeight: '600' },
  postBody: { color: '#ccc', lineHeight: 20 },
  fab: { position: 'absolute', bottom: 32, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#d4af37', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  fabText: { fontSize: 28, color: '#0d0d0d', lineHeight: 32 },
});
