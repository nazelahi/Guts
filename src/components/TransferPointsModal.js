import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';

export const TransferPointsModal = ({ visible, onClose, initialFromPlayerId = null }) => {
  const { players, settings, transferGutsPoints, showToast, themeColors } = useGuts();
  const styles = getStyles(themeColors);
  const symbol = settings.currencySymbol || '$';


  const [fromPlayerId, setFromPlayerId] = useState('');
  const [toPlayerId, setToPlayerId] = useState('');
  const [gutsPoints, setGutsPoints] = useState('5');
  const [ratePerPoint, setRatePerPoint] = useState(String(settings.defaultRatePerPoint || 1.0));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (players.length >= 2) {
      const defaultFrom = initialFromPlayerId || players[0].id;
      setFromPlayerId(defaultFrom);
      const defaultTo = players.find(p => p.id !== defaultFrom)?.id || players[1].id;
      setToPlayerId(defaultTo);
    }
  }, [initialFromPlayerId, players, visible]);

  const numPts = parseFloat(gutsPoints) || 0;
  const numRate = parseFloat(ratePerPoint) || 0;
  const calculatedCash = numPts * numRate;

  const fromPlayer = players.find(p => p.id === fromPlayerId);
  const toPlayer = players.find(p => p.id === toPlayerId);

  const handleConfirmTransfer = async () => {
    if (!fromPlayerId || !toPlayerId) {
      showToast('Please select both source and destination players.', 'error');
      return;
    }

    if (fromPlayerId === toPlayerId) {
      showToast('Source and destination players must be different.', 'error');
      return;
    }

    if (numPts <= 0) {
      showToast('Please enter a valid number of Guts points.', 'error');
      return;
    }

    const success = await transferGutsPoints({
      fromPlayerId,
      toPlayerId,
      gutsPoints: numPts,
      ratePerPoint: numRate,
      notes: notes || `Transferred ${numPts} Guts pts (${symbol}${calculatedCash.toFixed(2)}) from ${fromPlayer.name} to ${toPlayer.name}`,
    });

    if (success) {
      showToast(`Transferred ${numPts} Pts from ${fromPlayer.name} to ${toPlayer.name}!`, 'success');
      onClose();
    } else {
      showToast('Failed to process points transfer.', 'error');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="swap-horizontal-bold" size={24} color={COLORS.accentGold} />
              <Text style={styles.headerTitle}>Transfer Guts Points</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {players.length < 2 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="swap-horizontal" size={48} color={themeColors.surfaceBorder} />
              <Text style={styles.emptyTitle}>Two Opponents Required</Text>
              <Text style={styles.emptySub}>
                You need to register at least two opponents to transfer points or balances between them.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              {/* FROM PLAYER */}
              <Text style={styles.label}>TRANSFER FROM (SOURCE OPPONENT) *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {players.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.playerChip, fromPlayerId === p.id && styles.playerChipActiveFrom]}
                    onPress={() => {
                      setFromPlayerId(p.id);
                      if (toPlayerId === p.id) {
                        const nextTo = players.find(other => other.id !== p.id)?.id;
                        if (nextTo) setToPlayerId(nextTo);
                      }
                    }}
                  >
                    <View style={[styles.chipAvatar, { backgroundColor: p.avatarColor || COLORS.primary }]}>
                      <Text style={styles.chipAvatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.chipText, fromPlayerId === p.id && styles.chipTextActive]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Transfer Direction Indicator */}
              <View style={styles.transferArrowBox}>
                <Feather name="arrow-down" size={20} color={COLORS.accentGold} />
              </View>

              {/* TO PLAYER */}
              <Text style={styles.label}>TRANSFER TO (DESTINATION OPPONENT) *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {players.filter(p => p.id !== fromPlayerId).map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.playerChip, toPlayerId === p.id && styles.playerChipActiveTo]}
                    onPress={() => setToPlayerId(p.id)}
                  >
                    <View style={[styles.chipAvatar, { backgroundColor: p.avatarColor || COLORS.primary }]}>
                      <Text style={styles.chipAvatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.chipText, toPlayerId === p.id && styles.chipTextActive]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Guts Points Entry */}
              <Text style={styles.label}>POINTS TO TRANSFER *</Text>
              <View style={styles.ptsInputContainer}>
                <TouchableOpacity 
                  style={styles.adjustBtn}
                  onPress={() => setGutsPoints(String(Math.max(1, numPts - 1)))}
                >
                  <Text style={styles.adjustBtnText}>-</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.ptsInput}
                  keyboardType="numeric"
                  value={gutsPoints}
                  onChangeText={setGutsPoints}
                />

                <TouchableOpacity 
                  style={styles.adjustBtn}
                  onPress={() => setGutsPoints(String(numPts + 1))}
                >
                  <Text style={styles.adjustBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Preset Pills */}
              <View style={styles.presetRow}>
                {[1, 3, 5, 10, 15, 20].map(pt => (
                  <TouchableOpacity
                    key={pt}
                    style={[styles.presetPill, numPts === pt && styles.presetPillActive]}
                    onPress={() => setGutsPoints(String(pt))}
                  >
                    <Text style={[styles.presetText, numPts === pt && styles.presetTextActive]}>
                      {pt} Pts
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Rate per point */}
              <Text style={styles.label}>RATE PER POINT ({symbol})</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={ratePerPoint}
                onChangeText={setRatePerPoint}
              />

              {/* Transfer Summary Preview Banner */}
              {fromPlayer && toPlayer && (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>TRANSFER PREVIEW</Text>
                  <Text style={styles.summaryMainText}>
                    Moving <Text style={{ color: COLORS.accentGold, fontWeight: '800' }}>{numPts} Guts Pts ({symbol}{calculatedCash.toFixed(2)})</Text>
                  </Text>
                  <Text style={styles.summarySubText}>
                    From <Text style={{ color: COLORS.textPrimary, fontWeight: '700' }}>{fromPlayer.name}</Text> ➔ To <Text style={{ color: COLORS.textPrimary, fontWeight: '700' }}>{toPlayer.name}</Text>
                  </Text>
                </View>
              )}

              {/* Notes */}
              <Text style={styles.label}>TRANSFER NOTE / REASON (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Side bet transfer, 3-way table settlement"
                placeholderTextColor={COLORS.textMuted}
                value={notes}
                onChangeText={setNotes}
              />
            </ScrollView>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            {players.length >= 2 && (
              <TouchableOpacity style={styles.saveBtn} onPress={handleConfirmTransfer}>
                <MaterialCommunityIcons name="swap-horizontal-bold" size={18} color="#000" />
                <Text style={styles.saveBtnText}>Execute Transfer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (COLORS) => StyleSheet.create({

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
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
  formScroll: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 10,
    letterSpacing: 0.8,
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  playerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  playerChipActiveFrom: {
    borderColor: COLORS.payable,
    backgroundColor: COLORS.payableBg,
  },
  playerChipActiveTo: {
    borderColor: COLORS.receivable,
    backgroundColor: COLORS.receivableBg,
  },
  chipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipAvatarText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  transferArrowBox: {
    alignItems: 'center',
    marginVertical: 4,
  },
  ptsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  adjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.accentGold,
  },
  ptsInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    paddingVertical: 10,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  presetPill: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  presetPillActive: {
    backgroundColor: COLORS.accentGold,
    borderColor: COLORS.accentGold,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  presetTextActive: {
    color: '#000',
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
    marginBottom: 6,
  },
  summaryCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.accentGold,
    letterSpacing: 1,
  },
  summaryMainText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  summarySubText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginVertical: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
