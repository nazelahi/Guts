import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';
import { TransactionCard } from '../components/TransactionCard';
import { TransactionCardSkeleton } from '../components/SkeletonLoader';

const SORT_OPTIONS = [
  { id: 'NEWEST', label: 'Newest First' },
  { id: 'OLDEST', label: 'Oldest First' },
  { id: 'HIGHEST_AMOUNT', label: 'Highest Cash Amount' },
  { id: 'HIGHEST_POINTS', label: 'Highest Guts Points' },
];

export const HistoryScreen = () => {
  const { transactions, settings, themeColors, toggleTransactionStatus, deleteTransaction } = useGuts();
  const symbol = settings.currencySymbol || '$';

  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL', 'MATCH', 'SETTLEMENT', 'TRANSFER'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'UNSETTLED', 'SETTLED'
  const [clubFilter, setClubFilter] = useState('ALL'); // 'ALL' or clubName string
  const [sortBy, setSortBy] = useState('NEWEST');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  const processedTransactions = transactions
    .filter(t => {
      const matchesSearch = t.playerName.toLowerCase().includes(search.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (clubFilter !== 'ALL' && (t.clubName || '') !== clubFilter) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'OLDEST') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'HIGHEST_AMOUNT') return Math.abs(b.amount || 0) - Math.abs(a.amount || 0);
      if (sortBy === 'HIGHEST_POINTS') return Math.abs(b.gutsPoints || 0) - Math.abs(a.gutsPoints || 0);
      // Default: NEWEST
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  // Calculate totals for active filtered set
  const filteredCashSum = processedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const filteredPtsSum = processedTransactions.reduce((sum, t) => sum + (t.gutsPoints || 0), 0);

  const savedClubs = settings.clubs || ['Imperial Snooker Club', 'Cue Zone Lounge', 'Rack & Cue Arena'];
  const styles = getStyles(themeColors);

  return (
    <View style={styles.container}>

      {/* Top Header Filter & Search Controls */}
      <View style={[styles.headerArea, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.surfaceBorder }]}>
        <View style={[styles.searchBar, { backgroundColor: themeColors.surfaceLight, borderColor: themeColors.surfaceBorder }]}>
          <Ionicons name="search" size={16} color={themeColors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.textPrimary }]}
            placeholder="Search history by opponent or note..."
            placeholderTextColor={themeColors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Dual Filter Rows */}
        <View style={styles.filterGroup}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContainer}>
            {[
              { id: 'ALL', label: 'All Types' },
              { id: 'MATCH', label: 'Matches' },
              { id: 'SETTLEMENT', label: 'Settlements' },
              { id: 'TRANSFER', label: 'Transfers' },
            ].map(f => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterChip, 
                  { backgroundColor: themeColors.surfaceLight, borderColor: themeColors.surfaceBorder },
                  typeFilter === f.id && { backgroundColor: themeColors.accentGold, borderColor: themeColors.accentGold }
                ]}
                onPress={() => setTypeFilter(f.id)}
              >
                <Text style={[
                  styles.chipText, 
                  { color: themeColors.textMuted },
                  typeFilter === f.id && { color: '#000', fontWeight: '800' }
                ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContainer}>
            {[
              { id: 'ALL', label: 'All Status' },
              { id: 'UNSETTLED', label: 'Pending' },
              { id: 'SETTLED', label: 'Cleared' },
            ].map(f => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterChip, 
                  { backgroundColor: themeColors.surfaceLight, borderColor: themeColors.surfaceBorder },
                  statusFilter === f.id && { backgroundColor: themeColors.accentGold, borderColor: themeColors.accentGold }
                ]}
                onPress={() => setStatusFilter(f.id)}
              >
                <Text style={[
                  styles.chipText, 
                  { color: themeColors.textMuted },
                  statusFilter === f.id && { color: '#000', fontWeight: '800' }
                ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Venue Filter Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
          <Text style={[styles.sortLabel, { color: themeColors.textMuted }]}>VENUE:</Text>
          <TouchableOpacity
            style={[
              styles.sortPill, 
              { backgroundColor: themeColors.surfaceLight, borderColor: themeColors.surfaceBorder },
              clubFilter === 'ALL' && { backgroundColor: themeColors.primaryDark, borderColor: themeColors.accentGold }
            ]}
            onPress={() => setClubFilter('ALL')}
          >
            <Text style={[
              styles.sortPillText, 
              { color: themeColors.textMuted },
              clubFilter === 'ALL' && { color: themeColors.accentGold, fontWeight: '800' }
            ]}>
              All Lounges
            </Text>
          </TouchableOpacity>
          {savedClubs.map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.sortPill, 
                { backgroundColor: themeColors.surfaceLight, borderColor: themeColors.surfaceBorder },
                clubFilter === c && { backgroundColor: themeColors.primaryDark, borderColor: themeColors.accentGold }
              ]}
              onPress={() => setClubFilter(c)}
            >
              <Text style={[
                styles.sortPillText, 
                { color: themeColors.textMuted },
                clubFilter === c && { color: themeColors.accentGold, fontWeight: '800' }
              ]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Options Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
          <Text style={[styles.sortLabel, { color: themeColors.textMuted }]}>SORT BY:</Text>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.sortPill, 
                { backgroundColor: themeColors.surfaceLight, borderColor: themeColors.surfaceBorder },
                sortBy === opt.id && { backgroundColor: themeColors.primaryDark, borderColor: themeColors.accentGold }
              ]}
              onPress={() => setSortBy(opt.id)}
            >
              <Text style={[
                styles.sortPillText, 
                { color: themeColors.textMuted },
                sortBy === opt.id && { color: themeColors.accentGold, fontWeight: '800' }
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter Summary Stats Banner */}
      <View style={[styles.summaryBanner, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.surfaceBorder }]}>
        <Text style={[styles.summaryBannerText, { color: themeColors.textMuted }]}>
          SHOWING {processedTransactions.length} OF {transactions.length} LOGS
        </Text>
        <Text style={[styles.summaryBannerTotals, { color: themeColors.textPrimary }]}>
          Net: <Text style={{ color: filteredPtsSum >= 0 ? themeColors.receivable : themeColors.payable }}>{filteredPtsSum >= 0 ? `+${filteredPtsSum}` : filteredPtsSum} Pts</Text>
          {'  •  '}
          <Text style={{ color: filteredCashSum >= 0 ? themeColors.receivable : themeColors.payable }}>{filteredCashSum >= 0 ? `+${symbol}` : `-${symbol}`}{Math.abs(filteredCashSum).toFixed(2)}</Text>
        </Text>
      </View>


      {/* History List */}
      <View style={styles.listArea}>
        {refreshing ? (
          <View style={{ padding: 16 }}>
            <TransactionCardSkeleton />
            <TransactionCardSkeleton />
            <TransactionCardSkeleton />
            <TransactionCardSkeleton />
          </View>
        ) : (
          <FlatList
            data={processedTransactions}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                tintColor={COLORS.accentGold} 
                colors={[COLORS.accentGold]} 
              />
            }
            renderItem={({ item }) => (
              <TransactionCard
                transaction={item}
                onToggleStatus={toggleTransactionStatus}
                onDelete={deleteTransaction}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="history" size={48} color={COLORS.surfaceBorder} />
                <Text style={styles.emptyTitle}>No History Records Found</Text>
                <Text style={styles.emptySub}>
                  {search ? 'Try adjusting your search criteria.' : 'Your Guts matches and settlements will appear here.'}
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const getStyles = (COLORS) => StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
    gap: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    padding: 0,
  },
  filterGroup: {
    gap: 8,
  },
  filterScrollContainer: {
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.accentGold,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.accentGold,
    fontWeight: '800',
  },
  sortRow: {
    flexDirection: 'row',
    paddingTop: 2,
  },
  sortLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    alignSelf: 'center',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  sortPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  sortPillActive: {
    borderColor: COLORS.accentGold,
    backgroundColor: COLORS.primaryDark,
  },
  sortPillText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  sortPillTextActive: {
    color: COLORS.accentGold,
    fontWeight: '700',
  },
  summaryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },
  summaryBannerText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  summaryBannerTotals: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  listArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginTop: 20,
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
  },
});

