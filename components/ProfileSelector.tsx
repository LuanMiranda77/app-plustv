import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { UserProfile, PREDEFINED_AVATARS } from '../types/netflix';

interface ProfileSelectorProps {
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onAddProfile?: () => void;
}

export default function ProfileSelector({ profiles, onSelectProfile, onAddProfile }: ProfileSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quem está assistindo?</Text>
      
      <ScrollView contentContainerStyle={styles.profilesContainer} showsVerticalScrollIndicator={false}>
        {profiles.map((profile) => (
          <TouchableOpacity
            key={profile.id}
            style={styles.profileItem}
            onPress={() => onSelectProfile(profile)}
          >
            <Image
              source={{ uri: profile.avatar }}
              style={styles.avatar}
            />
            <Text style={styles.profileName}>{profile.name}</Text>
          </TouchableOpacity>
        ))}
        
        {onAddProfile && (
          <TouchableOpacity
            style={styles.profileItem}
            onPress={onAddProfile}
          >
            <View style={styles.addAvatar}>
              <Text style={styles.addIcon}>+</Text>
            </View>
            <Text style={styles.profileName}>Adicionar perfil</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  profilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    paddingHorizontal: 20,
  },
  profileItem: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  addAvatar: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  addIcon: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    maxWidth: 100,
  },
});