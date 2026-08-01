import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';

export const PlayerCard = ({ player, onPressDetail, onPressAddMatch, onPressSettle }) => {
  const { settings, themeColors } = useGuts();
  const styles = getStyles(themeColors);
  const symbol = settings.currencySymbol || '$';


  const isOwesYou = player.netCashAmount > 0;
  const isYouOwe = player.netCashAmount < 0;
  const isSettled = player.netCashAmount === 0;

  const initial = player.name ? player.name.charAt(0).toUpperCase() : '?';
  const isLightBg = player.avatarColor === '#F9FAFB' || player.avatarColor === '#F59E0B' || player.avatarColor === '#D4AF37';

  return (
    <TouchableOpacity 
      style={[styles.cardContainer, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder }]} 
      onPress={() => onPressDetail(player)}
      activeOpacity={0.75}
    >
      <View style={styles.topRow}>
        {/* Avatar & Player Info */}
        <View style={styles.playerInfo}>
          <View style={[styles.avatar, { backgroundColor: player.avatarColor || themeColors.primary }]}>
            {player.avatarUri ? (
              <Image source={{ uri: player.avatarUri }} style={styles.avatarImage} />
            ) : player.avatarIcon ? (
              <MaterialCommunityIcons name={player.avatarIcon} size={22} color={isLightBg ? '#000' : '#FFF'} />
            ) : (
              <Text style={[styles.avatarText, isLightBg && { color: '#000' }]}>{initial}</Text>
            )}
          </View>
          <View style={styles.nameContainer}>
            <Text style={[styles.playerName, { color: themeColors.textPrimary }]}>{player.name}</Text>
            {player.notes ? (
              <Text style={[styles.playerNotes, { color: themeColors.textMuted }]} numberOfLines={1}>
                {player.notes}
              </Text>
            ) : (
              <Text style={[styles.playerSubtext, { color: themeColors.textMuted }]}>
                {player.txCount} transaction{player.txCount !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>

        {/* Balance Badge */}
        <View style={styles.balanceContainer}>
          <Text style={[
            styles.cashAmount,
            isOwesYou && { color: themeColors.receivable },
            isYouOwe && { color: themeColors.payable },
            isSettled && { color: themeColors.settled },
          ]}>
            {isOwesYou ? `+${symbol}` : isYouOwe ? `-${symbol}` : symbol}
            {Math.abs(player.netCashAmount).toFixed(2)}
          </Text>

          <View style={styles.gutsPointsRow}>
            <MaterialCommunityIcons 
              name="rhombus-medium" 
              size={12} 
              color={isOwesYou ? themeColors.receivable : isYouOwe ? themeColors.payable : themeColors.settled} 
            />
            <Text style={[
              styles.gutsPointsText,
              isOwesYou && { color: themeColors.receivable },
              isYouOwe && { color: themeColors.payable },
              isSettled && { color: themeColors.settled },
            ]}>
              {player.netGutsPoints > 0 ? `+${player.netGutsPoints}` : player.netGutsPoints} Pts
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Status & Action Buttons */}
      <View style={[styles.footerRow, { borderTopColor: themeColors.surfaceBorder }]}>
        <View style={styles.statusBadgeGroup}>
          <View style={[
            styles.statusBadge,
            isOwesYou && { backgroundColor: themeColors.receivableBg },
            isYouOwe && { backgroundColor: themeColors.payableBg },
            isSettled && { backgroundColor: themeColors.settledBg },
          ]}>
            <Text style={[
              styles.statusText,
              isOwesYou && { color: themeColors.receivable },
              isYouOwe && { color: themeColors.payable },
              isSettled && { color: themeColors.settled },
            ]}>
              {isOwesYou ? 'OWES YOU' : isYouOwe ? 'YOU OWE' : 'SETTLED'}
            </Text>
          </View>
          {player.settledCashAmount > 0 && !isSettled && (
            <Text style={[styles.partialSettleText, { color: themeColors.textMuted }]}>
              (Paid: {symbol}{player.settledCashAmount.toFixed(2)})
            </Text>
          )}
        </View>

        <View style={styles.actionButtonsRow}>
          {!isSettled && (
            <TouchableOpacity 
              style={[styles.smallBtn, styles.settleBtn, { backgroundColor: themeColors.surfaceLight, borderColor: themeColors.accentGold }]} 
              onPress={() => onPressSettle(player)}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle-outline" size={14} color={themeColors.accentGold} />
              <Text style={[styles.settleBtnText, { color: themeColors.accentGold }]}>Settle Up</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.smallBtn, styles.addMatchBtn, { backgroundColor: themeColors.surfaceLight, borderColor: themeColors.surfaceBorder }]} 
            onPress={() => onPressAddMatch(player)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={14} color={themeColors.textPrimary} />
            <Text style={[styles.addMatchBtnText, { color: themeColors.textPrimary }]}>+ Match</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>

  );
};

const getStyles = (COLORS) => StyleSheet.create({

  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.2)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  nameContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  playerNotes: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  playerSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  cashAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  gutsPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  gutsPointsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  partialSettleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  settleBtn: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  settleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentGold,
  },
  addMatchBtn: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addMatchBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
