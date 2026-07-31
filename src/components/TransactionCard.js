import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';

export const TransactionCard = ({ transaction, onToggleStatus, onDelete }) => {
  const { settings, showToast } = useGuts();
  const symbol = settings.currencySymbol || '$';

  const isMatch = transaction.type === 'MATCH';
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

  return (
    <View style={[styles.card, isSettled && styles.settledCard]}>
      <View style={styles.leftCol}>
        <View style={[
          styles.iconBg,
          isMatch 
            ? { backgroundColor: 'rgba(212, 175, 55, 0.15)', borderColor: COLORS.accentGold } 
            : { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: COLORS.receivable }
        ]}>
          <MaterialCommunityIcons 
            name={isMatch ? "billiards" : "cash-check"} 
            size={20} 
            color={isMatch ? COLORS.accentGold : COLORS.receivable} 
          />
        </View>

        <View style={styles.detailsCol}>
          <View style={styles.nameRow}>
            <Text style={styles.playerName}>{transaction.playerName}</Text>
            <TouchableOpacity 
              style={[styles.statusTag, isSettled ? styles.settledTag : styles.unsettledTag]}
              onPress={handleToggle}
            >
              <Ionicons 
                name={isSettled ? "checkmark-circle" : "time-outline"} 
                size={12} 
                color={isSettled ? COLORS.settled : COLORS.accentGold} 
              />
              <Text style={[styles.statusTagText, { color: isSettled ? COLORS.settled : COLORS.accentGold }]}>
                {isSettled ? 'Settled' : 'Pending'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.dateText}>{formattedDate}</Text>

          {transaction.clubName ? (
            <View style={styles.clubBadge}>
              <MaterialCommunityIcons name="map-marker-outline" size={11} color={COLORS.accentGold} />
              <Text style={styles.clubBadgeText}>{transaction.clubName}</Text>
            </View>
          ) : null}
          
          {transaction.notes ? (
            <Text style={styles.notesText} numberOfLines={1}>
              {transaction.notes}
            </Text>
          ) : null}

          {isMatch && (
            <Text style={styles.rateDetailText}>
              {transaction.gutsPoints > 0 ? `+${transaction.gutsPoints}` : transaction.gutsPoints} Guts Pts @ {symbol}{transaction.ratePerPoint}/pt
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={[
          styles.amountText,
          isPositive && { color: COLORS.receivable },
          isNegative && { color: COLORS.payable },
          transaction.amount === 0 && { color: COLORS.textMuted },
        ]}>
          {isPositive ? `+${symbol}` : isNegative ? `-${symbol}` : symbol}
          {Math.abs(transaction.amount).toFixed(2)}
        </Text>

        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
