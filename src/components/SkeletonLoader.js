import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { COLORS } from '../theme/colors';

export const SkeletonCard = ({ style }) => {
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

  return <Animated.View style={[styles.skeletonBase, { opacity: opacityAnim }, style]} />;
};

export const LedgerCardSkeleton = () => (
  <View style={styles.cardContainer}>
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
    <View style={styles.bottomRow}>
      <SkeletonCard style={styles.badgeSkeleton} />
      <SkeletonCard style={styles.btnSkeleton} />
    </View>
  </View>
);

export const TransactionCardSkeleton = () => (
  <View style={styles.txContainer}>
    <View style={styles.leftCol}>
      <SkeletonCard style={styles.iconSkeleton} />
      <View style={styles.textGroup}>
        <SkeletonCard style={styles.nameSkeleton} />
        <SkeletonCard style={styles.subSkeleton} />
      </View>
    </View>
    <SkeletonCard style={styles.amountSkeleton} />
  </View>
);

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: COLORS.surfaceBorder,
    borderRadius: 6,
  },
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
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
    height: 16,
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
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
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
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
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
