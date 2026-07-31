import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';
import { PlayerCard } from '../components/PlayerCard';
import { LedgerCardSkeleton } from '../components/SkeletonLoader';

export const PlayersScreen = ({ onOpenAddPlayer, onOpenAddMatch, onOpenSettle, onOpenPlayerDetail }) => {
  const { playerSummaries } = useGuts();
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'OWES_YOU', 'YOU_OWE', 'SETTLED'
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  const filteredPlayers = playerSummaries.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === 'OWES_YOU') return p.netCashAmount > 0;
    if (filter === 'YOU_OWE') return p.netCashAmount < 0;
    if (filter === 'SETTLED') return p.netCashAmount === 0;
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top Search & Filter Control Header */}
      <View style={styles.headerArea}>
        <View style={styles.searchBarRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by player name or notes..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity style={styles.addPlayerBtn} onPress={onOpenAddPlayer} activeOpacity={0.8}>
            <Ionicons name="person-add" size={16} color="#000" />
            <Text style={styles.addPlayerBtnText}>Add</Text>
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
              style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
        ) : filteredPlayers.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-search-outline" size={48} color={COLORS.surfaceBorder} />
            <Text style={styles.emptyTitle}>No Players Match Filter</Text>
            <Text style={styles.emptySub}>
              {search ? 'Try adjusting your search criteria.' : 'Tap "+ Player" to add your snooker opponents.'}
            </Text>
          </View>
        ) : (
          filteredPlayers.map(player => (
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

const styles = StyleSheet.create({
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
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.accentGold,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.accentGold,
    fontWeight: '800',
  },
  listScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
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
