import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';

export const StatCard = () => {
  const { clubTotals, settings, themeColors } = useGuts();
  const styles = getStyles(themeColors);
  const symbol = settings.currencySymbol || '$';


  const isNetPositive = clubTotals.netCashPosition >= 0;

  return (
    <View style={styles.container}>
      {/* Main Net Position Banner */}
      <View style={[styles.mainCard, { backgroundColor: themeColors.surface }, isNetPositive ? styles.borderReceivable : styles.borderPayable]}>
        <View style={styles.netHeader}>
          <Text style={[styles.netLabel, { color: themeColors.textSecondary }]}>NET GUTS POSITION</Text>
          <View style={[styles.statusBadge, { backgroundColor: isNetPositive ? themeColors.receivableBg : themeColors.payableBg }]}>
            <Ionicons 
              name={isNetPositive ? 'arrow-up-circle' : 'arrow-down-circle'} 
              size={16} 
              color={isNetPositive ? themeColors.receivable : themeColors.payable} 
            />
            <Text style={[styles.statusBadgeText, { color: isNetPositive ? themeColors.receivable : themeColors.payable }]}>
              {isNetPositive ? 'Net Receivable' : 'Net Payable'}
            </Text>
          </View>
        </View>

        <Text style={[styles.netAmount, { color: isNetPositive ? themeColors.receivable : themeColors.payable }]}>
          {symbol}{Math.abs(clubTotals.netCashPosition).toFixed(2)}
        </Text>
        
        <Text style={[styles.netSubtext, { color: themeColors.textMuted }]}>
          Across {clubTotals.activePlayersCount} active opponents in ledger
        </Text>
      </View>

      {/* Grid Breakdowns */}
      <View style={styles.gridContainer}>
        {/* Total You Get / Receivable */}
        <View style={[styles.subCard, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder }]}>
          <View style={styles.subCardHeader}>
            <View style={[styles.miniIconBg, { backgroundColor: themeColors.receivableBg }]}>
              <Feather name="arrow-down-left" size={16} color={themeColors.receivable} />
            </View>
            <Text style={[styles.subCardTitle, { color: themeColors.textSecondary }]}>TO GET (RECEIVABLE)</Text>
          </View>
          <Text style={[styles.subCardAmount, { color: themeColors.receivable }]}>
            {symbol}{clubTotals.totalReceivableCash.toFixed(2)}
          </Text>
          <View style={styles.pointsPill}>
            <MaterialCommunityIcons name="trophy-outline" size={12} color={themeColors.receivable} />
            <Text style={[styles.pointsPillText, { color: themeColors.receivable }]}>
              +{clubTotals.totalReceivablePoints} Guts Pts
            </Text>
          </View>
        </View>

        {/* Total You Owe / Payable */}
        <View style={[styles.subCard, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder }]}>
          <View style={styles.subCardHeader}>
            <View style={[styles.miniIconBg, { backgroundColor: themeColors.payableBg }]}>
              <Feather name="arrow-up-right" size={16} color={themeColors.payable} />
            </View>
            <Text style={[styles.subCardTitle, { color: themeColors.textSecondary }]}>TO GIVE (PAYABLE)</Text>
          </View>
          <Text style={[styles.subCardAmount, { color: themeColors.payable }]}>
            {symbol}{clubTotals.totalPayableCash.toFixed(2)}
          </Text>
          <View style={styles.pointsPill}>
            <MaterialCommunityIcons name="alert-circle-outline" size={12} color={themeColors.payable} />
            <Text style={[styles.pointsPillText, { color: themeColors.payable }]}>
              -{clubTotals.totalPayablePoints} Guts Pts
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};


const getStyles = (COLORS) => StyleSheet.create({

  container: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  mainCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    elevation: 4,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  borderReceivable: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  borderPayable: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  netHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  netAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  netSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  subCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  miniIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subCardTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  subCardAmount: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
