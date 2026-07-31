import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';

export const SettleUpModal = ({ visible, onClose, player }) => {
  const { settings, settlePlayerBalance, addTransaction, showToast } = useGuts();
  const symbol = settings.currencySymbol || '$';

  const [settlementMode, setSettlementMode] = useState('FULL'); // 'FULL' or 'PARTIAL'
  const [partialAmount, setPartialAmount] = useState('');
  const [notes, setNotes] = useState('');

  if (!player) return null;

  const isOwesYou = player.netCashAmount > 0;
  const isYouOwe = player.netCashAmount < 0;
  const currentNetCash = Math.abs(player.netCashAmount);

  const handleSettle = async () => {
    if (settlementMode === 'FULL') {
      await settlePlayerBalance(player.id);
      showToast(`Cleared full balance for ${player.name}!`, 'success');
    } else {
      const amount = parseFloat(partialAmount);
      if (!amount || amount <= 0) {
        showToast('Please enter a valid partial settlement amount.', 'error');
        return;
      }

      // Partial settlement entry:
      // If player owed you ($30) and pays $15 -> +$15 paid to you (reduces positive net balance)
      // If you owed player ($20) and paid $10 -> -$10 paid to player (reduces negative net balance)
      const signedCash = isOwesYou ? -amount : amount;

      await addTransaction({
        playerId: player.id,
        type: 'SETTLEMENT',
        gutsPoints: 0,
        ratePerPoint: 0,
        amount: signedCash,
        notes: notes || `Partial ${isOwesYou ? 'received' : 'paid'} cash settlement`,
        status: 'SETTLED',
      });
      showToast(`Recorded ${symbol}${amount.toFixed(2)} payment for ${player.name}`, 'success');
    }

    setPartialAmount('');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.accentGold} />
              <Text style={styles.headerTitle}>Settle Up Balance</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Opponent Balance Card Banner */}
          <View style={[styles.playerBanner, isOwesYou ? styles.bannerWon : styles.bannerLost]}>
            <View style={[styles.avatar, { backgroundColor: player.avatarColor || COLORS.primary, overflow: 'hidden' }]}>
              {player.avatarUri ? (
                <Image source={{ uri: player.avatarUri }} style={{ width: 40, height: 40, borderRadius: 20 }} />
              ) : player.avatarIcon ? (
                <MaterialCommunityIcons name={player.avatarIcon} size={20} color="#FFF" />
              ) : (
                <Text style={styles.avatarText}>{player.name.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.playerBannerDetails}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerStatusSub}>
                {isOwesYou ? 'Owes You:' : isYouOwe ? 'You Owe:' : 'Settled'}
              </Text>
            </View>
            <Text style={[styles.bannerAmount, isOwesYou ? { color: COLORS.receivable } : { color: COLORS.payable }]}>
              {symbol}{currentNetCash.toFixed(2)}
            </Text>
          </View>

          {/* Settlement Option Pills */}
          <Text style={styles.label}>SETTLEMENT TYPE</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.optionBtn, settlementMode === 'FULL' && styles.optionBtnActive]}
              onPress={() => setSettlementMode('FULL')}
            >
              <MaterialCommunityIcons name="check-all" size={18} color={settlementMode === 'FULL' ? COLORS.accentGold : COLORS.textMuted} />
              <Text style={[styles.optionBtnText, settlementMode === 'FULL' && styles.optionBtnTextActive]}>
                Clear All ({symbol}{currentNetCash.toFixed(2)})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, settlementMode === 'PARTIAL' && styles.optionBtnActive]}
              onPress={() => setSettlementMode('PARTIAL')}
            >
              <MaterialCommunityIcons name="cash-fast" size={18} color={settlementMode === 'PARTIAL' ? COLORS.accentGold : COLORS.textMuted} />
              <Text style={[styles.optionBtnText, settlementMode === 'PARTIAL' && styles.optionBtnTextActive]}>
                Partial Cash
              </Text>
            </TouchableOpacity>
          </View>

          {settlementMode === 'PARTIAL' && (
            <>
              <Text style={styles.label}>PARTIAL AMOUNT ({symbol}) *</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder={`e.g. ${(currentNetCash / 2).toFixed(2)}`}
                placeholderTextColor={COLORS.textMuted}
                value={partialAmount}
                onChangeText={setPartialAmount}
                autoFocus
              />

              {parseFloat(partialAmount) > 0 ? (
                <View style={styles.remainingBox}>
                  <Text style={styles.remainingText}>
                    Remaining Balance After Payment: <Text style={styles.remainingVal}>{symbol}{Math.max(0, currentNetCash - (parseFloat(partialAmount) || 0)).toFixed(2)}</Text>
                  </Text>
                </View>
              ) : null}

              <Text style={styles.label}>PAYMENT NOTE / METHOD (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Cash / Bkash / Zelle / Venmo"
                placeholderTextColor={COLORS.textMuted}
                value={notes}
                onChangeText={setNotes}
              />
            </>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSettle}>
              <Ionicons name="checkmark-done" size={18} color="#000" />
              <Text style={styles.saveBtnText}>
                {settlementMode === 'FULL' ? 'Clear Balance' : 'Save Payment'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  playerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  bannerWon: {
    backgroundColor: COLORS.receivableBg,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  bannerLost: {
    backgroundColor: COLORS.payableBg,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  playerBannerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  playerStatusSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  bannerAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 6,
    letterSpacing: 0.8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  optionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  optionBtnActive: {
    borderColor: COLORS.accentGold,
    backgroundColor: COLORS.primaryDark,
  },
  optionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  optionBtnTextActive: {
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 10,
  },
  remainingBox: {
    backgroundColor: COLORS.surfaceLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  remainingText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  remainingVal: {
    color: COLORS.accentGold,
    fontWeight: '800',
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1.5,
    backgroundColor: COLORS.accentGold,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '800',
  },
});
