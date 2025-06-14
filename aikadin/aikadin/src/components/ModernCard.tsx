import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import theme from '../theme';

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'small' | 'medium' | 'large' | 'xlarge';
  shadow?: boolean;
}

const ModernCard: React.FC<ModernCardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'medium',
  borderRadius = 'medium',
  shadow = true,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.background.paper,
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: theme.colors.background.paper,
      },
      elevated: {
        backgroundColor: theme.colors.background.elevated,
        ...theme.shadows.lg,
      },
      outlined: {
        backgroundColor: theme.colors.background.paper,
        borderWidth: 1,
        borderColor: theme.colors.neutral[200],
      },
      filled: {
        backgroundColor: theme.colors.background.surface,
      },
    };

    // Padding styles
    const paddingStyles: Record<string, ViewStyle> = {
      none: {},
      small: {
        padding: theme.spacing.sm,
      },
      medium: {
        padding: theme.spacing.md,
      },
      large: {
        padding: theme.spacing.lg,
      },
    };

    // Border radius styles
    const borderRadiusStyles: Record<string, ViewStyle> = {
      small: {
        borderRadius: theme.borderRadius.sm,
      },
      medium: {
        borderRadius: theme.borderRadius.md,
      },
      large: {
        borderRadius: theme.borderRadius.lg,
      },
      xlarge: {
        borderRadius: theme.borderRadius.xl,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...paddingStyles[padding],
      ...borderRadiusStyles[borderRadius],
      ...(shadow && variant !== 'elevated' && theme.shadows.sm),
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.95}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

export default ModernCard; 