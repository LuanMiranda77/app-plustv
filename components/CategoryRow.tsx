import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Category, Movie } from '../types/netflix';
import MovieCard from './MovieCard';

interface CategoryRowProps {
  category: Category;
  onMoviePress: (movie: Movie) => void;
  onSeeAll?: (category: Category) => void;
}

export default function CategoryRow({ category, onMoviePress, onSeeAll }: CategoryRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{category.title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={() => onSeeAll(category)}>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {category.movies.map((movie) => (
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
  title: {
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