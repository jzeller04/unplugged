import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ScrollView, View, TouchableOpacity, Modal, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppSelectionService from '../android/AppSelectionService';
import blockingConfig from '../android/BlockingConfig';
import {
  clearActiveDetoxGroupId,
  loadActiveDetoxGroupId,
  loadDetoxGroups,
  saveActiveDetoxGroupId,
  saveDetoxGroups,
} from '../helper/detoxGroupStorage';

const getBlockedAppsSummary = (apps = [], appNamesByPackage = {}) => {
  const appNames = apps
    .filter(Boolean)
    .map((appIdentifier) => appNamesByPackage[appIdentifier] || appIdentifier)
    .sort((leftAppName, rightAppName) => leftAppName.localeCompare(rightAppName));

  if (appNames.length === 0) {
    return 'No apps selected';
  }

  if (appNames.length <= 2) {
    return `Blocked apps: ${appNames.join(', ')}`;
  }

  return `Blocked apps: ${appNames.slice(0, 2).join(', ')} +${appNames.length - 2} more`;
};

const normalizeSelectedPackages = (selectedPackages = []) => {
  if (!Array.isArray(selectedPackages)) {
    return [];
  }

  return Array.from(
    new Set(
      selectedPackages.reduce((packages, packageName) => {
        if (typeof packageName !== 'string') {
          return packages;
        }

        const normalizedPackageName = packageName.trim();
        if (!normalizedPackageName) {
          return packages;
        }

        packages.push(normalizedPackageName);
        return packages;
      }, []),
    ),
  );
};

const CustomizeScreen = ({ navigation }) => {
  const [detoxModes, setDetoxModes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modeToDeleteId, setModeToDeleteId] = useState(null);
  const [modeToDeleteName, setModeToDeleteName] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [appNamesByPackage, setAppNamesByPackage] = useState({});
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeGroupError, setActiveGroupError] = useState('');
  const [isSyncingActiveGroup, setIsSyncingActiveGroup] = useState(false);
  const [blockingEnabled, setBlockingEnabled] = useState(false);
  const [isSavingToggle, setIsSavingToggle] = useState(false);
  const [toggleError, setToggleError] = useState('');

  const syncActiveGroupToNative = async (groups, nextActiveGroupId) => {
    const activeGroup = Array.isArray(groups)
      ? groups.find((group) => group.id === nextActiveGroupId)
      : null;
    const normalizedPackages = normalizeSelectedPackages(activeGroup?.selectedPackages);

    await blockingConfig.setBlockedPackages(normalizedPackages);
  };

  useEffect(() => {
    const loadAppNames = async () => {
      try {
        const installedApps = await AppSelectionService.getApps();
        const nextAppNamesByPackage = (installedApps || []).reduce((namesByPackage, app) => {
          if (!app?.packageName || !app?.appName) {
            return namesByPackage;
          }

          namesByPackage[app.packageName] = app.appName;
          return namesByPackage;
        }, {});

        setAppNamesByPackage(nextAppNamesByPackage);
      } catch (error) {
        console.error('[CustomizeScreen] Failed to load app names for group summary:', error);
      }
    };

    loadAppNames();
  }, []);

  useEffect(() => {
    const loadPersistedGroups = async () => {
      const [storedGroups, storedActiveGroupId] = await Promise.all([
        loadDetoxGroups(),
        loadActiveDetoxGroupId(),
      ]);

      const hasMatchingActiveGroup = storedGroups.some(
        (group) => group.id === storedActiveGroupId,
      );
      const nextActiveGroupId = hasMatchingActiveGroup ? storedActiveGroupId : null;

      setDetoxModes(storedGroups);

      if (storedActiveGroupId && !hasMatchingActiveGroup) {
        clearActiveDetoxGroupId();
      }

      try {
        await syncActiveGroupToNative(storedGroups, nextActiveGroupId);
        setActiveGroupId(nextActiveGroupId);
        setActiveGroupError('');
      } catch (error) {
        console.error('[CustomizeScreen] Failed to sync active group on load:', error);
        setActiveGroupId(null);
        setActiveGroupError(error?.message || 'Failed to sync active group.');
      }
    };

    loadPersistedGroups();
  }, []);

  useEffect(() => {
    const loadBlockingEnabled = async () => {
      setIsNavigating(false);

      try {
        const config = await blockingConfig.getBlockingConfig();

        setBlockingEnabled(config?.blockingEnabled === true);
        setToggleError('');
      } catch (error) {
        console.error('[CustomizeScreen] Failed to load blockingEnabled:', error);
        setToggleError(error?.message || 'Failed to load blocker state.');
      }
    };

    loadBlockingEnabled();

    const unsubscribe = navigation.addListener('focus', loadBlockingEnabled);
    return unsubscribe;
  }, [navigation]);

  const handleSave = (savedMode) => {
    const existingMode = detoxModes.find((mode) => mode.id === savedMode.id);
    const nextMode = {
      ...existingMode,
      ...savedMode,
      // selectedPackages:
      //   savedMode.selectedPackages ?? existingMode?.selectedPackages ?? savedMode.apps ?? existingMode?.apps ?? [],
      selectedPackages: savedMode.selectedPackages ?? existingMode?.selectedPackages ?? [],
      // apps: savedMode.apps ?? existingMode?.apps ?? savedMode.selectedPackages ?? existingMode?.selectedPackages ?? [],
    };

    const nextModes = existingMode
      ? detoxModes.map((mode) => (mode.id === savedMode.id ? nextMode : mode))
      : [...detoxModes, nextMode];

    setDetoxModes(nextModes);
    saveDetoxGroups(nextModes);

    if (savedMode.id === activeGroupId) {
      syncActiveGroupToNative(nextModes, activeGroupId)
        .then(() => {
          setActiveGroupError('');
        })
        .catch((error) => {
          console.error('[CustomizeScreen] Failed to sync edited active group:', error);
          setActiveGroupError(error?.message || 'Failed to sync active group.');
        });
    }
  };

  const openEditMode = (mode) => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    navigation.navigate('EditMode', {
      screenMode: mode ? 'edit' : 'create',
      groupData: mode,
      onSave: handleSave
    });
  };

  const openDeleteModal = (mode) => {
    setModeToDeleteId(mode?.id || null);
    setModeToDeleteName(mode?.name || '');
    setModalVisible(true);
  };

  const closeDeleteModal = () => {
    setModalVisible(false);
    setModeToDeleteId(null);
    setModeToDeleteName('');
  };

  const handleConfirmDelete = () => {
    if (!modeToDeleteId) {
      closeDeleteModal();
      return;
    }

    const shouldClearActiveGroupId = modeToDeleteId === activeGroupId;
    const nextModes = detoxModes.filter((mode) => mode.id !== modeToDeleteId);

    setDetoxModes(nextModes);
    saveDetoxGroups(nextModes);

    if (shouldClearActiveGroupId) {
      setActiveGroupId(null);
      clearActiveDetoxGroupId();
      syncActiveGroupToNative(nextModes, null)
        .then(() => {
          setActiveGroupError('');
        })
        .catch((error) => {
          console.error('[CustomizeScreen] Failed to clear native packages after deleting active group:', error);
          setActiveGroupError(error?.message || 'Failed to sync active group.');
        });
    }

    closeDeleteModal();
  };

  const handleActivateGroup = async (groupId) => {
    if (isSyncingActiveGroup || groupId === activeGroupId) {
      return;
    }

    setIsSyncingActiveGroup(true);
    setActiveGroupError('');

    try {
      await syncActiveGroupToNative(detoxModes, groupId);
      setActiveGroupId(groupId);
      await saveActiveDetoxGroupId(groupId);
    } catch (error) {
      console.error('[CustomizeScreen] Failed to activate detox group:', error);
      setActiveGroupError(error?.message || 'Failed to sync active group.');
    } finally {
      setIsSyncingActiveGroup(false);
    }
  };

  const handleBlockingEnabledChange = async (nextValue) => {
    if (isSavingToggle) {
      return;
    }

    const previousValue = blockingEnabled;

    setBlockingEnabled(nextValue);
    setIsSavingToggle(true);
    setToggleError('');

    try {
      await blockingConfig.setBlockingEnabled(nextValue);
    } catch (error) {
      console.error('[CustomizeScreen] Failed to save blockingEnabled:', error);
      setBlockingEnabled(previousValue);
      setToggleError(error?.message || 'Failed to update blocker state.');
    } finally {
      setIsSavingToggle(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Customize</Text>

      <Text style={styles.description}>Set screen time and modes</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detox Modes</Text>

        {detoxModes.map((mode) => {
          const isActive = mode.id === activeGroupId;

          return (
          <View key={mode.id} style={[styles.modeCard, isActive && styles.modeCardActive]}>
            <TouchableOpacity
              style={styles.modeContent}
              onPress={() => handleActivateGroup(mode.id)}
              activeOpacity={0.8}
              disabled={isSyncingActiveGroup}
            >
              <View style={styles.modeHeaderRow}>
                <Text style={styles.itemName}>{mode.name || 'Untitled mode'}</Text>
                {isActive ? <Text style={styles.activeBadge}>Active</Text> : null}
              </View>

              <View style={styles.detailRow}>
                <Icon name="clock" size={16} color="#555555" />
                <Text style={styles.itemTime}>
                  {mode.startTime} - {mode.endTime}
                </Text>
              </View>

              <Text style={styles.appSummary}>
                {getBlockedAppsSummary(
                  mode.selectedPackages,
                  appNamesByPackage,
                )}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionColumn}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => openEditMode(mode)}
              >
                <Icon name="edit" size={22} color="#222E50" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => openDeleteModal(mode)}
              >
                <Icon name="trash-2" size={22} color="#222E50" />
              </TouchableOpacity>
            </View>
          </View>
        )})}

        <View style={styles.bottomActionRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openEditMode(undefined)}
            disabled={isNavigating}
          >
            <Text style={styles.addText}>Add New Group</Text>
          </TouchableOpacity>

          <View style={styles.blockingToggleFooter}>
            <View style={styles.blockingToggleText}>
              <Text style={styles.blockingToggleLabel}>Enable Blocking</Text>
              <Text style={styles.blockingToggleValue}>
                {blockingEnabled ? 'ON' : 'OFF'}
              </Text>
            </View>

            <Switch
              value={blockingEnabled}
              disabled={isSavingToggle}
              onValueChange={handleBlockingEnabledChange}
              trackColor={{ false: '#C7D3D1', true: '#7FA5A1' }}
              thumbColor={blockingEnabled ? '#426B69' : '#F4F3F4'}
              ios_backgroundColor="#C7D3D1"
            />
          </View>
        </View>

        {toggleError ? <Text style={styles.toggleErrorText}>{toggleError}</Text> : null}
        {activeGroupError ? <Text style={styles.toggleErrorText}>{activeGroupError}</Text> : null}
      </View>

      <Modal visible={modalVisible} transparent onRequestClose={closeDeleteModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modeToDeleteName ? `Delete ${modeToDeleteName}?` : 'Delete this mode?'}
            </Text>
            <Text style={styles.modalSubtitle}>This action cannot be undone.</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeDeleteModal}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.confirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF'
  },
  screenTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 48,
    fontWeight: '600',
    marginTop: 50,
    marginBottom: 12,
    textAlign: 'left',
  },
  description: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 18,
    marginBottom: 18,
  },
  section: {
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
    borderRadius: 30,
    padding: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 24,
    fontWeight: '600',
  },
  modeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  modeCardActive: {
    borderWidth: 2,
    borderColor: '#426B69',
  },
  modeContent: {
    flex: 1,
    paddingRight: 12,
  },
  modeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 18,
    fontFamily: 'Verdana',
    color: '#222E50',
    marginBottom: 6,
    flex: 1,
    marginRight: 12,
  },
  activeBadge: {
    color: '#426B69',
    fontFamily: 'Verdana',
    fontSize: 12,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemTime: {
    fontFamily: 'Verdana',
    fontSize: 13,
    color: '#555555',
    marginLeft: 8,
  },
  appSummary: {
    fontFamily: 'Verdana',
    fontSize: 14,
    color: '#7A7A7A',
    marginTop: 12,
    lineHeight: 22,
  },
  actionColumn: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  iconButton: {
    padding: 4,
    marginBottom: 14,
  },
  addButton: {
    backgroundColor: '#426B69',
    borderRadius: 18,
    marginTop: 12,
    width: 150,
    alignItems: 'center',
  },
  bottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  addText: {
    fontFamily: 'Verdana',
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  blockingToggleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  blockingToggleText: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  blockingToggleLabel: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 14,
    fontWeight: '600',
  },
  blockingToggleValue: {
    color: '#6F7894',
    fontFamily: 'Verdana',
    fontSize: 12,
    marginTop: 2,
  },
  toggleErrorText: {
    color: '#B22222',
    fontFamily: 'Verdana',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 0,
    alignItems: 'center'
  },
  modalTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  modalSubtitle: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    borderTopWidth: 1,
    borderColor: '#DDDDDD'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 16
  },
  cancelText: {
    color: '#222E50',
    fontFamily: 'Verdana'
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#426B69',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomRightRadius: 16
  },
  confirmText: {
    color: '#FFFFFF',
    fontFamily: 'Verdana'
  }
});

export default CustomizeScreen;
