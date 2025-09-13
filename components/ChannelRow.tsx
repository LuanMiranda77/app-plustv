import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Channel, Movie } from '../types/netflix';
import MovieCard from './MovieCard';

interface ChannelRowProps {
  channel: Channel;
  onMoviePress: (movie: Movie) => void;
  onChannelPress?: (channel: Channel) => void;
}

export default function ChannelRow({ channel, onMoviePress, onChannelPress }: ChannelRowProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => onChannelPress && onChannelPress(channel)}
      >
        <View style={styles.channelInfo}>
          <Image
            source={{ uri: channel.logo }}
            style={styles.channelLogo}
            resizeMode="contain"
          />
          <Text style={styles.channelName}>{channel.name}</Text>
        </View>
        <Text style={styles.seeAll}>Ver tudo</Text>
      </TouchableOpacity>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {channel.movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onPress={onMoviePress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  channelLogo: {
    width: 40,
    height: 20,
    marginRight: 10,
  },
  channelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAll: {
    fontSize: 14,
    color: '#999',
  },
  scrollView: {
    paddingLeft: 15,
  },
  scrollContent: {
    paddingRight: 15,
  },
});