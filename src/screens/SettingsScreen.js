import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';

const CURRENCIES = [
  { symbol: '$', code: 'USD' },
  { symbol: '৳', code: 'BDT' },
  { symbol: '£', code: 'GBP' },
  { symbol: '€', code: 'EUR' },
  { symbol: '₹', code: 'INR' },
  { symbol: '¥', code: 'JPY/CNY' },
  { symbol: 'C$', code: 'CAD' },
  { symbol: 'A$', code: 'AUD' },
  { symbol: 'S$', code: 'SGD' },
  { symbol: '₱', code: 'PHP' },
  { symbol: '₫', code: 'VND' },
  { symbol: 'R$', code: 'BRL' },
  { symbol: 'AED', code: 'AED' },
  { symbol: 'SAR', code: 'SAR' },
  { symbol: 'MYR', code: 'MYR' },
  { symbol: 'PKR', code: 'PKR' },
];

export const SettingsScreen = () => {
  const { settings, saveSettings, resetAllData, importBackupData, players, transactions, showToast, addClubName, removeClubName } = useGuts();

  const [clubName, setClubName] = useState(settings.clubName || 'Imperial Snooker Club');
  const [newClubInput, setNewClubInput] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(settings.currencySymbol || '$');
  const [customCurrency, setCustomCurrency] = useState('');
  const [defaultRate, setDefaultRate] = useState(String(settings.defaultRatePerPoint || 1.0));

  const [importJson, setImportJson] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  const handleAddNewClub = async () => {
    if (!newClubInput.trim()) {
      showToast('Please type a valid club name', 'error');
      return;
    }
    const success = await addClubName(newClubInput);
    if (success) {
      showToast(`Added "${newClubInput.trim()}" to saved venues!`, 'success');
      setNewClubInput('');
    } else {
      showToast('Club name already exists in directory', 'error');
    }
  };

  const handleRemoveClub = async (name) => {
    await removeClubName(name);
    showToast(`Removed "${name}"`, 'success');
  };

  const handleExportBackup = () => {
    const backupObj = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      players,
      transactions,
    };
    const jsonStr = JSON.stringify(backupObj, null, 2);
    setImportJson(jsonStr);
    setShowImportBox(true);
    showToast('Backup JSON copied below!', 'success');
  };

  const handleProcessImport = async () => {
    if (!importJson.trim()) {
      showToast('Please paste a valid JSON backup', 'error');
      return;
    }

    const success = await importBackupData(importJson);
    if (success) {
      showToast('Ledger data restored successfully!', 'success');
      setShowImportBox(false);
    } else {
      showToast('Invalid backup JSON format', 'error');
    }
  };

  const handleSaveSettings = async () => {
    const rateNum = parseFloat(defaultRate);
    if (!rateNum || rateNum < 0) {
      showToast('Please enter a valid rate per point', 'error');
      return;
    }

    const activeCurrency = customCurrency.trim() ? customCurrency.trim() : selectedCurrency;

    await saveSettings({
      ...settings,
      clubName,
      currencySymbol: activeCurrency,
      defaultRatePerPoint: rateNum,
    });

    showToast(`Preferences saved! Currency updated to ${activeCurrency}`, 'success');
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data?',
      'WARNING: This will permanently delete all opponents, match histories, and ledger balances. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            Alert.alert('Data Cleared', 'All app data has been reset.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Banner */}
        <View style={styles.settingsHeaderCard}>
          <MaterialCommunityIcons name="billiards" size={32} color={COLORS.accentGold} />
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>Club & Ledger Preferences</Text>
            <Text style={styles.headerSub}>Manage Guts point values, currency, & club configuration</Text>
          </View>
        </View>

        {/* Default Home Lounge Name */}
        <Text style={styles.label}>DEFAULT HOME LOUNGE / CLUB NAME</Text>
        <TextInput
          style={styles.input}
          value={clubName}
          onChangeText={setClubName}
          placeholder="e.g. Imperial Snooker Club"
          placeholderTextColor={COLORS.textMuted}
        />

        {/* Pre-categorized Snooker Clubs Directory */}
        <Text style={styles.label}>PRE-CATEGORIZED SNOOKER CLUBS & VENUES DIRECTORY</Text>
        <View style={styles.addClubRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="e.g. Rack & Cue Arena, Cue Zone"
            placeholderTextColor={COLORS.textMuted}
            value={newClubInput}
            onChangeText={setNewClubInput}
          />
          <TouchableOpacity style={styles.addClubBtn} onPress={handleAddNewClub}>
            <Ionicons name="add" size={20} color="#000" />
            <Text style={styles.addClubBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.clubChipGrid}>
          {(settings.clubs || ['Imperial Snooker Club', 'Cue Zone Lounge', 'Rack & Cue Arena']).map(club => (
            <View key={club} style={[styles.clubChip, clubName === club && styles.clubChipActive]}>
              <TouchableOpacity style={styles.clubChipSelect} onPress={() => setClubName(club)}>
                <MaterialCommunityIcons name="map-marker" size={14} color={clubName === club ? COLORS.accentGold : COLORS.textMuted} />
                <Text style={[styles.clubChipText, clubName === club && styles.clubChipTextActive]}>
                  {club}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemoveClub(club)} style={styles.clubChipDelete}>
                <Ionicons name="close" size={14} color={COLORS.payable} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Currency Symbol Picker */}
        <Text style={styles.label}>SYSTEM-WIDE CURRENCY SYMBOL</Text>
        <View style={styles.currencyGrid}>
          {CURRENCIES.map(curr => (
            <TouchableOpacity
              key={curr.symbol}
              style={[
                styles.currencyPill,
                !customCurrency && selectedCurrency === curr.symbol && styles.currencyPillActive,
              ]}
              onPress={() => {
                setSelectedCurrency(curr.symbol);
                setCustomCurrency('');
              }}
            >
              <Text style={[
                styles.currencyText,
                !customCurrency && selectedCurrency === curr.symbol && styles.currencyTextActive,
              ]}>
                {curr.symbol}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Currency Input */}
        <Text style={styles.label}>OR CUSTOM CURRENCY SYMBOL / CODE</Text>
        <TextInput
          style={styles.input}
          value={customCurrency}
          onChangeText={setCustomCurrency}
          placeholder="e.g. BDT, RM, KWD, SAR, EGP"
          placeholderTextColor={COLORS.textMuted}
        />

        {/* Default Rate Per Point */}
        <Text style={styles.label}>DEFAULT RATE PER GUTS POINT ({selectedCurrency})</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={defaultRate}
          onChangeText={setDefaultRate}
          placeholder="e.g. 1.00"
          placeholderTextColor={COLORS.textMuted}
        />
        <Text style={styles.helperText}>
          Each Guts point won will default to {selectedCurrency}{parseFloat(defaultRate) || 1} in cash value. You can override this per match.
        </Text>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSettings}>
          <Ionicons name="checkmark-circle" size={20} color="#000" />
          <Text style={styles.saveBtnText}>Save Preferences</Text>
        </TouchableOpacity>

        {/* App Stats */}
        <Text style={styles.sectionHeader}>LEDGER STATISTICS</Text>
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Registered Opponents</Text>
            <Text style={styles.statVal}>{players.length}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Ledger Transactions</Text>
            <Text style={styles.statVal}>{transactions.length}</Text>
          </View>
        </View>

        {/* Data Backup & Restore */}
        <Text style={styles.sectionHeader}>DATA BACKUP & RESTORE</Text>
        <TouchableOpacity style={styles.backupBtn} onPress={handleExportBackup}>
          <Ionicons name="cloud-download-outline" size={18} color={COLORS.accentGold} />
          <Text style={styles.backupBtnText}>Export Backup (Generate JSON)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.backupBtn, { marginTop: 8 }]} 
          onPress={() => setShowImportBox(!showImportBox)}
        >
          <Ionicons name="cloud-upload-outline" size={18} color={COLORS.textPrimary} />
          <Text style={[styles.backupBtnText, { color: COLORS.textPrimary }]}>
            {showImportBox ? 'Hide Import Box' : 'Restore Backup (Import JSON)'}
          </Text>
        </TouchableOpacity>

        {showImportBox && (
          <View style={styles.importBox}>
            <Text style={styles.label}>PASTE OR COPY BACKUP JSON</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              multiline
              value={importJson}
              onChangeText={setImportJson}
              placeholder='{"players": [...], "transactions": [...]}'
              placeholderTextColor={COLORS.textMuted}
            />
            <TouchableOpacity style={styles.processImportBtn} onPress={handleProcessImport}>
              <Ionicons name="checkmark-circle" size={16} color="#000" />
              <Text style={styles.processImportBtnText}>Restore Data Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Danger Zone */}
        <Text style={styles.sectionHeaderDanger}>DANGER ZONE</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleResetData}>
          <Ionicons name="trash-bin-outline" size={18} color={COLORS.payable} />
          <Text style={styles.dangerBtnText}>Reset All Opponents & Ledger</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  settingsHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 14,
    marginBottom: 20,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 10,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 14,
  },
  addClubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  addClubBtn: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addClubBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 14,
  },
  clubChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  clubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  clubChipActive: {
    borderColor: COLORS.accentGold,
    backgroundColor: COLORS.primaryDark,
  },
  clubChipSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 6,
  },
  clubChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  clubChipTextActive: {
    color: COLORS.accentGold,
    fontWeight: '700',
  },
  clubChipDelete: {
    padding: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 10,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  currencyPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  currencyPillActive: {
    backgroundColor: COLORS.accentGold,
    borderColor: COLORS.accentGold,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  currencyTextActive: {
    color: '#000',
  },
  saveBtn: {
    backgroundColor: COLORS.accentGold,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 24,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 10,
  },
  sectionHeaderDanger: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.payable,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 20,
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.accentGold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceBorder,
    marginVertical: 12,
  },
  dangerBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    marginBottom: 30,
  },
  dangerBtnText: {
    color: COLORS.payable,
    fontWeight: '800',
    fontSize: 14,
  },
  backupBtn: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  backupBtnText: {
    color: COLORS.accentGold,
    fontWeight: '700',
    fontSize: 13,
  },
  importBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  processImportBtn: {
    backgroundColor: COLORS.accentGold,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  processImportBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13,
  },
});
