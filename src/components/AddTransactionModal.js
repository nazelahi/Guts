import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';

export const AddTransactionModal = ({ visible, onClose, initialPlayerId = null }) => {
  const { players, settings, addTransaction, showToast } = useGuts();
  const symbol = settings.currencySymbol || '$';


  const [type, setType] = useState('MATCH'); // 'MATCH' or 'SETTLEMENT'
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [direction, setDirection] = useState('WON'); // 'WON' (you get) or 'LOST' (you owe)
  const [gutsPoints, setGutsPoints] = useState('5');
  const [ratePerPoint, setRatePerPoint] = useState(String(settings.defaultRatePerPoint || 1.0));
  const [matchEntryMode, setMatchEntryMode] = useState('POINTS'); // 'POINTS' or 'CASH'
  const [directMatchCash, setDirectMatchCash] = useState('');
  const [directAmount, setDirectAmount] = useState(''); // for cash settlement
  const [clubName, setClubName] = useState(settings.clubName || 'Imperial Snooker Club');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialPlayerId) {
      setSelectedPlayerId(initialPlayerId);
    } else if (players.length > 0 && !selectedPlayerId) {
      setSelectedPlayerId(players[0].id);
    }
    if (visible) {
      setClubName(settings.clubName || 'Imperial Snooker Club');
    }
  }, [initialPlayerId, players, settings.clubName, visible]);

  // Live money total preview
  const numPts = parseFloat(gutsPoints) || 0;
  const numRate = parseFloat(ratePerPoint) || 0;
  const calculatedMatchCash = numPts * numRate;

  const handleSave = async () => {
    if (!selectedPlayerId) {
      showToast('Please select an opponent player.', 'error');
      return;
    }

    const selectedPlayer = players.find(p => p.id === selectedPlayerId);
    const opponentName = selectedPlayer ? selectedPlayer.name : 'opponent';

    if (type === 'MATCH') {
      let finalPts = 0;
      let finalCash = 0;

      if (matchEntryMode === 'POINTS') {
        if (numPts <= 0) {
          showToast('Please enter a valid Guts point amount.', 'error');
          return;
        }
        finalPts = direction === 'WON' ? numPts : -numPts;
        finalCash = direction === 'WON' ? calculatedMatchCash : -calculatedMatchCash;
      } else {
        const cashVal = parseFloat(directMatchCash);
        if (!cashVal || cashVal <= 0) {
          showToast('Please enter a valid cash amount.', 'error');
          return;
        }
        finalCash = direction === 'WON' ? cashVal : -cashVal;
        const equivPts = numRate > 0 ? Math.round(cashVal / numRate) : 0;
        finalPts = direction === 'WON' ? equivPts : -equivPts;
      }

      await addTransaction({
        playerId: selectedPlayerId,
        type: 'MATCH',
        gutsPoints: finalPts,
        ratePerPoint: numRate,
        amount: finalCash,
        clubName,
        notes,
        status: 'UNSETTLED',
      });
      showToast(`Logged Guts match vs ${opponentName} (${finalCash > 0 ? '+' : ''}${symbol}${Math.abs(finalCash).toFixed(2)})`, 'success');
    } else {
      // Settlement type
      const cashVal = parseFloat(directAmount);
      if (!cashVal || cashVal <= 0) {
        showToast('Please enter valid settlement cash amount.', 'error');
        return;
      }

      // Cash settlement:
      const signedCash = direction === 'RECEIVED' ? -cashVal : cashVal;

      await addTransaction({
        playerId: selectedPlayerId,
        type: 'SETTLEMENT',
        gutsPoints: 0,
        ratePerPoint: 0,
        amount: signedCash,
        clubName,
        notes: notes || (direction === 'RECEIVED' ? 'Received Cash Payment' : 'Paid Cash Settlement'),
        status: 'SETTLED',
      });
      showToast(`Recorded cash payment with ${opponentName}`, 'success');
    }

    // Reset & close
    setGutsPoints('5');
    setDirectAmount('');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="billiards-rack" size={24} color={COLORS.accentGold} />
              <Text style={styles.headerTitle}>Record Guts Entry</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Type Selector Tabs */}
          <View style={styles.typeTabRow}>
            <TouchableOpacity 
              style={[styles.typeTab, type === 'MATCH' && styles.typeTabActive]}
              onPress={() => { setType('MATCH'); setDirection('WON'); }}
            >
              <MaterialCommunityIcons 
                name="trophy" 
                size={16} 
                color={type === 'MATCH' ? COLORS.accentGold : COLORS.textMuted} 
              />
              <Text style={[styles.typeTabText, type === 'MATCH' && styles.typeTabTextActive]}>
                Guts Game / Match
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.typeTab, type === 'SETTLEMENT' && styles.typeTabActive]}
              onPress={() => { setType('SETTLEMENT'); setDirection('RECEIVED'); }}
            >
              <MaterialCommunityIcons 
                name="cash-sync" 
                size={16} 
                color={type === 'SETTLEMENT' ? COLORS.receivable : COLORS.textMuted} 
              />
              <Text style={[styles.typeTabText, type === 'SETTLEMENT' && styles.typeTabTextActive]}>
                Cash Settlement
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Player Selection Chips */}
            <Text style={styles.label}>SELECT OPPONENT *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playerChipScroll}>
              {players.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.playerChip,
                    selectedPlayerId === p.id && styles.playerChipActive,
                  ]}
                  onPress={() => setSelectedPlayerId(p.id)}
                >
                  <View style={[styles.chipAvatar, { backgroundColor: p.avatarColor || COLORS.primary }]}>
                    <Text style={styles.chipAvatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.chipText, selectedPlayerId === p.id && styles.chipTextActive]}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {type === 'MATCH' ? (
              <>
                {/* Match Outcome Direction */}
                <Text style={styles.label}>MATCH OUTCOME *</Text>
                <View style={styles.directionRow}>
                  <TouchableOpacity
                    style={[styles.dirBtn, direction === 'WON' && styles.dirBtnWon]}
                    onPress={() => setDirection('WON')}
                  >
                    <Feather name="arrow-down-left" size={18} color={direction === 'WON' ? '#FFF' : COLORS.textMuted} />
                    <Text style={[styles.dirBtnText, direction === 'WON' && styles.dirBtnTextActive]}>
                      YOU WON (He Owes You)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dirBtn, direction === 'LOST' && styles.dirBtnLost]}
                    onPress={() => setDirection('LOST')}
                  >
                    <Feather name="arrow-up-right" size={18} color={direction === 'LOST' ? '#FFF' : COLORS.textMuted} />
                    <Text style={[styles.dirBtnText, direction === 'LOST' && styles.dirBtnTextActive]}>
                      YOU LOST (You Owe Him)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Match Entry Mode Sub-Toggle (Points vs Cash) */}
                <Text style={styles.label}>ENTRY MODE *</Text>
                <View style={styles.modeToggleRow}>
                  <TouchableOpacity
                    style={[styles.modeToggleBtn, matchEntryMode === 'POINTS' && styles.modeToggleBtnActive]}
                    onPress={() => setMatchEntryMode('POINTS')}
                  >
                    <Ionicons name="trophy-outline" size={14} color={matchEntryMode === 'POINTS' ? COLORS.accentGold : COLORS.textMuted} />
                    <Text style={[styles.modeToggleText, matchEntryMode === 'POINTS' && styles.modeToggleTextActive]}>
                      By Guts Points
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modeToggleBtn, matchEntryMode === 'CASH' && styles.modeToggleBtnActive]}
                    onPress={() => setMatchEntryMode('CASH')}
                  >
                    <MaterialCommunityIcons name="cash" size={16} color={matchEntryMode === 'CASH' ? COLORS.accentGold : COLORS.textMuted} />
                    <Text style={[styles.modeToggleText, matchEntryMode === 'CASH' && styles.modeToggleTextActive]}>
                      By Direct Cash ({symbol})
                    </Text>
                  </TouchableOpacity>
                </View>

                {matchEntryMode === 'POINTS' ? (
                  <>
                    {/* Guts Points Entry */}
                    <Text style={styles.label}>GUTS POINTS WON / LOST *</Text>
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

                    {/* Quick Point Preset Pills */}
                    <View style={styles.presetRow}>
                      {[1, 3, 5, 10, 15, 20].map(pt => (
                        <TouchableOpacity
                          key={pt}
                          style={[styles.presetPill, numPts === pt && styles.presetPillActive]}
                          onPress={() => setGutsPoints(String(pt))}
                        >
                          <Text style={[styles.presetText, numPts === pt && styles.presetTextActive]}>
                            +{pt} Pts
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Rate per point */}
                    <Text style={styles.label}>RATE PER POINT ({symbol})</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="decimal-pad"
                      placeholder="e.g. 1.00"
                      placeholderTextColor={COLORS.textMuted}
                      value={ratePerPoint}
                      onChangeText={setRatePerPoint}
                    />

                    {/* Calculated Cash Box */}
                    <View style={[
                      styles.calcBox,
                      direction === 'WON' ? styles.calcBoxWon : styles.calcBoxLost
                    ]}>
                      <Text style={styles.calcBoxLabel}>TOTAL VALUE</Text>
                      <Text style={[
                        styles.calcBoxAmount,
                        direction === 'WON' ? { color: COLORS.receivable } : { color: COLORS.payable }
                      ]}>
                        {direction === 'WON' ? `+${symbol}` : `-${symbol}`}
                        {calculatedMatchCash.toFixed(2)}
                      </Text>
                      <Text style={styles.calcBoxSub}>
                        {numPts} Guts Pts × {symbol}{numRate.toFixed(2)} rate
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Direct Cash Entry */}
                    <Text style={styles.label}>CASH AMOUNT {direction === 'WON' ? 'WON' : 'LOST'} ({symbol}) *</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="decimal-pad"
                      placeholder="e.g. 25.00"
                      placeholderTextColor={COLORS.textMuted}
                      value={directMatchCash}
                      onChangeText={setDirectMatchCash}
                    />

                    {/* Quick Cash Presets */}
                    <View style={styles.presetRow}>
                      {[5, 10, 20, 50, 100].map(val => (
                        <TouchableOpacity
                          key={val}
                          style={[styles.presetPill, parseFloat(directMatchCash) === val && styles.presetPillActive]}
                          onPress={() => setDirectMatchCash(String(val))}
                        >
                          <Text style={[styles.presetText, parseFloat(directMatchCash) === val && styles.presetTextActive]}>
                            +{symbol}{val}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Optional Rate per point for equivalent calculation */}
                    <Text style={styles.label}>RATE PER POINT ({symbol})</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="decimal-pad"
                      placeholder="e.g. 1.00"
                      placeholderTextColor={COLORS.textMuted}
                      value={ratePerPoint}
                      onChangeText={setRatePerPoint}
                    />

                    {/* Equivalent Points Box */}
                    <View style={[
                      styles.calcBox,
                      direction === 'WON' ? styles.calcBoxWon : styles.calcBoxLost
                    ]}>
                      <Text style={styles.calcBoxLabel}>MATCH CASH VALUE</Text>
                      <Text style={[
                        styles.calcBoxAmount,
                        direction === 'WON' ? { color: COLORS.receivable } : { color: COLORS.payable }
                      ]}>
                        {direction === 'WON' ? `+${symbol}` : `-${symbol}`}
                        {(parseFloat(directMatchCash) || 0).toFixed(2)}
                      </Text>
                      <Text style={styles.calcBoxSub}>
                        {numRate > 0 
                          ? `Equivalent to ~${Math.round((parseFloat(directMatchCash) || 0) / numRate)} Guts Pts (@ ${symbol}${numRate.toFixed(2)}/pt)` 
                          : 'Flat cash match entry'}
                      </Text>
                    </View>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Settlement Direction */}
                <Text style={styles.label}>SETTLEMENT TYPE *</Text>
                <View style={styles.directionRow}>
                  <TouchableOpacity
                    style={[styles.dirBtn, direction === 'RECEIVED' && styles.dirBtnWon]}
                    onPress={() => setDirection('RECEIVED')}
                  >
                    <Ionicons name="arrow-down" size={18} color={direction === 'RECEIVED' ? '#FFF' : COLORS.textMuted} />
                    <Text style={[styles.dirBtnText, direction === 'RECEIVED' && styles.dirBtnTextActive]}>
                      RECEIVED CASH (From Opponent)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dirBtn, direction === 'PAID' && styles.dirBtnLost]}
                    onPress={() => setDirection('PAID')}
                  >
                    <Ionicons name="arrow-up" size={18} color={direction === 'PAID' ? '#FFF' : COLORS.textMuted} />
                    <Text style={[styles.dirBtnText, direction === 'PAID' && styles.dirBtnTextActive]}>
                      PAID CASH (To Opponent)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Amount Paid */}
                <Text style={styles.label}>AMOUNT {direction === 'RECEIVED' ? 'RECEIVED' : 'PAID'} ({symbol}) *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 25.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={directAmount}
                  onChangeText={setDirectAmount}
                  autoFocus
                />
              </>
            )}

            {/* Pre-categorized Snooker Club / Venue Selector */}
            <Text style={styles.label}>SNOOKER CLUB / VENUE NAME</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clubChipScroll}>
              {(settings.clubs || ['Imperial Snooker Club', 'Cue Zone Lounge', 'Rack & Cue Arena']).map(club => (
                <TouchableOpacity
                  key={club}
                  style={[styles.clubChip, clubName === club && styles.clubChipActive]}
                  onPress={() => setClubName(club)}
                >
                  <MaterialCommunityIcons 
                    name="map-marker" 
                    size={14} 
                    color={clubName === club ? COLORS.accentGold : COLORS.textMuted} 
                  />
                  <Text style={[styles.clubChipText, clubName === club && styles.clubChipTextActive]}>
                    {club}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="Or type custom venue / lounge name..."
              placeholderTextColor={COLORS.textMuted}
              value={clubName}
              onChangeText={setClubName}
            />

            {/* Notes */}
            <Text style={styles.label}>MATCH NOTES / DETAILS</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3-frame session, 78 break frame"
              placeholderTextColor={COLORS.textMuted}
              value={notes}
              onChangeText={setNotes}
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark-done" size={18} color="#000" />
              <Text style={styles.saveBtnText}>Save Entry</Text>
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
  typeTabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  typeTabActive: {
    backgroundColor: COLORS.primaryDark,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  typeTabTextActive: {
    color: COLORS.textPrimary,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  modeToggleBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.accentGold,
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  modeToggleTextActive: {
    color: COLORS.accentGold,
    fontWeight: '700',
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
  playerChipScroll: {
    flexDirection: 'row',
    marginBottom: 6,
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
  playerChipActive: {
    borderColor: COLORS.accentGold,
    backgroundColor: COLORS.primaryLight,
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
  directionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  dirBtn: {
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
  dirBtnWon: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.receivable,
  },
  dirBtnLost: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: COLORS.payable,
  },
  dirBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  dirBtnTextActive: {
    color: COLORS.textPrimary,
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
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  presetTextActive: {
    color: '#000',
  },
  clubChipScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  clubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  clubChipActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.accentGold,
  },
  clubChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  clubChipTextActive: {
    color: COLORS.accentGold,
    fontWeight: '700',
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
  calcBox: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
    borderWidth: 1,
  },
  calcBoxWon: {
    backgroundColor: COLORS.receivableBg,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  calcBoxLost: {
    backgroundColor: COLORS.payableBg,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  calcBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  calcBoxAmount: {
    fontSize: 26,
    fontWeight: '800',
    marginVertical: 2,
  },
  calcBoxSub: {
    fontSize: 11,
    color: COLORS.textMuted,
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
});
