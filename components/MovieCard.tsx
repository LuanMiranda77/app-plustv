import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Movie } from '../types/netflix';

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
  width?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function MovieCard({ movie, onPress, width = screenWidth * 0.25 }: MovieCardProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, { width }]} 
      onPress={() => onPress(movie)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: movie.thumbnail }}
          style={[styles.thumbnail, { width, height: width * 1.5 }]}
          resizeMode="cover"
        />
        
        {movie.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>NOVO</Text>
          </View>
        )}
        
        {movie.isTrending && (
          <View style={styles.trendingBadge}>
            <Text style={styles.trendingText}>🔥</Text>
          </View>
        )}
        
        <View style={styles.overlay}>
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        
        <View style={styles.metadata}>
          <Text style={styles.year}>{movie.year}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.duration}>{movie.duration}</Text>
          {movie.type === 'series' && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.seasons}>{movie.seasons} temp.</Text>
            </>
          )}
        </View>
        
        <View style={styles.genres}>
          {movie.genre.slice(0, 2).map((genre, index) => (
            <Text key={index} style={styles.genre}>
              {genre}
              {index < movie.genre.slice(0, 2).length - 1 && ' • '}
            </Text>
          ))}
        </View>
        
        <View style={styles.rating}>
          {[...Array(5)].map((_, i) => (
            <Text key={i} style={styles.star}>
              {i < Math.floor(movie.rating) ? '★' : '☆'}
            </Text>
          ))}
          <Text style={styles.ratingText}>({movie.rating})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  thumbnail: {
    borderRadius: 8,
    backgroundColor: '#333',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  playButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 20,
    color: '#000',
    marginLeft: 3,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E50914',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendingText: {
    fontSize: 12,
  },
  info: {
    paddingTop: 8,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  year: {
    color: '#999',
    fontSize: 12,
  },
  dot: {
    color: '#999',
    fontSize: 12,
    marginHorizontal: 4,
  },
  duration: {
    color: '#999',
    fontSize: 12,
  },
  seasons: {
    color: '#999',
    fontSize: 12,
  },
  genres: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  genre: {
    color: '#999',
    fontSize: 11,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    color: '#FFD700',
    fontSize: 12,
    marginRight: 1,
  },
  ratingText: {
    color: '#999',
    fontSize: 11,
    marginLeft: 4,
  },
});