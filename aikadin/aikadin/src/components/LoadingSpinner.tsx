import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import theme from '../theme';

interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  fullScreen = false,
  size = 'large',
  color = theme.colors.primary.main,
  overlay = false
}) => {
  const containerStyle = [
    styles.container,
    fullScreen && styles.fullScreen,
    overlay && styles.overlay
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.content}>
        <ActivityIndicator 
          size={size} 
          color={color} 
          style={styles.spinner}
        />
        {text && (
          <Text style={[styles.text, { color }]}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background.default,
    zIndex: 999,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  spinner: {
    marginBottom: theme.spacing.md,
  },
  text: {
    fontSize: theme.fontSizes.md,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});

export default LoadingSpinner; 