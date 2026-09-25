import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserSettings } from '../utils/storage';
import { ThemeColors } from '../theme/colors';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';

interface SettingsModalProps {
  visible: boolean;
  settings: UserSettings;
  colors: ThemeColors;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  settings,
  colors,
  onClose,
  onUpdateSettings,
  onResetGame,
}) => {
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    if (visible) {
      getApiBaseUrl().then(setApiUrl);
    }
  }, [visible]);

  const handleSaveApiUrl = async () => {
    await setApiUrl(apiUrl.trim());
    await setApiBaseUrl(apiUrl.trim());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Game Settings
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Dark Mode */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Dark Theme
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Sleek dark interface tailored for night play
                </Text>
              </View>
              <Switch
                value={settings.isDarkMode}
                onValueChange={(val) => onUpdateSettings({ isDarkMode: val })}
                thumbColor={settings.isDarkMode ? colors.accent : '#F4F3F4'}
                trackColor={{ false: '#767577', true: colors.accentHover }}
              />
            </View>

            {/* Auto-check mistakes */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Auto-Check Mistakes
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Highlight numbers that conflict with rules
                </Text>
              </View>
              <Switch
                value={settings.autoCheckMistakes}
                onValueChange={(val) => onUpdateSettings({ autoCheckMistakes: val })}
                thumbColor={settings.autoCheckMistakes ? colors.accent : '#F4F3F4'}
                trackColor={{ false: '#767577', true: colors.accentHover }}
              />
            </View>

            {/* Highlight Matching Numbers */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Highlight Identical Numbers
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Highlight all cells sharing the selected number
                </Text>
              </View>
              <Switch
                value={settings.highlightMatchingNumbers}
                onValueChange={(val) =>
                  onUpdateSettings({ highlightMatchingNumbers: val })
                }
                thumbColor={
                  settings.highlightMatchingNumbers ? colors.accent : '#F4F3F4'
                }
                trackColor={{ false: '#767577', true: colors.accentHover }}
              />
            </View>

            {/* Highlight Row/Col/Block */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                  Highlight Row, Col & Block
                </Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Subtly tint the crosshairs of selected cell
                </Text>
              </View>
              <Switch
                value={settings.highlightRowColBlock}
                onValueChange={(val) =>
                  onUpdateSettings({ highlightRowColBlock: val })
                }
                thumbColor={settings.highlightRowColBlock ? colors.accent : '#F4F3F4'}
                trackColor={{ false: '#767577', true: colors.accentHover }}
              />
            </View>

            {/* AWS Backend URL */}
            <View style={[styles.apiSection, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.apiHeaderRow}>
                <Ionicons name="cloud-outline" size={18} color={colors.accent} />
                <Text style={[styles.apiTitle, { color: colors.textPrimary }]}>
                  Backend Server (AWS / Local)
                </Text>
              </View>
              <Text style={[styles.apiDesc, { color: colors.textSecondary }]}>
                Leave as default or enter your AWS API Gateway URL:
              </Text>
              <View style={styles.apiInputRow}>
                <TextInput
                  style={[
                    styles.apiInput,
                    {
                      color: colors.textPrimary,
                      backgroundColor: colors.surface,
                      borderColor: colors.gridBorderThin,
                    },
                  ]}
                  value={apiUrl}
                  onChangeText={setApiUrl}
                  placeholder="https://xxx.execute-api.us-east-1.amazonaws.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[styles.saveApiBtn, { backgroundColor: colors.accent }]}
                  onPress={handleSaveApiUrl}
                >
                  <Text style={styles.saveApiBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reset Game Action */}
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: colors.errorCell }]}
              onPress={() => {
                onResetGame();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={18} color={colors.errorNumber} style={{ marginRight: 8 }} />
              <Text style={[styles.resetButtonText, { color: colors.errorNumber }]}>
                Restart Current Game
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150,150,150,0.15)',
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  apiSection: {
    padding: 14,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  apiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  apiTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  apiDesc: {
    fontSize: 12,
    marginBottom: 10,
  },
  apiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  saveApiBtn: {
    marginLeft: 8,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveApiBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 10,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
