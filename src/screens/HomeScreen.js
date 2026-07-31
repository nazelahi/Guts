import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';
import { StatCard } from '../components/StatCard';
import { PlayerCard } from '../components/PlayerCard';
import { LedgerCardSkeleton } from '../components/SkeletonLoader';

export const HomeScreen = ({ onOpenAddPlayer, onOpenAddMatch, onOpenSettle, onOpenTransfer, onOpenPlayerDetail }) => {
  const { playerSummaries } = useGuts();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  const filteredPlayers = playerSummaries.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor={COLORS.accentGold} 
          colors={[COLORS.accentGold]} 
        />
      }
    >
      {/* Visual Stat Overview */}
      <StatCard />

      {/* Quick Action Floating Bar */}
      <View style={styles.quickBar}>
        <TouchableOpacity style={styles.quickActionBtn} onPress={onOpenAddPlayer} activeOpacity={0.8}>
          <View style={styles.actionIconBg}>
            <Ionicons name="person-add" size={16} color={COLORS.accentGold} />
          </View>
          <Text style={styles.actionText}>+ Player</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.quickActionBtn, styles.primaryMatchBtn]} onPress={() => onOpenAddMatch()} activeOpacity={0.8}>
          <View style={styles.primaryActionIconBg}>
            <MaterialCommunityIcons name="trophy" size={18} color="#000" />
          </View>
          <Text style={styles.primaryActionText}>+ Match</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionBtn} onPress={() => onOpenTransfer()} activeOpacity={0.8}>
          <View style={styles.actionIconBg}>
            <MaterialCommunityIcons name="swap-horizontal" size={18} color={COLORS.accentGold} />
          </View>
          <Text style={styles.actionText}>Transfer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionBtn} onPress={() => onOpenSettle(playerSummaries[0] || null)} activeOpacity={0.8}>
          <View style={styles.actionIconBg}>
            <Ionicons name="cash-outline" size={16} color={COLORS.receivable} />
          </View>
          <Text style={styles.actionText}>Settle</Text>
        </TouchableOpacity>
      </View>

      {/* Opponents Ledger List Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>OPPONENT LEDGERS ({playerSummaries.length})</Text>

        {/* Quick Search Input */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={14} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search opponent..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.playerListContainer}>
        {refreshing ? (
          <>
            <LedgerCardSkeleton />
            <LedgerCardSkeleton />
            <LedgerCardSkeleton />
          </>
        ) : filteredPlayers.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-search-outline" size={44} color={COLORS.surfaceBorder} />
            <Text style={styles.emptyTitle}>No Opponents Found</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? 'Try a different search term.' : 'Tap "+ Player" to add your snooker buddies.'}
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  quickBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 4,
  },
  primaryMatchBtn: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.accentGold,
    flex: 1.2,
  },
  actionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.accentGold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accentGold,
  },
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    width: 160,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 12,
    padding: 0,
  },
  playerListContainer: {
    marginHorizontal: 16,
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
    marginTop: 10,
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
