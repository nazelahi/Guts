import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Platform, AppState } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from './src/theme/colors';
import { GutsProvider, useGuts } from './src/context/GutsContext';
import { Header } from './src/components/Header';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlayersScreen } from './src/screens/PlayersScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

import { AddPlayerModal } from './src/components/AddPlayerModal';
import { AddTransactionModal } from './src/components/AddTransactionModal';
import { SettleUpModal } from './src/components/SettleUpModal';
import { PlayerDetailModal } from './src/components/PlayerDetailModal';
import { GutsCalculatorModal } from './src/components/GutsCalculatorModal';
import { TransferPointsModal } from './src/components/TransferPointsModal';
import { SplashScreen } from './src/components/SplashScreen';
import { PasscodeLockScreen } from './src/components/PasscodeLockScreen';

function MainApp() {
  const { isLoading, settings, themeColors, players, showToast } = useGuts();
  const [showSplash, setShowSplash] = useState(true);
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('HOME'); // 'HOME', 'PLAYERS', 'HISTORY', 'SETTINGS'

  // Passcode Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const appState = useRef(AppState.currentState);

  // Modals state
  const [addPlayerVisible, setAddPlayerVisible] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState(null);
  const [addTxVisible, setAddTxVisible] = useState(false);
  const [initialPlayerForTx, setInitialPlayerForTx] = useState(null);
  
  const [settleVisible, setSettleVisible] = useState(false);
  const [settlePlayer, setSettlePlayer] = useState(null);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailPlayer, setDetailPlayer] = useState(null);

  const [transferVisible, setTransferVisible] = useState(false);
  const [transferFromPlayerId, setTransferFromPlayerId] = useState(null);

  const [calculatorVisible, setCalculatorVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  // Sync auth state when settings load
  useEffect(() => {
    if (settings && !settings.usePasscode) {
      setIsAuthenticated(true);
    }
  }, [settings?.usePasscode]);

  // Monitor AppState change to lock the app when minimized/resumed
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (settings?.usePasscode) {
          setIsAuthenticated(false);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [settings?.usePasscode]);

  if (isLoading || showSplash) {
    return <SplashScreen subtitle={settings?.clubName || 'Snooker Club Points & Ledger'} />;
  }

  if (settings?.usePasscode && !isAuthenticated) {
    return (
      <PasscodeLockScreen
        correctPasscode={settings.passcode}
        onSuccess={() => setIsAuthenticated(true)}
        title="ENTER PASSCODE TO UNLOCK"
        description="Verify passcode to access Guts Ledger"
      />
    );
  }

  // Modal Triggers
  const openAddPlayerModal = () => {
    setPlayerToEdit(null);
    setAddPlayerVisible(true);
  };

  const openEditPlayerModal = (player) => {
    setPlayerToEdit(player);
    setAddPlayerVisible(true);
  };

  const openAddMatchModal = (playerId = null) => {
    setInitialPlayerForTx(playerId);
    setAddTxVisible(true);
  };

  const openSettleModal = (player) => {
    setSettlePlayer(player);
    setSettleVisible(true);
  };

  const openTransferModal = (fromPlayerId = null) => {
    setTransferFromPlayerId(fromPlayerId);
    setTransferVisible(true);
  };

  const openPlayerDetailModal = (player) => {
    setDetailPlayer(player);
    setDetailVisible(true);
  };

  const handleCalculatorLog = ({ playerId, gutsPoints, ratePerPoint }) => {
    setInitialPlayerForTx(playerId);
    setAddTxVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <StatusBar barStyle="light-content" backgroundColor={themeColors.surface} />
      
      {/* Top Brand Header */}
      <Header 
        onOpenSettings={() => setActiveTab('SETTINGS')}
        onOpenCalculator={() => setCalculatorVisible(true)}
      />

      {/* Dynamic Main Body Screen */}
      <View style={styles.screenBody}>
        {activeTab === 'HOME' && (
          <HomeScreen
            onOpenAddPlayer={openAddPlayerModal}
            onOpenAddMatch={openAddMatchModal}
            onOpenSettle={openSettleModal}
            onOpenTransfer={openTransferModal}
            onOpenPlayerDetail={openPlayerDetailModal}
          />
        )}

        {activeTab === 'PLAYERS' && (
          <PlayersScreen
            onOpenAddPlayer={openAddPlayerModal}
            onOpenAddMatch={openAddMatchModal}
            onOpenSettle={openSettleModal}
            onOpenPlayerDetail={openPlayerDetailModal}
          />
        )}

        {activeTab === 'HISTORY' && <HistoryScreen />}

        {activeTab === 'SETTINGS' && <SettingsScreen />}
      </View>

      {/* Floating Action Button for Quick Match Entry */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: themeColors.accentGold }]}
        onPress={() => {
          if (players.length === 0) {
            showToast('Please add an opponent player first.', 'error');
          } else {
            openAddMatchModal();
          }
        }}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="trophy-award" size={24} color="#000" />
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: themeColors.surface, borderTopColor: themeColors.surfaceBorder, paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('HOME')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'HOME' ? 'home' : 'home-outline'}
            size={22}
            color={activeTab === 'HOME' ? themeColors.accentGold : themeColors.textMuted}
          />
          <Text style={[styles.tabLabel, { color: themeColors.textMuted }, activeTab === 'HOME' && { color: themeColors.accentGold, fontWeight: '800' }]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('PLAYERS')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'PLAYERS' ? 'people' : 'people-outline'}
            size={22}
            color={activeTab === 'PLAYERS' ? themeColors.accentGold : themeColors.textMuted}
          />
          <Text style={[styles.tabLabel, { color: themeColors.textMuted }, activeTab === 'PLAYERS' && { color: themeColors.accentGold, fontWeight: '800' }]}>
            Opponents
          </Text>
        </TouchableOpacity>

        {/* Space for FAB */}
        <View style={{ width: 50 }} />

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('HISTORY')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={activeTab === 'HISTORY' ? 'history' : 'clock-outline'}
            size={22}
            color={activeTab === 'HISTORY' ? themeColors.accentGold : themeColors.textMuted}
          />
          <Text style={[styles.tabLabel, { color: themeColors.textMuted }, activeTab === 'HISTORY' && { color: themeColors.accentGold, fontWeight: '800' }]}>
            Ledger Logs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('SETTINGS')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'SETTINGS' ? 'settings' : 'settings-outline'}
            size={22}
            color={activeTab === 'SETTINGS' ? themeColors.accentGold : themeColors.textMuted}
          />
          <Text style={[styles.tabLabel, { color: themeColors.textMuted }, activeTab === 'SETTINGS' && { color: themeColors.accentGold, fontWeight: '800' }]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>


      {/* Global Modals */}
      <AddPlayerModal
        visible={addPlayerVisible}
        onClose={() => setAddPlayerVisible(false)}
        playerToEdit={playerToEdit}
      />

      <AddTransactionModal
        visible={addTxVisible}
        onClose={() => setAddTxVisible(false)}
        initialPlayerId={initialPlayerForTx}
      />

      <SettleUpModal
        visible={settleVisible}
        onClose={() => setSettleVisible(false)}
        player={settlePlayer}
      />

      <PlayerDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        player={detailPlayer}
        onOpenAddMatch={openAddMatchModal}
        onOpenSettle={openSettleModal}
        onOpenTransfer={openTransferModal}
        onEditPlayer={openEditPlayerModal}
      />

      <TransferPointsModal
        visible={transferVisible}
        onClose={() => setTransferVisible(false)}
        initialFromPlayerId={transferFromPlayerId}
      />

      <GutsCalculatorModal
        visible={calculatorVisible}
        onClose={() => setCalculatorVisible(false)}
        onLogToPlayer={handleCalculatorLog}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GutsProvider>
        <MainApp />
      </GutsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenBody: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    paddingTop: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.accentGold,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accentGold,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    ...Platform.select({
      web: { boxShadow: '0px 3px 10px rgba(212, 175, 55, 0.4)' },
      default: {
        shadowColor: COLORS.accentGold,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
      },
    }),
    zIndex: 99,
  },
});
