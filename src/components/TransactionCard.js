import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';

export const TransactionCard = ({ transaction, onToggleStatus, onDelete }) => {
  const { settings, themeColors, showToast } = useGuts();
  const styles = getStyles(themeColors);
  const symbol = settings.currencySymbol || '$';


  const isMatch = transaction.type === 'MATCH';
  const isTransfer = transaction.type === 'TRANSFER';
  const isSettlement = transaction.type === 'SETTLEMENT';
  const isPartial = isSettlement && transaction.notes?.toLowerCase().includes('partial');
  const isPositive = transaction.amount > 0;
  const isNegative = transaction.amount < 0;
  const isSettled = transaction.status === 'SETTLED';

  const handleToggle = () => {
    onToggleStatus(transaction.id);
    showToast(
      isSettled
        ? `Marked record for ${transaction.playerName} as Pending`
        : `Marked record for ${transaction.playerName} as Settled`,
      'success'
    );
  };

  const handleDelete = () => {
    onDelete(transaction.id);
    showToast('Deleted record', 'success');
  };

  const formattedDate = transaction.date
    ? new Date(transaction.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  let iconBgColor = 'rgba(16, 185, 129, 0.15)';
  let borderColor = themeColors.receivable;
  let iconName = 'cash-check';
  let iconColor = themeColors.receivable;

  if (isMatch) {
    iconBgColor = 'rgba(212, 175, 55, 0.15)';
    borderColor = themeColors.accentGold;
    iconName = 'billiards';
    iconColor = themeColors.accentGold;
  } else if (isTransfer) {
    iconBgColor = 'rgba(107, 114, 128, 0.15)';
    borderColor = themeColors.textSecondary;
    iconName = 'swap-horizontal';
    iconColor = themeColors.textSecondary;
  }

  return (
    <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder }, isSettled && styles.settledCard]}>
      <View style={styles.leftCol}>
        <View style={[
          styles.iconBg,
          { backgroundColor: iconBgColor, borderColor: borderColor }
        ]}>
          <MaterialCommunityIcons 
            name={iconName} 
            size={20} 
            color={iconColor} 
          />
        </View>

        <View style={styles.detailsCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.playerName, { color: themeColors.textPrimary }]}>{transaction.playerName}</Text>
            <TouchableOpacity 
              style={[styles.statusTag, isSettled ? styles.settledTag : styles.unsettledTag]}
              onPress={handleToggle}
            >
              <Ionicons 
                name={isSettled ? "checkmark-circle" : "time-outline"} 
                size={12} 
                color={isSettled ? themeColors.settled : themeColors.accentGold} 
              />
              <Text style={[styles.statusTagText, { color: isSettled ? themeColors.settled : themeColors.accentGold }]}>
                {isSettled ? 'Settled' : 'Pending'}
              </Text>
            </TouchableOpacity>

            {isSettlement && (
              <View style={[
                styles.settlementTag, 
                isPartial ? styles.partialTag : styles.fullSettleTag,
                { borderWidth: 1 }
              ]}>
                <Text style={[
                  styles.settlementTagText, 
                  { color: isPartial ? '#60A5FA' : themeColors.settled }
                ]}>
                  {isPartial ? 'Partial Payment' : 'Full Settlement'}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.dateText, { color: themeColors.textMuted }]}>{formattedDate}</Text>

          {transaction.clubName ? (
            <View style={styles.clubBadge}>
              <MaterialCommunityIcons name="map-marker-outline" size={11} color={themeColors.accentGold} />
              <Text style={[styles.clubBadgeText, { color: themeColors.accentGold }]}>{transaction.clubName}</Text>
            </View>
          ) : null}
          
          {transaction.notes ? (
            <Text style={[styles.notesText, { color: themeColors.textMuted }]} numberOfLines={1}>
              {transaction.notes}
            </Text>
          ) : null}

          {(isMatch || isTransfer) && (
            <Text style={[styles.rateDetailText, { color: themeColors.textSecondary }]}>
              {transaction.gutsPoints > 0 ? `+${transaction.gutsPoints}` : transaction.gutsPoints} Guts Pts @ {symbol}{transaction.ratePerPoint}/pt
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={[
          styles.amountText,
          isPositive && { color: themeColors.receivable },
          isNegative && { color: themeColors.payable },
          transaction.amount === 0 && { color: themeColors.textMuted },
        ]}>
          {isPositive ? `+${symbol}` : isNegative ? `-${symbol}` : symbol}
          {Math.abs(transaction.amount).toFixed(2)}
        </Text>

        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={14} color={themeColors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};


const getStyles = (COLORS) => StyleSheet.create({

  card: {
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
  settledCard: {
    opacity: 0.75,
    backgroundColor: 'rgba(19, 27, 22, 0.6)',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  detailsCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unsettledTag: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  settledTag: {
    backgroundColor: COLORS.settledBg,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  settlementTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  partialTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  fullSettleTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  settlementTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  clubBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accentGold,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  rateDetailText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accentGold,
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 48,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  deleteBtn: {
    padding: 4,
  },
});
