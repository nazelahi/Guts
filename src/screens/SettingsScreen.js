import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Share, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, THEMES } from '../theme/colors';
import { useGuts } from '../context/GutsContext';
import { PasscodeLockScreen } from '../components/PasscodeLockScreen';

const CURRENCIES = [
  { symbol: '$', code: 'USD' },
  { symbol: '৳', code: 'BDT' },
  { symbol: '₹', code: 'INR' },
  { symbol: '€', code: 'EUR' },
];

export const SettingsScreen = () => {
  const { settings, saveSettings, changeTheme, themeColors, resetAllData, importBackupData, players, transactions, showToast, addClubName, removeClubName } = useGuts();

  const [clubName, setClubName] = useState(settings.clubName || 'Imperial Snooker Club');
  const [newClubInput, setNewClubInput] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(settings.currencySymbol || '$');
  const [defaultRate, setDefaultRate] = useState(String(settings.defaultRatePerPoint || 1.0));

  const [importJson, setImportJson] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  const activeThemeId = settings.theme || 'EMERALD_FELT';

  // Passcode Lock States
  const [isPasscodeModalVisible, setIsPasscodeModalVisible] = useState(false);
  const [passcodeFlowMode, setPasscodeFlowMode] = useState('CREATE'); // 'CREATE', 'CONFIRM', 'VERIFY_DISABLE', 'VERIFY_CHANGE'
  const [tempPasscode, setTempPasscode] = useState('');
  const [passcodeModalTitle, setPasscodeModalTitle] = useState('CREATE 4-DIGIT PASSCODE');
  const [passcodeModalDesc, setPasscodeModalDesc] = useState('Define a passcode to protect Guts Ledger');

  const handleTogglePasscodeLock = () => {
    if (settings.usePasscode) {
      setPasscodeFlowMode('VERIFY_DISABLE');
      setPasscodeModalTitle('ENTER CURRENT PASSCODE');
      setPasscodeModalDesc('Verify your passcode to disable lock');
      setIsPasscodeModalVisible(true);
    } else {
      setPasscodeFlowMode('CREATE');
      setPasscodeModalTitle('CREATE 4-DIGIT PASSCODE');
      setPasscodeModalDesc('Define a passcode to protect Guts Ledger');
      setIsPasscodeModalVisible(true);
    }
  };

  const handleChangePasscode = () => {
    setPasscodeFlowMode('VERIFY_CHANGE');
    setPasscodeModalTitle('ENTER CURRENT PASSCODE');
    setPasscodeModalDesc('Verify your current passcode first');
    setIsPasscodeModalVisible(true);
  };

  const handlePasscodeCancel = () => {
    setIsPasscodeModalVisible(false);
    setTempPasscode('');
  };

  const handlePasscodeSuccess = async (code) => {
    if (passcodeFlowMode === 'CREATE') {
      setTempPasscode(code);
      setPasscodeFlowMode('CONFIRM');
      setPasscodeModalTitle('CONFIRM PASSCODE');
      setPasscodeModalDesc('Re-enter the 4-digit passcode to verify');
    } else if (passcodeFlowMode === 'CONFIRM') {
      await saveSettings({
        ...settings,
        usePasscode: true,
        passcode: tempPasscode,
      });
      setIsPasscodeModalVisible(false);
      showToast('Passcode protection activated!', 'success');
    } else if (passcodeFlowMode === 'VERIFY_DISABLE') {
      await saveSettings({
        ...settings,
        usePasscode: false,
        passcode: '',
      });
      setIsPasscodeModalVisible(false);
      showToast('Passcode protection disabled', 'success');
    } else if (passcodeFlowMode === 'VERIFY_CHANGE') {
      setPasscodeFlowMode('CREATE');
      setPasscodeModalTitle('ENTER NEW PASSCODE');
      setPasscodeModalDesc('Enter a new 4-digit passcode');
    }
  };

  const handleSelectTheme = async (themeKey) => {
    await changeTheme(themeKey);
    showToast(`Applied ${THEMES[themeKey]?.name || 'Theme'}!`, 'success');
  };

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

  const handleExportBackup = async () => {
    const backupObj = {
      version: 1,
      appName: 'Snooker Guts',
      exportedAt: new Date().toISOString(),
      settings,
      players,
      transactions,
    };
    const jsonStr = JSON.stringify(backupObj, null, 2);
    setImportJson(jsonStr);
    setShowImportBox(true);

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `snooker_guts_backup_${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Downloaded snooker_guts_backup.json to files!', 'success');
        return;
      } catch (err) {
        console.log('Web download fallback:', err);
      }
    }

    try {
      await Share.share({
        title: 'Snooker Guts Ledger Backup.json',
        message: jsonStr,
      });
      showToast('Backup JSON exported successfully!', 'success');
    } catch (e) {
      console.error('Error sharing backup', e);
      showToast('Backup JSON generated in box below!', 'success');
    }
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

    await saveSettings({
      ...settings,
      clubName,
      currencySymbol: selectedCurrency,
      defaultRatePerPoint: rateNum,
    });

    showToast(`Preferences saved! Currency updated to ${selectedCurrency}`, 'success');
  };

  const handleResetData = () => {
    if (Platform.OS === 'web') {
      const confirmReset = window.confirm(
        'Reset All Data?\n\nWARNING: This will permanently delete all opponents, match histories, and ledger balances. This action cannot be undone.'
      );
      if (confirmReset) {
        resetAllData().then(() => {
          window.alert('All app data has been reset.');
        });
      }
      return;
    }

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
  const styles = getStyles(themeColors);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>


      <View style={styles.content}>
        {/* Banner */}
        <View style={[styles.settingsHeaderCard, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder }]}>
          <MaterialCommunityIcons name="billiards" size={32} color={themeColors.accentGold} />
          <View style={styles.headerTextCol}>
            <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Club & Ledger Preferences</Text>
            <Text style={[styles.headerSub, { color: themeColors.textMuted }]}>Manage Guts point values, currency, & club configuration</Text>
          </View>
        </View>

        {/* Snooker Felt Color Themes */}
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>SNOOKER FELT COLOR THEME</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeScroll}>
          {Object.values(THEMES).map(t => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.compactThemePill,
                { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder },
                activeThemeId === t.id && { borderColor: themeColors.accentGold, backgroundColor: themeColors.primaryDark }
              ]}
              onPress={() => handleSelectTheme(t.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.compactThemeSwatch, { backgroundColor: t.feltColor }]}>
                <View style={[styles.compactThemeAccentDot, { backgroundColor: t.accentColor }]} />
              </View>
              <Text style={[
                styles.compactThemeText,
                { color: themeColors.textSecondary },
                activeThemeId === t.id && { color: themeColors.accentGold, fontWeight: '800' }
              ]}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Default Home Lounge Name */}
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>DEFAULT HOME LOUNGE / CLUB NAME</Text>

        <TextInput
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder, color: themeColors.textPrimary }]}
          value={clubName}
          onChangeText={setClubName}
          placeholder="e.g. Imperial Snooker Club"
          placeholderTextColor={themeColors.textMuted}
        />

        {/* Pre-categorized Snooker Clubs Directory */}
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>PRE-CATEGORIZED SNOOKER CLUBS & VENUES DIRECTORY</Text>
        <View style={styles.addClubRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder, color: themeColors.textPrimary }]}
            placeholder="e.g. Rack & Cue Arena, Cue Zone"
            placeholderTextColor={themeColors.textMuted}
            value={newClubInput}
            onChangeText={setNewClubInput}
          />
          <TouchableOpacity style={[styles.addClubBtn, { backgroundColor: themeColors.accentGold }]} onPress={handleAddNewClub}>
            <Ionicons name="add" size={20} color="#000" />
            <Text style={styles.addClubBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.clubChipGrid}>
          {(settings.clubs || ['Imperial Snooker Club', 'Cue Zone Lounge', 'Rack & Cue Arena']).map(club => (
            <View key={club} style={[
              styles.clubChip, 
              { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder },
              clubName === club && { borderColor: themeColors.accentGold, backgroundColor: themeColors.primaryDark }
            ]}>
              <TouchableOpacity style={styles.clubChipSelect} onPress={() => setClubName(club)}>
                <MaterialCommunityIcons name="map-marker" size={14} color={clubName === club ? themeColors.accentGold : themeColors.textMuted} />
                <Text style={[
                  styles.clubChipText, 
                  { color: themeColors.textMuted },
                  clubName === club && { color: themeColors.accentGold, fontWeight: '800' }
                ]}>
                  {club}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemoveClub(club)} style={styles.clubChipDelete}>
                <Ionicons name="close" size={14} color={themeColors.payable} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Currency Symbol Picker */}
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>SYSTEM-WIDE CURRENCY SYMBOL</Text>
        <View style={styles.currencyGrid}>
          {CURRENCIES.map(curr => (
            <TouchableOpacity
              key={curr.symbol}
              style={[
                styles.currencyPill,
                { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder },
                selectedCurrency === curr.symbol && { backgroundColor: themeColors.accentGold, borderColor: themeColors.accentGold },
              ]}
              onPress={() => {
                setSelectedCurrency(curr.symbol);
              }}
            >
              <Text style={[
                styles.currencyText,
                { color: themeColors.textMuted },
                selectedCurrency === curr.symbol && { color: '#000', fontWeight: '800' },
              ]}>
                {curr.symbol}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Default Rate Per Point */}
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>DEFAULT RATE PER GUTS POINT ({selectedCurrency})</Text>
        <TextInput
          style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder, color: themeColors.textPrimary }]}
          keyboardType="decimal-pad"
          value={defaultRate}
          onChangeText={setDefaultRate}
          placeholder="e.g. 1.00"
          placeholderTextColor={themeColors.textMuted}
        />
        <Text style={[styles.helperText, { color: themeColors.textMuted }]}>
          Each Guts point won will default to {selectedCurrency}{parseFloat(defaultRate) || 1} in cash value. You can override this per match.
        </Text>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: themeColors.accentGold }]} onPress={handleSaveSettings}>
          <Ionicons name="checkmark-circle" size={20} color="#000" />
          <Text style={styles.saveBtnText}>Save Preferences</Text>
        </TouchableOpacity>

        {/* Passcode Security Lock */}
        <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>SECURITY LOCK</Text>
        <View style={[styles.securityCard, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder }]}>
          <View style={styles.securityRow}>
            <View style={styles.securityInfo}>
              <Ionicons name="shield-checkmark" size={20} color={settings.usePasscode ? themeColors.accentGold : themeColors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.securityTitleText, { color: themeColors.textPrimary }]}>Passcode Protection</Text>
                <Text style={[styles.securitySubtext, { color: themeColors.textMuted }]}>Prompt for passcode on startup & resume</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.toggleBtn, settings.usePasscode ? styles.toggleBtnOn : styles.toggleBtnOff]}
              onPress={handleTogglePasscodeLock}
            >
              <View style={[styles.toggleCircle, settings.usePasscode ? styles.toggleCircleOn : styles.toggleCircleOff]} />
            </TouchableOpacity>
          </View>
          
          {settings.usePasscode && (
            <TouchableOpacity style={styles.changePasscodeBtn} onPress={handleChangePasscode}>
              <Ionicons name="key-outline" size={14} color={themeColors.accentGold} />
              <Text style={styles.changePasscodeBtnText}>Change 4-Digit Passcode</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* App Stats */}
        <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>LEDGER STATISTICS</Text>
        <View style={[styles.statsCard, { backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder }]}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>Registered Opponents</Text>
            <Text style={[styles.statVal, { color: themeColors.accentGold }]}>{players.length}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: themeColors.surfaceBorder }]} />
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>Total Ledger Transactions</Text>
            <Text style={[styles.statVal, { color: themeColors.accentGold }]}>{transactions.length}</Text>
          </View>
        </View>

        {/* Data Backup & Restore */}
        <Text style={[styles.sectionHeader, { color: themeColors.textSecondary }]}>DATA BACKUP & RESTORE</Text>
        <TouchableOpacity style={[styles.backupBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.accentGold }]} onPress={handleExportBackup}>
          <Ionicons name="cloud-download-outline" size={18} color={themeColors.accentGold} />
          <Text style={[styles.backupBtnText, { color: themeColors.accentGold }]}>Export Backup (Generate JSON)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.backupBtn, { marginTop: 8, backgroundColor: themeColors.surface, borderColor: themeColors.surfaceBorder }]} 
          onPress={() => setShowImportBox(!showImportBox)}
        >
          <Ionicons name="cloud-upload-outline" size={18} color={themeColors.textPrimary} />
          <Text style={[styles.backupBtnText, { color: themeColors.textPrimary }]}>

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

      {/* Passcode Lock Setup Modal */}
      <Modal visible={isPasscodeModalVisible} animationType="slide">
        <PasscodeLockScreen
          key={passcodeFlowMode}
          correctPasscode={
            passcodeFlowMode === 'CREATE'
              ? null
              : passcodeFlowMode === 'CONFIRM'
              ? tempPasscode
              : settings.passcode
          }
          title={passcodeModalTitle}
          description={passcodeModalDesc}
          onSuccess={handlePasscodeSuccess}
          onCancel={handlePasscodeCancel}
          cancelText="Cancel"
        />
      </Modal>
    </ScrollView>
  );
};

const getStyles = (COLORS) => StyleSheet.create({

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
  themeScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  compactThemePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    gap: 8,
  },
  compactThemeSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactThemeAccentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  compactThemeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  securityCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 16,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  securityTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  securitySubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  toggleBtn: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleBtnOn: {
    backgroundColor: COLORS.accentGold,
  },
  toggleBtnOff: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  toggleCircleOn: {
    alignSelf: 'flex-end',
    backgroundColor: '#000',
  },
  toggleCircleOff: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.textMuted,
  },
  changePasscodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
  },
  changePasscodeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentGold,
  },
});

