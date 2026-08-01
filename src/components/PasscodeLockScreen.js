import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Vibration } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useGuts } from '../context/GutsContext';

export const PasscodeLockScreen = ({ 
  correctPasscode, 
  useBiometrics = false,
  onSuccess, 
  title = "ENTER PASSCODE TO UNLOCK", 
  description = "Access your Snooker Guts ledger",
  onCancel = null,
  cancelText = "Cancel"
}) => {
  const { themeColors } = useGuts();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const styles = getStyles(themeColors);

  const [biometricsSupported, setBiometricsSupported] = useState(false);

  useEffect(() => {
    if (useBiometrics) {
      checkBiometrics();
    }
  }, [useBiometrics]);

  const checkBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && isEnrolled) {
        setBiometricsSupported(true);
        setTimeout(() => {
          handleBiometricAuth();
        }, 350);
      }
    } catch (err) {
      console.log('Biometric support check error:', err);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Snooker Guts Ledger',
        fallbackLabel: 'Enter Passcode',
        disableDeviceFallback: correctPasscode ? true : false,
      });
      if (result.success) {
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.log('Biometric authentication failed:', err);
    }
  };

  useEffect(() => {
    if (code.length === 4) {
      if (!correctPasscode) {
        if (onSuccess) onSuccess(code);
      } else if (code === correctPasscode) {
        setError(false);
        if (onSuccess) onSuccess();
      } else {
        setError(true);
        triggerShake();
        Vibration.vibrate(200);
        setTimeout(() => {
          setCode('');
          setError(false);
        }, 600);
      }
    }
  }, [code]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 15, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const handleKeyPress = (num) => {
    if (code.length < 4 && !error) {
      setCode(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    if (code.length > 0 && !error) {
      setCode(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (!error) {
      setCode('');
    }
  };

  const KEYPAD_BUTTONS = [
    { value: '1', letters: '' },
    { value: '2', letters: 'A B C' },
    { value: '3', letters: 'D E F' },
    { value: '4', letters: 'G H I' },
    { value: '5', letters: 'J K L' },
    { value: '6', letters: 'M N O' },
    { value: '7', letters: 'P Q R S' },
    { value: '8', letters: 'T U V' },
    { value: '9', letters: 'W X Y Z' },
  ];

  return (
    <View style={styles.container}>
      {/* Brand Header */}
      <View style={styles.headerContainer}>
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="crown" size={32} color={themeColors.accentGold} />
        </View>
        <Text style={styles.brandName}>SNOOKER GUTS</Text>
        <Text style={[styles.titleText, error && { color: themeColors.payable }]}>
          {error ? "INCORRECT PASSCODE" : title}
        </Text>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>

      {correctPasscode ? (
        <>
          {/* Code Indicators */}
          <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
            {[0, 1, 2, 3].map(index => {
              const isFilled = code.length > index;
              return (
                <View 
                  key={index} 
                  style={[
                    styles.dot, 
                    isFilled && styles.dotFilled,
                    error && styles.dotError
                  ]} 
                />
              );
            })}
          </Animated.View>

          {/* Keyboard Grid */}
          <View style={styles.keypadGrid}>
            <View style={styles.keypadRow}>
              {KEYPAD_BUTTONS.slice(0, 3).map(btn => (
                <TouchableOpacity key={btn.value} style={styles.keyBtn} onPress={() => handleKeyPress(btn.value)}>
                  <Text style={styles.keyVal}>{btn.value}</Text>
                  {btn.letters ? <Text style={styles.keyLetters}>{btn.letters}</Text> : null}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keypadRow}>
              {KEYPAD_BUTTONS.slice(3, 6).map(btn => (
                <TouchableOpacity key={btn.value} style={styles.keyBtn} onPress={() => handleKeyPress(btn.value)}>
                  <Text style={styles.keyVal}>{btn.value}</Text>
                  {btn.letters ? <Text style={styles.keyLetters}>{btn.letters}</Text> : null}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keypadRow}>
              {KEYPAD_BUTTONS.slice(6, 9).map(btn => (
                <TouchableOpacity key={btn.value} style={styles.keyBtn} onPress={() => handleKeyPress(btn.value)}>
                  <Text style={styles.keyVal}>{btn.value}</Text>
                  {btn.letters ? <Text style={styles.keyLetters}>{btn.letters}</Text> : null}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keypadRow}>
              {/* Left bottom key (Biometrics, Cancel, or Clear) */}
              {correctPasscode && biometricsSupported ? (
                <TouchableOpacity style={styles.sideKeyBtn} onPress={handleBiometricAuth} activeOpacity={0.7}>
                  <Ionicons name="finger-print" size={28} color={themeColors.accentGold} />
                </TouchableOpacity>
              ) : onCancel ? (
                <TouchableOpacity style={styles.sideKeyBtn} onPress={onCancel} activeOpacity={0.7}>
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.sideKeyBtn} onPress={handleClear} activeOpacity={0.7}>
                  <Text style={styles.sideKeyText}>CLEAR</Text>
                </TouchableOpacity>
              )}

              {/* Number 0 */}
              <TouchableOpacity style={styles.keyBtn} onPress={() => handleKeyPress('0')}>
                <Text style={styles.keyVal}>0</Text>
              </TouchableOpacity>

              {/* Backspace */}
              <TouchableOpacity style={styles.sideKeyBtn} onPress={handleBackspace}>
                <Ionicons name="backspace-outline" size={24} color={themeColors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.biometricOnlyContainer}>
          <TouchableOpacity style={styles.biometricOnlyBtn} onPress={handleBiometricAuth} activeOpacity={0.75}>
            <View style={styles.biometricCircle}>
              <Ionicons name="finger-print" size={72} color={themeColors.accentGold} />
            </View>
            <Text style={styles.biometricOnlyText}>Tap to Scan Biometrics</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Security Disclaimer */}
      <View style={styles.footerContainer}>
        <Ionicons name="lock-closed" size={14} color={themeColors.textMuted} />
        <Text style={styles.footerText}>Secure Offline Ledger Protection</Text>
      </View>
    </View>
  );
};

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingVertical: 45,
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accentGold,
    letterSpacing: 3,
    marginBottom: 14,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginVertical: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.surfaceBorder,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: COLORS.accentGold,
    borderColor: COLORS.accentGold,
  },
  dotError: {
    backgroundColor: COLORS.payable,
    borderColor: COLORS.payable,
  },
  keypadGrid: {
    gap: 16,
    width: '100%',
    maxWidth: 290,
    alignSelf: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'background-color 0.15s' },
    }),
  },
  sideKeyBtn: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  keyVal: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  keyLetters: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginTop: -2,
    letterSpacing: 0.5,
  },
  sideKeyText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.payable,
    letterSpacing: 0.5,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  biometricOnlyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  biometricOnlyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  biometricCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accentGold,
    shadowColor: COLORS.accentGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    ...Platform.select({
      web: { cursor: 'pointer', boxShadow: '0px 4px 15px rgba(212, 175, 55, 0.2)' },
    }),
  },
  biometricOnlyText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
});
