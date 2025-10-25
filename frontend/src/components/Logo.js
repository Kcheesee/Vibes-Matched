/**
 * Logo Component - Brand logo with heart + headphones + waveform
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function Logo({ size = 'large' }) {
  const styles = size === 'large' ? largeStyles : smallStyles;

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const largeStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 300,
    height: 300,
  },
});

const smallStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 200,
  },
});
