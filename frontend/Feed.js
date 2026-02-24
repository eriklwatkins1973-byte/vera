import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * VERA CHRONOLOGICAL FEED
 * Features:
 * 1. Zero-Algorithm (Strictly time-based)
 * 2. Blur-by-Default for NSFW content
 * 3. Minimalist "Ad-Free" Design
 */

const DUMMY_DATA = [
  {
    id: '1',
    user: 'founding_member_01',
    content: 'Finally, a place without bots. The air is cleaner here.',
    timestamp: '2m ago',
    isAdult: false,
  },
  {
    id: '2',
    user: 'vera_official',
    content: 'Welcome to the Sovereignty. Your ID has been shredded.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
    timestamp: '15m ago',
    isAdult: false,
  },
  {
    id: '3',
    user: 'creative_soul',
    content: 'Experimental photography (Uncensored).',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
    timestamp: '1h ago',
    isAdult: true,
  },
];

const Post = ({ item }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Text style={styles.username}>@{item.user}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>

      <Text style={styles.postText}>{item.content}</Text>

      {item.image && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            blurRadius={item.isAdult && !revealed ? 50 : 0}
          />

          {item.isAdult && !revealed && (
            <TouchableOpacity
              style={styles.blurOverlay}
              onPress={() => setRevealed(true)}
            >
              <Text style={styles.revealText}>Tap to reveal Adult Content</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const Feed = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vera Feed</Text>
      </View>
      <FlatList
        data={DUMMY_DATA}
        renderItem={({ item }) => <Post item={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  postContainer: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#111' },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  username: { color: '#FFF', fontWeight: 'bold' },
  timestamp: { color: '#555', fontSize: 12 },
  postText: { color: '#CCC', fontSize: 15, lineHeight: 22, marginBottom: 15 },
  imageContainer: { borderRadius: 15, overflow: 'hidden', height: 300, backgroundColor: '#111' },
  image: { width: '100%', height: '100%' },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  revealText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase' },
});

export default Feed;
