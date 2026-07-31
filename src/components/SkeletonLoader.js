import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { useTheme } from '../theme/colors';

export const SkeletonCard = ({ style }) => {
  const COLORS = useTheme();
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 600,
          useNativeDriver: useNative,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: useNative,
        }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[{ backgroundColor: COLORS.surfaceLight, borderRadius: 8 }, { opacity: opacityAnim }, style]} />;
};

export const LedgerCardSkeleton = () => {
  const COLORS = useTheme();
  return (
    <View style={[styles.cardContainer, { backgroundColor: COLORS.surface, borderColor: COLORS.surfaceBorder }]}>
      <View style={styles.topRow}>
        <View style={styles.leftCol}>
          <SkeletonCard style={styles.avatarSkeleton} />
          <View style={styles.textGroup}>
            <SkeletonCard style={styles.nameSkeleton} />
            <SkeletonCard style={styles.subSkeleton} />
          </View>
        </View>
        <View style={styles.rightCol}>
          <SkeletonCard style={styles.amountSkeleton} />
          <SkeletonCard style={styles.ptsSkeleton} />
        </View>
      </View>
      <View style={[styles.bottomRow, { borderTopColor: COLORS.surfaceBorder }]}>
        <SkeletonCard style={styles.badgeSkeleton} />
        <SkeletonCard style={styles.btnSkeleton} />
      </View>
    </View>
  );
};

export const TransactionCardSkeleton = () => {
  const COLORS = useTheme();
  return (
    <View style={[styles.txContainer, { backgroundColor: COLORS.surface, borderColor: COLORS.surfaceBorder }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <SkeletonCard style={styles.iconSkeleton} />
        <View style={{ gap: 4 }}>
          <SkeletonCard style={{ width: 100, height: 14, borderRadius: 4 }} />
          <SkeletonCard style={{ width: 60, height: 10, borderRadius: 4 }} />
        </View>
      </View>
      <SkeletonCard style={{ width: 60, height: 18, borderRadius: 4 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarSkeleton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  textGroup: {
    gap: 6,
  },
  nameSkeleton: {
    width: 120,
    height: 14,
    borderRadius: 4,
  },
  subSkeleton: {
    width: 80,
    height: 12,
    borderRadius: 4,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amountSkeleton: {
    width: 70,
    height: 18,
    borderRadius: 4,
  },
  ptsSkeleton: {
    width: 50,
    height: 12,
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  badgeSkeleton: {
    width: 70,
    height: 20,
    borderRadius: 6,
  },
  btnSkeleton: {
    width: 80,
    height: 26,
    borderRadius: 8,
  },
  txContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconSkeleton: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
});
