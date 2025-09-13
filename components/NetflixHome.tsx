import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { UserProfile, Movie, Category } from '../types/netflix';
import { MOCK_PROFILES, MOCK_CATEGORIES, MOCK_MOVIES, MOCK_CHANNELS } from '../data/mockData';
import ProfileSelector from './ProfileSelector';
import CategoryRow from './CategoryRow';
import ChannelRow from './ChannelRow';
import VideoPlayer from './VideoPlayer';
import TVRemoteHandler from './TVRemoteHandler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function NetflixHome() {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [featuredMovie] = useState<Movie>(MOCK_MOVIES[0]); // Filme em destaque
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const handleSelectProfile = (profile: UserProfile) => {
    setSelectedProfile(profile);
  };

  const handleMoviePress = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowVideoPlayer(true);
  };

  const handlePlayFeatured = () => {
    setSelectedMovie(featuredMovie);
    setShowVideoPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowVideoPlayer(false);
    setSelectedMovie(null);
  };

  if (!selectedProfile) {
    return (
      <ProfileSelector
        profiles={MOCK_PROFILES}
        onSelectProfile={handleSelectProfile}
        onAddProfile={() => console.log('Adicionar perfil')}
      />
    );
  }

  if (showVideoPlayer && selectedMovie) {
    return (
      <View style={styles.playerContainer}>
        <TVRemoteHandler
          onBack={handleClosePlayer}
          onPlayPause={() => console.log('Play/Pause')}
        />
        <View style={styles.playerHeader}>
          <TouchableOpacity onPress={handleClosePlayer} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.playerTitle}>{selectedMovie.title}</Text>
        </View>
        <VideoPlayer
          source={selectedMovie.videoUrl}
          autoPlay={true}
          controls={true}
        />
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle}>{selectedMovie.title}</Text>
          <Text style={styles.movieDescription}>{selectedMovie.description}</Text>
          <View style={styles.movieMeta}>
            <Text style={styles.movieYear}>{selectedMovie.year}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.movieDuration}>{selectedMovie.duration}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.movieGenre}>{selectedMovie.genre.join(', ')}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TVRemoteHandler
        onBack={() => setSelectedProfile(null)}
        onSelect={handlePlayFeatured}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>PLUS TV</Text>
        <TouchableOpacity onPress={() => setSelectedProfile(null)}>
          <Text style={styles.profileName}>{selectedProfile.name}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Movie Banner */}
        <ImageBackground
          source={{ uri: featuredMovie.banner || featuredMovie.thumbnail }}
          style={styles.banner}
          resizeMode="cover"
        >
          <View style={styles.bannerOverlay}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{featuredMovie.title}</Text>
              <Text style={styles.bannerDescription} numberOfLines={3}>
                {featuredMovie.description}
              </Text>
              
              <View style={styles.bannerButtons}>
                <TouchableOpacity style={styles.playButton} onPress={handlePlayFeatured}>
                  <Text style={styles.playButtonText}>▶ Assistir</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.infoButton}>
                  <Text style={styles.infoButtonText}>ⓘ Mais informações</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Categories */}
        <View style={styles.categories}>
          {MOCK_CATEGORIES.map((category) => {
            // Renderizar canais de forma especial
            if (category.id === 'channels') {
              return (
                <View key={category.id}>
                  <Text style={styles.sectionTitle}>{category.title}</Text>
                  {MOCK_CHANNELS.map((channel) => (
                    <ChannelRow
                      key={channel.id}
                      channel={channel}
                      onMoviePress={handleMoviePress}
                      onChannelPress={(channel) => console.log('Ver canal:', channel.name)}
                    />
                  ))}
                </View>
              );
            }
            
            // Renderizar categorias normais
            return (
              <CategoryRow
                key={category.id}
                category={category}
                onMoviePress={handleMoviePress}
                onSeeAll={(cat) => console.log('Ver todos:', cat.title)}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
  },
  profileName: {
    fontSize: 16,
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  banner: {
    width: screenWidth,
    height: screenHeight * 0.6,
    justifyContent: 'flex-end',
  },
  bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bannerContent: {
    padding: 15,
    paddingBottom: 30,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  bannerDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 15,
    lineHeight: 20,
  },
  bannerButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  playButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  categories: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 15,
    marginBottom: 15,
    marginTop: 10,
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40,
  },
  closeButton: {
    marginRight: 15,
  },
  closeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  playerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  movieInfo: {
    padding: 15,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  movieDescription: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  movieMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  movieYear: {
    color: '#999',
    fontSize: 14,
  },
  dot: {
    color: '#999',
    fontSize: 14,
    marginHorizontal: 8,
  },
  movieDuration: {
    color: '#999',
    fontSize: 14,
  },
  movieGenre: {
    color: '#999',
    fontSize: 14,
  },
});