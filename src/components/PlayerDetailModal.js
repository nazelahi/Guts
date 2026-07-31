import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, FlatList, Share, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';
import { TransactionCard } from './TransactionCard';

export const PlayerDetailModal = ({ visible, onClose, player, onOpenAddMatch, onOpenSettle, onOpenTransfer, onEditPlayer }) => {
  const { transactions, settings, toggleTransactionStatus, deleteTransaction, deletePlayer, showToast } = useGuts();
  const symbol = settings.currencySymbol || '$';

  if (!player) return null;

  const playerTxs = transactions.filter(t => t.playerId === player.id);

  const isOwesYou = player.netCashAmount > 0;
  const isYouOwe = player.netCashAmount < 0;
  const isSettled = player.netCashAmount === 0;
  const isLightBg = player.avatarColor === '#F9FAFB' || player.avatarColor === '#F59E0B' || player.avatarColor === '#D4AF37';

  const handleShareStatement = async () => {
    const statusText = isOwesYou
      ? `OWES YOU ${symbol}${Math.abs(player.netCashAmount).toFixed(2)} (+${player.netGutsPoints} Guts Pts)`
      : isYouOwe
      ? `YOU OWE ${symbol}${Math.abs(player.netCashAmount).toFixed(2)} (${player.netGutsPoints} Guts Pts)`
      : `SETTLED (0.00)`;

    const statement = `🎱 SNOOKER GUTS LEDGER STATEMENT
Club: ${settings.clubName || 'Snooker Club'}
Opponent: ${player.name}

Status: ${statusText}
Total Transactions: ${playerTxs.length}

Generated via Snooker Guts App 🎱`;

    try {
      await Share.share({ message: statement });
    } catch (e) {
      console.error('Error sharing statement', e);
    }
  };

  const handleDeletePlayerPrompt = () => {
    Alert.alert(
      'Delete Player?',
      `Are you sure you want to delete ${player.name}? This will remove all their match history from your ledger.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            await deletePlayer(player.id);
            onClose();
          } 
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header Bar */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Head-to-Head Ledger</Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => { onClose(); onEditPlayer(player); }} style={styles.deleteBtn}>
                <Ionicons name="create-outline" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleShareStatement} style={styles.deleteBtn}>
                <Ionicons name="share-social-outline" size={20} color={COLORS.accentGold} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDeletePlayerPrompt} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color={COLORS.payable} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Overview Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              <View style={[styles.avatar, { backgroundColor: player.avatarColor || COLORS.primary }]}>
                {player.avatarUri ? (
                  <Image source={{ uri: player.avatarUri }} style={styles.avatarImage} />
                ) : player.avatarIcon ? (
                  <MaterialCommunityIcons name={player.avatarIcon} size={26} color={isLightBg ? '#000' : '#FFF'} />
                ) : (
                  <Text style={[styles.avatarText, isLightBg && { color: '#000' }]}>
                    {player.name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>

              <View style={styles.profileMeta}>
                <Text style={styles.playerName}>{player.name}</Text>
                {player.phone ? (
                  <View style={styles.phoneRow}>
                    <Ionicons name="call-outline" size={12} color={COLORS.accentGold} />
                    <Text style={styles.phoneText}>{player.phone}</Text>
                  </View>
                ) : null}
                {player.notes ? (
                  <Text style={styles.notesText}>{player.notes}</Text>
                ) : null}
              </View>
            </View>

            {/* Financial Summary */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryBoxLabel}>GUTS POINTS</Text>
                <Text style={[
                  styles.summaryBoxVal,
                  player.netGutsPoints > 0 && { color: COLORS.receivable },
                  player.netGutsPoints < 0 && { color: COLORS.payable },
                ]}>
                  {player.netGutsPoints > 0 ? `+${player.netGutsPoints}` : player.netGutsPoints} Pts
                </Text>
              </View>

              <View style={[styles.summaryBox, styles.summaryBoxDivider]}>
                <Text style={styles.summaryBoxLabel}>NET CASH BALANCE</Text>
                <Text style={[
                  styles.summaryBoxVal,
                  isOwesYou && { color: COLORS.receivable },
                  isYouOwe && { color: COLORS.payable },
                  isSettled && { color: COLORS.settled },
                ]}>
                  {isOwesYou ? `+${symbol}` : isYouOwe ? `-${symbol}` : symbol}
                  {Math.abs(player.netCashAmount).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.actionRow}>
              {!isSettled && (
                <TouchableOpacity 
                  style={styles.settleBtn}
                  onPress={() => { onClose(); onOpenSettle(player); }}
                >
                  <Ionicons name="checkmark-done" size={16} color="#000" />
                  <Text style={styles.settleBtnText}>Settle Up</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.addMatchBtn}
                onPress={() => { onClose(); onOpenAddMatch(player); }}
              >
                <Ionicons name="add-circle-outline" size={16} color={COLORS.accentGold} />
                <Text style={styles.addMatchBtnText}>+ Match</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.transferBtn}
                onPress={() => { onClose(); onOpenTransfer(player.id); }}
              >
                <MaterialCommunityIcons name="swap-horizontal" size={16} color={COLORS.textPrimary} />
                <Text style={styles.transferBtnText}>Transfer</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Transaction History Section */}
          <Text style={styles.sectionHeader}>MATCH & PAYMENT HISTORY ({playerTxs.length})</Text>

          {playerTxs.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="billiards-rack" size={40} color={COLORS.surfaceBorder} />
              <Text style={styles.emptyTitle}>No Guts Games Logged Yet</Text>
              <Text style={styles.emptySub}>Tap "+ Log Match" to record points won or lost against {player.name}.</Text>
            </View>
          ) : (
            <FlatList
              data={playerTxs}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TransactionCard
                  transaction={item}
                  onToggleStatus={toggleTransactionStatus}
                  onDelete={deleteTransaction}
                />
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  deleteBtn: {
    padding: 4,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
  },
  profileMeta: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  phoneText: {
    fontSize: 12,
    color: COLORS.accentGold,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
  },
  summaryBoxDivider: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.surfaceBorder,
  },
  summaryBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryBoxVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  settleBtn: {
    flex: 1,
    backgroundColor: COLORS.accentGold,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  settleBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13,
  },
  addMatchBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  addMatchBtnText: {
    color: COLORS.accentGold,
    fontWeight: '700',
    fontSize: 13,
  },
  transferBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  transferBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
});
