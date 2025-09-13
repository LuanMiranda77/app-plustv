import { Platform, Dimensions } from 'react-native';

export const isTV = () => {
  if (Platform.OS === 'web') {
    const userAgent = navigator.userAgent;
    const screenWidth = Dimensions.get('window').width;
    
    // Detectar TVs LG webOS
    if (userAgent.includes('webOS') || userAgent.includes('Web0S')) {
      return true;
    }
    
    // Detectar Samsung Tizen
    if (userAgent.includes('Tizen') || userAgent.includes('SamsungBrowser')) {
      return true;
    }
    
    // Detectar Android TV
    if (userAgent.includes('Android') && userAgent.includes('TV')) {
      return true;
    }
    
    // Detectar por tamanho de tela (heurística)
    if (screenWidth >= 1280) {
      return true;
    }
  }
  
  // React Native TV
  if (Platform.isTV) {
    return true;
  }
  
  return false;
};

export const isMobile = () => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

export const isWeb = () => {
  return Platform.OS === 'web';
};

export const getOptimalVideoSize = () => {
  const { width, height } = Dimensions.get('window');
  
  if (isTV()) {
    return {
      width: width * 0.9,
      height: height * 0.6,
    };
  }
  
  if (isMobile()) {
    return {
      width: width * 0.95,
      height: width * 0.56, // 16:9 aspect ratio
    };
  }
  
  // Web desktop
  return {
    width: Math.min(width * 0.8, 800),
    height: Math.min(width * 0.45, 450),
  };
};