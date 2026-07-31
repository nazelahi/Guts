import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';
import { PlayerCard } from '../components/PlayerCard';
import { LedgerCardSkeleton } from '../components/SkeletonLoader';

const SORT_OPTIONS = [
  { id: 'RECENT', label: 'Recent Activity' },
  { id: 'OWES_YOU_MOST', label: 'Owes You Most' },
  { id: 'YOU_OWE_MOST', label: 'You Owe Most' },
  { id: 'GUTS_PTS', label: 'Highest Guts Pts' },
  { id: 'A_Z', label: 'Name (A-Z)' },
];

export const PlayersScreen = ({ onOpenAddPlayer, onOpenAddMatch, onOpenSettle, onOpenPlayerDetail }) => {
  const { playerSummaries, themeColors } = useGuts();
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'OWES_YOU', 'YOU_OWE', 'SETTLED'
  const [sortBy, setSortBy] = useState('RECENT');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  const processedPlayers = playerSummaries
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (filter === 'OWES_YOU') return p.netCashAmount > 0;
      if (filter === 'YOU_OWE') return p.netCashAmount < 0;
      if (filter === 'SETTLED') return p.netCashAmount === 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'OWES_YOU_MOST') return b.netCashAmount - a.netCashAmount;
      if (sortBy === 'YOU_OWE_MOST') return a.netCashAmount - b.netCashAmount;
      if (sortBy === 'GUTS_PTS') return b.netGutsPoints - a.netGutsPoints;
      if (sortBy === 'A_Z') return a.name.localeCompare(b.name);
      // Default: RECENT (creation / transaction count)
      return (b.txCount || 0) - (a.txCount || 0);
    });
  const styles = getStyles(themeColors);

  return (
    <View style={styles.container}>

      {/* Top Search & Filter Control Header */}
      <View style={[styles.headerArea, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.surfaceBorder }]}>
        <View style={styles.searchBarRow}>
          <View style={[styles.searchBar, { backgroundColor: themeColors.surfaceLight, borderColor: themeColors.surfaceBorder }]}>
            <Ionicons name="search" size={16} color={themeColors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: themeColors.textPrimary }]}
              placeholder="Search opponent..."
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

          <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors.accentGold }]} onPress={onOpenAddPlayer} activeOpacity={0.8}>
            <Ionicons name="person-add" size={16} color="#000" />
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {[
            { id: 'ALL', label: 'All Players' },
            { id: 'OWES_YOU', label: 'Owes You' },
            { id: 'YOU_OWE', label: 'You Owe' },
            { id: 'SETTLED', label: 'Settled' },
          ].map(f => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterChip, 
                { backgroundColor: themeColors.surfaceLight, borderColor: themeColors.surfaceBorder },
                filter === f.id && { backgroundColor: themeColors.accentGold, borderColor: themeColors.accentGold }
              ]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={[
                styles.filterText, 
                { color: themeColors.textMuted },
                filter === f.id && { color: '#000', fontWeight: '800' }
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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

      {/* Opponents List Sub-Header */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderCount}>
          SHOWING {processedPlayers.length} OF {playerSummaries.length} OPPONENTS
        </Text>
      </View>

      {/* Opponents List */}
      <ScrollView 
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.accentGold} 
            colors={[COLORS.accentGold]} 
          />
        }
      >
        {refreshing ? (
          <>
            <LedgerCardSkeleton />
            <LedgerCardSkeleton />
            <LedgerCardSkeleton />
          </>
        ) : processedPlayers.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-search-outline" size={48} color={COLORS.surfaceBorder} />
            <Text style={styles.emptyTitle}>No Opponents Found</Text>
            <Text style={styles.emptySub}>
              {search ? 'Try adjusting your search criteria.' : 'Tap "+ Add" to add your snooker opponents.'}
            </Text>
          </View>
        ) : (
          processedPlayers.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              onPressDetail={onOpenPlayerDetail}
              onPressAddMatch={(p) => onOpenAddMatch(p.id)}
              onPressSettle={(p) => onOpenSettle(p)}
            />
          ))
        )}
      </ScrollView>
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
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
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
  addBtn: {
    backgroundColor: COLORS.accentGold,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.accentGold,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
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
  subHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },
  subHeaderCount: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
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

