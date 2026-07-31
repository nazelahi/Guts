import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';

export const GutsCalculatorModal = ({ visible, onClose, onLogToPlayer }) => {
  const { players, settings, showToast } = useGuts();
  const symbol = settings.currencySymbol || '$';

  const [yourScore, setYourScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [rate, setRate] = useState(String(settings.defaultRatePerPoint || 1.0));
  const [selectedPlayerId, setSelectedPlayerId] = useState(players.length > 0 ? players[0].id : '');

  const netPoints = yourScore - opponentScore;
  const numRate = parseFloat(rate) || 0;
  const netCash = netPoints * numRate;

  const handleReset = () => {
    setYourScore(0);
    setOpponentScore(0);
  };

  const handleSendToLedger = () => {
    if (!selectedPlayerId) {
      showToast('Please select an opponent to log points to.', 'error');
      return;
    }
    const selectedPlayer = players.find(p => p.id === selectedPlayerId);
    onClose();
    if (onLogToPlayer) {
      onLogToPlayer({
        playerId: selectedPlayerId,
        gutsPoints: netPoints,
        ratePerPoint: numRate,
      });
    }
    showToast(`Logged ${netPoints > 0 ? '+' : ''}${netPoints} Pts to ${selectedPlayer ? selectedPlayer.name : 'opponent'}'s ledger!`, 'success');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="calculator" size={24} color={COLORS.accentGold} />
              <Text style={styles.headerTitle}>Table Side Guts Calculator</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Live Score Counter Matrix */}
            <Text style={styles.sectionLabel}>LIVE MATCH POINTS</Text>

            <View style={styles.counterRow}>
              {/* YOU */}
              <View style={[styles.counterBox, styles.youBox]}>
                <Text style={styles.counterTitle}>YOU</Text>
                <Text style={styles.counterScore}>{yourScore}</Text>
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.countBtn} onPress={() => setYourScore(Math.max(0, yourScore - 1))}>
                    <Text style={styles.countBtnText}>-1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.countBtnPlus} onPress={() => setYourScore(yourScore + 1)}>
                    <Text style={styles.countBtnPlusText}>+1</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.vsText}>VS</Text>

              {/* OPPONENT */}
              <View style={[styles.counterBox, styles.oppBox]}>
                <Text style={styles.counterTitle}>OPPONENT</Text>
                <Text style={styles.counterScore}>{opponentScore}</Text>
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.countBtn} onPress={() => setOpponentScore(Math.max(0, opponentScore - 1))}>
                    <Text style={styles.countBtnText}>-1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.countBtnPlus} onPress={() => setOpponentScore(opponentScore + 1)}>
                    <Text style={styles.countBtnPlusText}>+1</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Quick Multi-Point Adders */}
            <View style={styles.quickAddRow}>
              <Text style={styles.quickAddLabel}>Add Points to You:</Text>
              <View style={styles.pillsRow}>
                {[2, 3, 5, 7].map(val => (
                  <TouchableOpacity key={val} style={styles.pill} onPress={() => setYourScore(yourScore + val)}>
                    <Text style={styles.pillText}>+{val}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rate Converter */}
            <View style={styles.rateContainer}>
              <Text style={styles.rateLabel}>GUTS RATE PER POINT ({symbol})</Text>
              <TextInput
                style={styles.rateInput}
                keyboardType="decimal-pad"
                value={rate}
                onChangeText={setRate}
              />
            </View>

            {/* Live Net Result Banner */}
            <View style={[
              styles.resultCard,
              netPoints > 0 ? styles.resultCardWon : netPoints < 0 ? styles.resultCardLost : styles.resultCardEqual
            ]}>
              <Text style={styles.resultLabel}>CALCULATED NET RESULT</Text>
              <Text style={[
                styles.resultPoints,
                netPoints > 0 && { color: COLORS.receivable },
                netPoints < 0 && { color: COLORS.payable },
                netPoints === 0 && { color: COLORS.settled },
              ]}>
                {netPoints > 0 ? `+${netPoints}` : netPoints} Guts Pts
              </Text>
              <Text style={[
                styles.resultCash,
                netPoints > 0 && { color: COLORS.receivable },
                netPoints < 0 && { color: COLORS.payable },
                netPoints === 0 && { color: COLORS.textMuted },
              ]}>
                {netPoints > 0 ? `+${symbol}` : netPoints < 0 ? `-${symbol}` : symbol}
                {Math.abs(netCash).toFixed(2)}
              </Text>
            </View>

            {/* Log to Player Selection */}
            {players.length > 0 && (
              <View style={styles.logSection}>
                <Text style={styles.sectionLabel}>SEND RESULT TO PLAYER LEDGER</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playerScroll}>
                  {players.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.playerChip, selectedPlayerId === p.id && styles.playerChipActive]}
                      onPress={() => setSelectedPlayerId(p.id)}
                    >
                      <Text style={[styles.playerChipText, selectedPlayerId === p.id && styles.playerChipTextActive]}>
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Ionicons name="refresh" size={18} color={COLORS.textSecondary} />
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logBtn} onPress={handleSendToLedger}>
              <Ionicons name="bookmark-outline" size={18} color="#000" />
              <Text style={styles.logBtnText}>Log to Ledger</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  counterBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  youBox: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  oppBox: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  counterTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  counterScore: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.accentGold,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  countBtn: {
    backgroundColor: COLORS.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  countBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '800',
    fontSize: 13,
  },
  countBtnPlus: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  countBtnPlusText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13,
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  quickAddLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentGold,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  rateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  rateInput: {
    backgroundColor: COLORS.background,
    color: COLORS.accentGold,
    fontWeight: '800',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
    textAlign: 'center',
  },
  resultCard: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
  },
  resultCardWon: {
    backgroundColor: COLORS.receivableBg,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  resultCardLost: {
    backgroundColor: COLORS.payableBg,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  resultCardEqual: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.surfaceBorder,
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  resultPoints: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  resultCash: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  logSection: {
    marginBottom: 14,
  },
  playerScroll: {
    flexDirection: 'row',
  },
  playerChip: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  playerChipActive: {
    borderColor: COLORS.accentGold,
    backgroundColor: COLORS.primaryLight,
  },
  playerChipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  playerChipTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  resetBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  logBtn: {
    flex: 1.5,
    backgroundColor: COLORS.accentGold,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  logBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '800',
  },
});
