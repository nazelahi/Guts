import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../theme/colors';
import { useGuts } from '../context/GutsContext';

export const SNOOKER_AVATARS = [
  { id: 'red', name: 'Red Ball', color: '#DC2626', icon: null },
  { id: 'yellow', name: 'Yellow Ball', color: '#F59E0B', icon: null },
  { id: 'green', name: 'Green Ball', color: '#10B981', icon: null },
  { id: 'brown', name: 'Brown Ball', color: '#92400E', icon: null },
  { id: 'blue', name: 'Blue Ball', color: '#2563EB', icon: null },
  { id: 'pink', name: 'Pink Ball', color: '#EC4899', icon: null },
  { id: 'black', name: 'Black Ball', color: '#111827', icon: null },
  { id: 'cue', name: 'Cue Ball', color: '#F9FAFB', icon: 'billiards' },
  { id: 'gold', name: 'Gold Crown', color: '#D4AF37', icon: 'crown' },
  { id: 'star', name: 'Star Player', color: '#8B5CF6', icon: 'star' },
  { id: 'fire', name: 'Fire Potter', color: '#EF4444', icon: 'fire' },
  { id: 'target', name: 'Target Sniper', color: '#06B6D4', icon: 'target' },
];

export const AVATAR_ICONS = [
  { id: 'initial', label: 'Initial', icon: null },
  { id: 'billiards', label: 'Cue Ball', icon: 'billiards' },
  { id: 'crown', label: 'Crown', icon: 'crown' },
  { id: 'star', label: 'Star', icon: 'star' },
  { id: 'fire', label: 'Fire', icon: 'fire' },
  { id: 'target', label: 'Target', icon: 'target' },
  { id: 'trophy', label: 'Trophy', icon: 'trophy' },
  { id: 'emoticon-cool', label: 'Cool', icon: 'emoticon-cool' },
];

export const AddPlayerModal = ({ visible, onClose, playerToEdit = null }) => {
  const { addPlayer, editPlayer, showToast } = useGuts();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState(SNOOKER_AVATARS[0].color);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [avatarUri, setAvatarUri] = useState(null);

  const isEditMode = !!playerToEdit;

  useEffect(() => {
    if (playerToEdit) {
      setName(playerToEdit.name || '');
      setPhone(playerToEdit.phone || '');
      setNotes(playerToEdit.notes || '');
      setSelectedColor(playerToEdit.avatarColor || SNOOKER_AVATARS[0].color);
      setSelectedIcon(playerToEdit.avatarIcon || null);
      setAvatarUri(playerToEdit.avatarUri || null);
    } else {
      setName('');
      setPhone('');
      setNotes('');
      setSelectedColor(SNOOKER_AVATARS[0].color);
      setSelectedIcon(null);
      setAvatarUri(null);
    }
  }, [playerToEdit, visible]);

  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access gallery is required to select a profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setAvatarUri(uri);
      }
    } catch (e) {
      console.error('Gallery picker error', e);
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access camera is required to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setAvatarUri(uri);
      }
    } catch (e) {
      console.error('Camera error', e);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Please enter player name.', 'error');
      return;
    }

    if (isEditMode) {
      await editPlayer(playerToEdit.id, {
        name: name.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        avatarColor: selectedColor,
        avatarIcon: selectedIcon,
        avatarUri,
      });
      showToast(`Updated profile for ${name.trim()}`, 'success');
    } else {
      await addPlayer({
        name: name.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        avatarColor: selectedColor,
        avatarIcon: selectedIcon,
        avatarUri,
      });
      showToast(`Added ${name.trim()} to opponents!`, 'success');
    }

    onClose();
  };

  const initialLetter = name.trim() ? name.trim().charAt(0).toUpperCase() : '?';
  const isLightBg = selectedColor === '#F9FAFB' || selectedColor === '#F59E0B' || selectedColor === '#D4AF37';

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons 
                name={isEditMode ? "account-edit" : "account-plus"} 
                size={24} 
                color={COLORS.accentGold} 
              />
              <Text style={styles.modalTitle}>
                {isEditMode ? 'Edit Opponent & Photo' : 'Add Snooker Opponent'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Live Avatar Badge Preview with Photo Button */}
            <View style={styles.avatarPreviewBox}>
              <TouchableOpacity onPress={pickImageFromGallery} activeOpacity={0.8}>
                <View style={[styles.avatarBadge, { backgroundColor: selectedColor }]}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  ) : selectedIcon ? (
                    <MaterialCommunityIcons 
                      name={selectedIcon} 
                      size={28} 
                      color={isLightBg ? '#000' : '#FFF'} 
                    />
                  ) : (
                    <Text style={[styles.avatarBadgeText, { color: isLightBg ? '#000' : '#FFF' }]}>
                      {initialLetter}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.previewMeta}>
                <Text style={styles.previewName}>{name || 'Player Name'}</Text>
                
                {/* Photo Action Buttons */}
                <View style={styles.photoActionRow}>
                  <TouchableOpacity style={styles.photoBtn} onPress={pickImageFromGallery}>
                    <Ionicons name="image-outline" size={14} color={COLORS.accentGold} />
                    <Text style={styles.photoBtnText}>Gallery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.photoBtn} onPress={takePhotoWithCamera}>
                    <Ionicons name="camera-outline" size={14} color={COLORS.textPrimary} />
                    <Text style={[styles.photoBtnText, { color: COLORS.textPrimary }]}>Camera</Text>
                  </TouchableOpacity>

                  {avatarUri ? (
                    <TouchableOpacity style={styles.photoBtnRemove} onPress={() => setAvatarUri(null)}>
                      <Ionicons name="trash-outline" size={14} color={COLORS.payable} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Player Name */}
            <Text style={styles.label}>PLAYER NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ronnie O'Sullivan"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />

            {/* Snooker Ball & Avatar Color Selector */}
            <Text style={styles.label}>SNOOKER BALL / BADGE COLOR</Text>
            <View style={styles.colorGrid}>
              {SNOOKER_AVATARS.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.colorDot,
                    { backgroundColor: item.color },
                    selectedColor === item.color && styles.colorDotSelected,
                  ]}
                  onPress={() => {
                    setSelectedColor(item.color);
                    if (item.icon) setSelectedIcon(item.icon);
                  }}
                >
                  {selectedColor === item.color && (
                    <Ionicons 
                      name="checkmark" 
                      size={18} 
                      color={item.color === '#F9FAFB' || item.color === '#F59E0B' ? '#000' : '#FFF'} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Icon Overlay Selector */}
            <Text style={styles.label}>AVATAR ICON STYLE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              {AVATAR_ICONS.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.iconChip,
                    selectedIcon === item.icon && styles.iconChipActive,
                  ]}
                  onPress={() => setSelectedIcon(item.icon)}
                >
                  {item.icon ? (
                    <MaterialCommunityIcons 
                      name={item.icon} 
                      size={18} 
                      color={selectedIcon === item.icon ? COLORS.accentGold : COLORS.textSecondary} 
                    />
                  ) : (
                    <Text style={[styles.iconChipLetter, selectedIcon === null && { color: COLORS.accentGold }]}>
                      {initialLetter}
                    </Text>
                  )}
                  <Text style={[styles.iconChipLabel, selectedIcon === item.icon && styles.iconChipLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Phone Number */}
            <Text style={styles.label}>PHONE / CONTACT (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +1 555-0192"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {/* Notes / Handicap */}
            <Text style={styles.label}>HANDICAP / CLUB NOTES (OPTIONAL)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Gives 14 pts handicap per frame, $2/pt rate"
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark" size={18} color="#000" />
              <Text style={styles.saveBtnText}>
                {isEditMode ? 'Save Changes' : 'Add Player'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  formScroll: {
    marginBottom: 16,
  },
  avatarPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 14,
    marginBottom: 12,
  },
  avatarBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarBadgeText: {
    fontSize: 24,
    fontWeight: '800',
  },
  previewMeta: {
    flex: 1,
  },
  previewName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  previewSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  photoActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  photoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentGold,
  },
  photoBtnRemove: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: COLORS.payableBg,
    borderRadius: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 10,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 4,
  },
  colorDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  iconScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  iconChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  iconChipActive: {
    borderColor: COLORS.accentGold,
    backgroundColor: COLORS.primaryDark,
  },
  iconChipLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  iconChipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  iconChipLabelActive: {
    color: COLORS.accentGold,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1.5,
    backgroundColor: COLORS.accentGold,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '800',
  },
});
