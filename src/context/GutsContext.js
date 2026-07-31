import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from '../components/Toast';

const GutsContext = createContext();

const STORAGE_KEYS = {
  PLAYERS: '@snooker_guts_players_v1',
  TRANSACTIONS: '@snooker_guts_transactions_v1',
  SETTINGS: '@snooker_guts_settings_v1',
};



const DEFAULT_CLUBS = [
  'Imperial Snooker Club',
  'Cue Zone Lounge',
  'Rack & Cue Arena',
  'Royal Felt Lounge',
];

const DEFAULT_SETTINGS = {
  currencySymbol: '$',
  defaultRatePerPoint: 1.0,
  clubName: 'Imperial Snooker Club',
  clubs: DEFAULT_CLUBS,
  enableHaptics: true,
};

export const GutsProvider = ({ children }) => {
  const [players, setPlayers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Load data on startup
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const storedPlayers = await AsyncStorage.getItem(STORAGE_KEYS.PLAYERS);
      const storedTransactions = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);

      const MOCK_PLAYER_IDS = ['p1', 'p2', 'p3', 'p4'];
      const MOCK_TX_IDS = ['t1', 't2', 't3', 't4'];

      if (storedPlayers !== null) {
        const parsed = JSON.parse(storedPlayers);
        const cleanPlayers = parsed.filter(p => !MOCK_PLAYER_IDS.includes(p.id));
        setPlayers(cleanPlayers);
        if (cleanPlayers.length !== parsed.length) {
          await AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(cleanPlayers));
        }
      } else {
        setPlayers([]);
        await AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify([]));
      }

      if (storedTransactions !== null) {
        const parsed = JSON.parse(storedTransactions);
        const cleanTx = parsed.filter(t => !MOCK_TX_IDS.includes(t.id));
        setTransactions(cleanTx);
        if (cleanTx.length !== parsed.length) {
          await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(cleanTx));
        }
      } else {
        setTransactions([]);
        await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      }

      if (storedSettings !== null) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(DEFAULT_SETTINGS);
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch (e) {
      console.error('Error loading Guts storage:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Save changes helper
  const savePlayers = async (newPlayers) => {
    setPlayers(newPlayers);
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(newPlayers));
  };

  const saveTransactions = async (newTx) => {
    setTransactions(newTx);
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTx));
  };

  const saveSettings = async (newSettings) => {
    setSettings(newSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  };

  // Player Operations
  const addPlayer = async ({ name, phone = '', notes = '', avatarColor = '#10B981', avatarIcon = null, avatarUri = null }) => {
    const newPlayer = {
      id: 'p_' + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      avatarColor,
      avatarIcon,
      avatarUri,
      createdAt: new Date().toISOString(),
    };
    const updated = [newPlayer, ...players];
    await savePlayers(updated);
    return newPlayer;
  };

  const editPlayer = async (id, updatedFields) => {
    const updated = players.map(p => (p.id === id ? { ...p, ...updatedFields } : p));
    await savePlayers(updated);

    if (updatedFields.name) {
      const updatedTx = transactions.map(t => 
        t.playerId === id ? { ...t, playerName: updatedFields.name.trim() } : t
      );
      await saveTransactions(updatedTx);
    }
  };

  const deletePlayer = async (id) => {
    const updatedPlayers = players.filter(p => p.id !== id);
    const updatedTx = transactions.filter(t => t.playerId !== id);
    await savePlayers(updatedPlayers);
    await saveTransactions(updatedTx);
  };

  // Transaction Operations (Match or Settlement)
  const addTransaction = async ({
    playerId,
    type = 'MATCH', // 'MATCH' or 'SETTLEMENT'
    gutsPoints = 0,
    ratePerPoint = settings.defaultRatePerPoint,
    amount = 0, // if 0 and type MATCH, calculated as gutsPoints * ratePerPoint
    clubName = '',
    notes = '',
    status = 'UNSETTLED'
  }) => {
    const player = players.find(p => p.id === playerId);
    const calculatedAmount = type === 'MATCH' && amount === 0 
      ? Number((gutsPoints * ratePerPoint).toFixed(2)) 
      : Number(amount);

    const activeClubName = clubName.trim() || settings.clubName || 'Imperial Snooker Club';

    const newTx = {
      id: 'tx_' + Date.now(),
      playerId,
      playerName: player ? player.name : 'Unknown Player',
      type,
      gutsPoints: Number(gutsPoints),
      ratePerPoint: Number(ratePerPoint),
      amount: calculatedAmount,
      clubName: activeClubName,
      status,
      date: new Date().toISOString(),
      notes: notes.trim(),
    };

    const updated = [newTx, ...transactions];
    await saveTransactions(updated);
    return newTx;
  };

  // Transfer Guts points / debt from one player to another player
  const transferGutsPoints = async ({
    fromPlayerId,
    toPlayerId,
    gutsPoints,
    ratePerPoint = settings.defaultRatePerPoint,
    notes = '',
  }) => {
    const fromPlayer = players.find(p => p.id === fromPlayerId);
    const toPlayer = players.find(p => p.id === toPlayerId);

    if (!fromPlayer || !toPlayer) return false;

    const numPts = Number(gutsPoints);
    const numRate = Number(ratePerPoint);
    const calculatedAmount = Number((numPts * numRate).toFixed(2));
    const nowIso = new Date().toISOString();
    const timestamp = Date.now();

    // Entry for Source Player (Reduces points/receivable)
    const sourceTx = {
      id: 'tx_' + timestamp + '_1',
      playerId: fromPlayerId,
      playerName: fromPlayer.name,
      type: 'TRANSFER',
      gutsPoints: -numPts,
      ratePerPoint: numRate,
      amount: -calculatedAmount,
      status: 'SETTLED',
      date: nowIso,
      notes: notes.trim() || `Transferred ${numPts} Guts pts to ${toPlayer.name}`,
    };

    // Entry for Target Player (Increases points/receivable)
    const targetTx = {
      id: 'tx_' + timestamp + '_2',
      playerId: toPlayerId,
      playerName: toPlayer.name,
      type: 'TRANSFER',
      gutsPoints: numPts,
      ratePerPoint: numRate,
      amount: calculatedAmount,
      status: 'UNSETTLED',
      date: nowIso,
      notes: notes.trim() || `Transferred ${numPts} Guts pts from ${fromPlayer.name}`,
    };

    const updated = [sourceTx, targetTx, ...transactions];
    await saveTransactions(updated);
    return true;
  };

  // Mark all transactions for a specific player as SETTLED or single tx
  const settlePlayerBalance = async (playerId) => {
    const updatedTx = transactions.map(t => {
      if (t.playerId === playerId) {
        return { ...t, status: 'SETTLED' };
      }
      return t;
    });
    await saveTransactions(updatedTx);
  };

  const toggleTransactionStatus = async (txId) => {
    const updatedTx = transactions.map(t => {
      if (t.id === txId) {
        return { ...t, status: t.status === 'SETTLED' ? 'UNSETTLED' : 'SETTLED' };
      }
      return t;
    });
    await saveTransactions(updatedTx);
  };

  const deleteTransaction = async (txId) => {
    const updatedTx = transactions.filter(t => t.id !== txId);
    await saveTransactions(updatedTx);
  };

  const addClubName = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const currentClubs = settings.clubs || DEFAULT_CLUBS;
    if (currentClubs.includes(trimmed)) return false;

    const updatedClubs = [...currentClubs, trimmed];
    const newSettings = { ...settings, clubs: updatedClubs };
    await saveSettings(newSettings);
    return true;
  };

  const removeClubName = async (name) => {
    const currentClubs = settings.clubs || DEFAULT_CLUBS;
    const updatedClubs = currentClubs.filter(c => c !== name);
    const newSettings = { ...settings, clubs: updatedClubs };
    await saveSettings(newSettings);
  };

  // Export & Reset & Import
  const resetAllData = async () => {
    await savePlayers([]);
    await saveTransactions([]);
    await saveSettings(DEFAULT_SETTINGS);
  };

  const importBackupData = async (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.players && Array.isArray(data.players)) {
        await savePlayers(data.players);
      }
      if (data.transactions && Array.isArray(data.transactions)) {
        await saveTransactions(data.transactions);
      }
      if (data.settings) {
        await saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
      return true;
    } catch (e) {
      console.error('Failed to parse backup JSON', e);
      return false;
    }
  };

  // Computed Properties per player & club-wide
  const playerSummaries = useMemo(() => {
    return players.map(player => {
      const playerTxs = transactions.filter(t => t.playerId === player.id);
      
      let netGutsPoints = 0;
      let netCashAmount = 0;
      let unsettledGutsPoints = 0;
      let unsettledCashAmount = 0;

      playerTxs.forEach(t => {
        netGutsPoints += t.gutsPoints || 0;
        netCashAmount += t.amount || 0;

        if (t.status === 'UNSETTLED') {
          unsettledGutsPoints += t.gutsPoints || 0;
          unsettledCashAmount += t.amount || 0;
        }
      });

      return {
        ...player,
        txCount: playerTxs.length,
        netGutsPoints,
        netCashAmount: Number(netCashAmount.toFixed(2)),
        unsettledGutsPoints,
        unsettledCashAmount: Number(unsettledCashAmount.toFixed(2)),
        // Positive netCashAmount = He owes you money; Negative = You owe him
        status: netCashAmount > 0 ? 'OWES_YOU' : netCashAmount < 0 ? 'YOU_OWE' : 'SETTLED',
      };
    });
  }, [players, transactions]);

  // Overall Club Totals
  const clubTotals = useMemo(() => {
    let totalReceivableCash = 0; // Money others owe me
    let totalPayableCash = 0;    // Money I owe others
    let totalReceivablePoints = 0;
    let totalPayablePoints = 0;

    playerSummaries.forEach(p => {
      if (p.netCashAmount > 0) {
        totalReceivableCash += p.netCashAmount;
      } else if (p.netCashAmount < 0) {
        totalPayableCash += Math.abs(p.netCashAmount);
      }

      if (p.netGutsPoints > 0) {
        totalReceivablePoints += p.netGutsPoints;
      } else if (p.netGutsPoints < 0) {
        totalPayablePoints += Math.abs(p.netGutsPoints);
      }
    });

    const netCashPosition = totalReceivableCash - totalPayableCash;

    return {
      totalReceivableCash: Number(totalReceivableCash.toFixed(2)),
      totalPayableCash: Number(totalPayableCash.toFixed(2)),
      netCashPosition: Number(netCashPosition.toFixed(2)),
      totalReceivablePoints,
      totalPayablePoints,
      activePlayersCount: players.length,
    };
  }, [playerSummaries, players]);

  return (
    <GutsContext.Provider value={{
      players,
      transactions,
      settings,
      isLoading,
      playerSummaries,
      clubTotals,
      addPlayer,
      editPlayer,
      deletePlayer,
      addTransaction,
      settlePlayerBalance,
      toggleTransactionStatus,
      deleteTransaction,
      saveSettings,
      resetAllData,
      importBackupData,
      transferGutsPoints,
      showToast,
      addClubName,
      removeClubName,
    }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={hideToast}
      />
    </GutsContext.Provider>
  );
};

export const useGuts = () => useContext(GutsContext);
