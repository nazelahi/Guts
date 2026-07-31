import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';

export const MonthlyTrendsChart = () => {
  const { transactions, settings, themeColors } = useGuts();
  const styles = getStyles(themeColors);
  const symbol = settings.currencySymbol || '$';

  const [selectedMonthKey, setSelectedMonthKey] = useState('ALL');

  // Derive unique months from transactions
  const monthOptions = useMemo(() => {
    const monthsMap = new Map();
    monthsMap.set('ALL', 'All-Time');

    transactions.forEach(t => {
      if (t.date) {
        try {
          const d = new Date(t.date);
          if (!isNaN(d.getTime())) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
            if (!monthsMap.has(key)) {
              monthsMap.set(key, label);
            }
          }
        } catch (e) {
          // Fallback
        }
      }
    });

    return Array.from(monthsMap.entries()).map(([key, label]) => ({ key, label }));
  }, [transactions]);

  // Compute monthly stats for selected key
  const stats = useMemo(() => {
    const filteredTxs = transactions.filter(t => {
      if (selectedMonthKey === 'ALL') return true;
      if (!t.date) return false;
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === selectedMonthKey;
    });

    let ptsWon = 0;
    let ptsLost = 0;
    let cashCollected = 0;
    let cashPaidOut = 0;

    filteredTxs.forEach(t => {
      const pts = Number(t.gutsPoints) || 0;
      const amt = Number(t.amount) || 0;

      if (pts > 0) ptsWon += pts;
      else if (pts < 0) ptsLost += Math.abs(pts);

      if (amt > 0) cashCollected += amt;
      else if (amt < 0) cashPaidOut += Math.abs(amt);
    });

    const totalPtsVolume = ptsWon + ptsLost;
    const ptsWonPct = totalPtsVolume > 0 ? Math.round((ptsWon / totalPtsVolume) * 100) : 0;
    const ptsLostPct = totalPtsVolume > 0 ? Math.round((ptsLost / totalPtsVolume) * 100) : 0;

    const totalCashVolume = cashCollected + cashPaidOut;
    const cashCollectedPct = totalCashVolume > 0 ? Math.round((cashCollected / totalCashVolume) * 100) : 0;

    const netPts = ptsWon - ptsLost;
    const netCash = cashCollected - cashPaidOut;

    return {
      txCount: filteredTxs.length,
      ptsWon,
      ptsLost,
      ptsWonPct,
      ptsLostPct,
      netPts,
      cashCollected: Number(cashCollected.toFixed(2)),
      cashPaidOut: Number(cashPaidOut.toFixed(2)),
      cashCollectedPct,
      netCash: Number(netCash.toFixed(2)),
    };
  }, [transactions, selectedMonthKey]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={18} color={themeColors.accentGold} />
          <Text style={[styles.headerTitle, { color: themeColors.textSecondary }]}>PERFORMANCE & CASH FLOW TRENDS</Text>
        </View>
        <Text style={[styles.headerSub, { color: themeColors.textMuted }]}>{stats.txCount} games logged</Text>
      </View>

      {/* Month Selector Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
        {monthOptions.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.monthPill, 
              { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder },
              selectedMonthKey === opt.key && { borderColor: themeColors.accentGold, backgroundColor: themeColors.primaryDark }
            ]}
            onPress={() => setSelectedMonthKey(opt.key)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.monthPillText, 
              { color: themeColors.textMuted },
              selectedMonthKey === opt.key && { color: themeColors.accentGold, fontWeight: '800' }
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Performance Cards Container */}
      <View style={styles.cardsRow}>
        {/* Points Performance Card */}
        <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="trophy-outline" size={14} color={themeColors.accentGold} />
            <Text style={[styles.cardTitle, { color: themeColors.textMuted }]}>GUTS POINTS RATIO</Text>
          </View>

          <View style={[styles.netBox, { backgroundColor: themeColors.surfaceLight }]}>
            <Text style={[styles.netBoxLabel, { color: themeColors.textMuted }]}>NET POINTS</Text>
            <Text style={[
              styles.netBoxVal,
              stats.netPts > 0 && { color: themeColors.receivable },
              stats.netPts < 0 && { color: themeColors.payable },
            ]}>
              {stats.netPts > 0 ? `+${stats.netPts}` : stats.netPts} Pts
            </Text>
          </View>

          {/* Points Bar Chart Tracks */}
          <View style={styles.barGroup}>
            {/* Points Won Bar */}
            <View style={styles.barRow}>
              <Text style={[styles.barLabel, { color: themeColors.textMuted }]}>WON (+{stats.ptsWon})</Text>
              <View style={[styles.track, { backgroundColor: themeColors.surfaceBorder }]}>
                <View style={[styles.fillWon, { backgroundColor: themeColors.receivable, width: `${stats.ptsWonPct}%` }]} />
              </View>
              <Text style={[styles.barPctWin, { color: themeColors.receivable }]}>{stats.ptsWonPct}%</Text>
            </View>

            {/* Points Lost Bar */}
            <View style={styles.barRow}>
              <Text style={[styles.barLabel, { color: themeColors.textMuted }]}>LOST (-{stats.ptsLost})</Text>
              <View style={[styles.track, { backgroundColor: themeColors.surfaceBorder }]}>
                <View style={[styles.fillLost, { backgroundColor: themeColors.payable, width: `${stats.ptsLostPct}%` }]} />
              </View>
              <Text style={[styles.barPctLoss, { color: themeColors.payable }]}>{stats.ptsLostPct}%</Text>
            </View>
          </View>
        </View>

        {/* Cash Flow Summary Card */}
        <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash-outline" size={14} color={themeColors.receivable} />
            <Text style={[styles.cardTitle, { color: themeColors.textMuted }]}>CASH FLOW SUMMARY</Text>
          </View>

          <View style={[styles.netBox, { backgroundColor: themeColors.surfaceLight }]}>
            <Text style={[styles.netBoxLabel, { color: themeColors.textMuted }]}>NET CASH POSITION</Text>
            <Text style={[
              styles.netBoxVal,
              stats.netCash > 0 && { color: themeColors.receivable },
              stats.netCash < 0 && { color: themeColors.payable },
            ]}>
              {stats.netCash > 0 ? `+${symbol}` : stats.netCash < 0 ? `-${symbol}` : symbol}
              {Math.abs(stats.netCash).toFixed(2)}
            </Text>
          </View>

          <View style={styles.cashFlowBreakdown}>
            <View style={styles.cashRow}>
              <Text style={[styles.cashSubLabel, { color: themeColors.textMuted }]}>Collected / Receivable:</Text>
              <Text style={[styles.cashValWin, { color: themeColors.receivable }]}>+{symbol}{stats.cashCollected.toFixed(2)}</Text>
            </View>

            <View style={styles.cashRow}>
              <Text style={[styles.cashSubLabel, { color: themeColors.textMuted }]}>Paid Out / Payable:</Text>
              <Text style={[styles.cashValLoss, { color: themeColors.payable }]}>-{symbol}{stats.cashPaidOut.toFixed(2)}</Text>
            </View>

            {/* Cash Proportion Track */}
            <View style={styles.trackLarge}>
              <View style={[styles.fillWon, { backgroundColor: themeColors.receivable, width: `${stats.cashCollectedPct}%` }]} />
            </View>
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  monthScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  monthPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  monthPillActive: {
    borderColor: COLORS.accentGold,
    backgroundColor: COLORS.primaryDark,
  },
  monthPillText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  monthPillTextActive: {
    color: COLORS.accentGold,
    fontWeight: '800',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  netBox: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  netBoxLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  netBoxVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  barGroup: {
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    width: 50,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.surfaceBorder,
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackLarge: {
    height: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  fillWon: {
    height: '100%',
    backgroundColor: COLORS.receivable,
    borderRadius: 3,
  },
  fillLost: {
    height: '100%',
    backgroundColor: COLORS.payable,
    borderRadius: 3,
  },
  barPctWin: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.receivable,
    width: 26,
    textAlign: 'right',
  },
  barPctLoss: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.payable,
    width: 26,
    textAlign: 'right',
  },
  cashFlowBreakdown: {
    gap: 4,
  },
  cashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cashSubLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  cashValWin: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.receivable,
  },
  cashValLoss: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.payable,
  },
});
