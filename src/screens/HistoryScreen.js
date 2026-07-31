import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';
import { TransactionCard } from '../components/TransactionCard';
import { TransactionCardSkeleton } from '../components/SkeletonLoader';

export const HistoryScreen = () => {
  const { transactions, toggleTransactionStatus, deleteTransaction } = useGuts();

  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL', 'MATCH', 'SETTLEMENT'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'UNSETTLED', 'SETTLED'
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.playerName.toLowerCase().includes(search.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;

    return true;
  });

  return (
    <View style={styles.container}>
      {/* Top Header Filter & Search Controls */}
      <View style={styles.headerArea}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search history by player name or note..."
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

        {/* Dual Filter Rows */}
        <View style={styles.filterGroup}>
          <View style={styles.filterRow}>
            {[
              { id: 'ALL', label: 'All Types' },
              { id: 'MATCH', label: 'Matches' },
              { id: 'SETTLEMENT', label: 'Settlements' },
              { id: 'TRANSFER', label: 'Transfers' },
            ].map(f => (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, typeFilter === f.id && styles.filterChipActive]}
                onPress={() => setTypeFilter(f.id)}
              >
                <Text style={[styles.filterText, typeFilter === f.id && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterRow}>
            {[
              { id: 'ALL', label: 'All Status' },
              { id: 'UNSETTLED', label: 'Pending' },
              { id: 'SETTLED', label: 'Cleared' },
            ].map(f => (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, statusFilter === f.id && styles.filterChipActiveSub]}
                onPress={() => setStatusFilter(f.id)}
              >
                <Text style={[styles.filterText, statusFilter === f.id && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
            data={filteredTransactions}
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
    gap: 10,
  },
  searchBar: {
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
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
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.accentGold,
    fontWeight: '800',
  },
  listContainer: {
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
