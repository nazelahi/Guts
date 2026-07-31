import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, useTheme } from '../theme/colors';

export const Toast = ({ visible, message, type = 'success', onDismiss }) => {
  const COLORS = useTheme();
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 350,
          useNativeDriver: useNative,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: useNative,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, 2600);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    const useNative = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -80,
        duration: 300,
        useNativeDriver: useNative,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: useNative,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!visible && opacityAnim._value === 0) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.toastContent, { backgroundColor: COLORS.surface, borderColor: COLORS.accentGold }]}>
        <Ionicons
          name={type === 'success' ? 'checkmark-circle' : 'alert-circle'}
          size={20}
          color={type === 'success' ? COLORS.receivable : COLORS.payable}
        />
        <Text style={[styles.toastText, { color: COLORS.textPrimary }]}>{message}</Text>
      </View>

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  toastText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});
