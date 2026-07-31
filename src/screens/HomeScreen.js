import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';
import { StatCard } from '../components/StatCard';
import { MonthlyTrendsChart } from '../components/MonthlyTrendsChart';
import { PlayerCard } from '../components/PlayerCard';
import { LedgerCardSkeleton } from '../components/SkeletonLoader';

export const HomeScreen = ({ onOpenAddPlayer, onOpenAddMatch, onOpenSettle, onOpenTransfer, onOpenPlayerDetail }) => {
  const { playerSummaries, themeColors, showToast } = useGuts();
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

  const styles = getStyles(themeColors);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor={themeColors.accentGold} 
          colors={[themeColors.accentGold]} 
        />
      }
    >

      {/* Visual Stat Overview */}
      <StatCard />

      {/* Monthly Performance & Financial Trends Chart */}
      <MonthlyTrendsChart />


      {/* Quick Action Floating Bar */}
      <View style={styles.quickBar}>
        <TouchableOpacity style={styles.quickActionBtn} onPress={onOpenAddPlayer} activeOpacity={0.8}>
          <View style={styles.actionIconBg}>
            <Ionicons name="person-add" size={13} color={themeColors.accentGold} />
          </View>
          <Text style={styles.actionText}>Player</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.quickActionBtn, styles.primaryMatchBtn]} 
          onPress={() => {
            if (playerSummaries.length === 0) {
              showToast('Please add an opponent player first.', 'error');
            } else {
              onOpenAddMatch();
            }
          }} 
          activeOpacity={0.8}
        >
          <View style={styles.primaryActionIconBg}>
            <MaterialCommunityIcons name="sword-cross" size={14} color={themeColors.accentGold} />
          </View>
          <Text style={styles.primaryActionText}>Match</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionBtn} onPress={() => onOpenTransfer()} activeOpacity={0.8}>
          <View style={styles.actionIconBg}>
            <MaterialCommunityIcons name="swap-horizontal" size={14} color={themeColors.accentGold} />
          </View>
          <Text style={styles.actionText}>Transfer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionBtn} 
          onPress={() => {
            if (playerSummaries.length === 0) {
              showToast('Please add an opponent player first.', 'error');
            } else {
              onOpenSettle(playerSummaries[0]);
            }
          }} 
          activeOpacity={0.8}
        >
          <View style={styles.actionIconBg}>
            <Ionicons name="cash-outline" size={13} color={themeColors.receivable} />
          </View>
          <Text style={styles.actionText}>Settle</Text>
        </TouchableOpacity>
      </View>

      {/* Opponents Ledger List Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>OPPONENT LEDGERS ({playerSummaries.length})</Text>

        {/* Quick Search Input */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={14} color={themeColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search opponent..."
            placeholderTextColor={themeColors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={14} color={themeColors.textMuted} />
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
            <MaterialCommunityIcons name="account-search-outline" size={44} color={themeColors.surfaceBorder} />
            <Text style={styles.emptyTitle}>No Opponents Found</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? `No opponents match "${searchQuery}"` : 'Add your first opponent player to start tracking ledger balances.'}
            </Text>
          </View>
        ) : (
          filteredPlayers.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              onPressDetail={onOpenPlayerDetail}
              onPressAddMatch={onOpenAddMatch}
              onPressSettle={onOpenSettle}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const getStyles = (COLORS) => StyleSheet.create({
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
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 6,
  },
  primaryMatchBtn: {
    backgroundColor: COLORS.accentGold,
    borderColor: COLORS.accentGold,
    flex: 1.1,
  },
  actionIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  primaryActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
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
