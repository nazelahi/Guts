import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ActivityIndicator, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export const SplashScreen = ({ subtitle = 'Snooker Club Points & Ledger' }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';

    // Fade in and scale up logo emblem
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: useNative,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: useNative,
      }),
    ]).start();

    // Infinite subtle pulsing effect on glowing ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: useNative,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: useNative,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
          }
        ]}
      >
        {/* Outer Glowing Ring */}
        <View style={styles.outerGlow}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="billiards-rack" size={48} color={COLORS.accentGold} />
          </View>
        </View>

        <Text style={styles.title}>SNOOKER GUTS</Text>
        <View style={styles.goldDivider} />
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Animated.View>

      {/* Bottom Loading Bar & Indicator */}
      <View style={styles.bottomContainer}>
        <ActivityIndicator size="small" color={COLORS.accentGold} />
        <Text style={styles.loadingText}>Initializing Club Ledgers...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  outerGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginBottom: 20,
    elevation: 10,
    shadowColor: COLORS.accentGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accentGold,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 3,
    marginBottom: 8,
  },
  goldDivider: {
    width: 50,
    height: 2,
    backgroundColor: COLORS.accentGold,
    marginVertical: 4,
    borderRadius: 1,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accentGold,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
});
