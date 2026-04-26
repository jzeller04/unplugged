import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ScrollView, View, TouchableOpacity, Modal, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppSelectionService from '../android/AppSelectionService';
import {
  readNativeBlockerRuntimeState,
  syncSavedGroupRuntimeToNative,
} from '../helper/blockerRuntimeSync';
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

const CustomizeScreen = ({ navigation }) => {
  const [detoxGroups, setDetoxGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupToDeleteId, setGroupToDeleteId] = useState(null);
  const [groupToDeleteName, setGroupToDeleteName] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [appNamesByPackage, setAppNamesByPackage] = useState({});
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeGroupError, setActiveGroupError] = useState('');
  const [isSyncingActiveGroup, setIsSyncingActiveGroup] = useState(false);
  const [blockingEnabled, setBlockingEnabled] = useState(false);
  const [isSavingToggle, setIsSavingToggle] = useState(false);
  const [toggleError, setToggleError] = useState('');

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

      setDetoxGroups(storedGroups);

      if (storedActiveGroupId && !hasMatchingActiveGroup) {
        clearActiveDetoxGroupId();
      }

      try {
        await syncSavedGroupRuntimeToNative({
          groups: storedGroups,
          activeGroupId: nextActiveGroupId,
        });
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
        const config = await readNativeBlockerRuntimeState();

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

  const handleSave = (savedGroup) => {
    const existingGroup = detoxGroups.find((group) => group.id === savedGroup.id);
    const nextGroup = {
      ...existingGroup,
      ...savedGroup,
      selectedPackages: savedGroup.selectedPackages ?? existingGroup?.selectedPackages ?? [],
    };

    const nextGroups = existingGroup
      ? detoxGroups.map((group) => (group.id === savedGroup.id ? nextGroup : group))
      : [...detoxGroups, nextGroup];

    setDetoxGroups(nextGroups);
    saveDetoxGroups(nextGroups);

    if (savedGroup.id === activeGroupId) {
      syncSavedGroupRuntimeToNative({
        groups: nextGroups,
        activeGroupId,
      })
        .then(() => {
          setActiveGroupError('');
        })
        .catch((error) => {
          console.error('[CustomizeScreen] Failed to sync edited active group:', error);
          setActiveGroupError(error?.message || 'Failed to sync active group.');
        });
    }
  };

  const openEditGroup = (group) => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    navigation.navigate('EditMode', {
      screenMode: group ? 'edit' : 'create',
      groupData: group,
      onSave: handleSave,
    });
  };

  const openDeleteModal = (group) => {
    setGroupToDeleteId(group?.id || null);
    setGroupToDeleteName(group?.name || '');
    setModalVisible(true);
  };

  const closeDeleteModal = () => {
    setModalVisible(false);
    setGroupToDeleteId(null);
    setGroupToDeleteName('');
  };

  const handleConfirmDelete = () => {
    if (!groupToDeleteId) {
      closeDeleteModal();
      return;
    }

    const shouldClearActiveGroupId = groupToDeleteId === activeGroupId;
    const nextGroups = detoxGroups.filter((group) => group.id !== groupToDeleteId);

    setDetoxGroups(nextGroups);
    saveDetoxGroups(nextGroups);

    if (shouldClearActiveGroupId) {
      setActiveGroupId(null);
      clearActiveDetoxGroupId();
      syncSavedGroupRuntimeToNative({
        groups: nextGroups,
        activeGroupId: null,
      })
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
      await syncSavedGroupRuntimeToNative({
        groups: detoxGroups,
        activeGroupId: groupId,
        blockingEnabled: true,
      });
      setActiveGroupId(groupId);
      setBlockingEnabled(true);
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
    const previousActiveGroupId = activeGroupId;
    const nextActiveGroupId = nextValue ? activeGroupId : null;

    setBlockingEnabled(nextValue);
    if (!nextValue) {
      setActiveGroupId(null);
    }
    setIsSavingToggle(true);
    setToggleError('');

    try {
      await syncSavedGroupRuntimeToNative({
        groups: detoxGroups,
        activeGroupId: nextActiveGroupId,
        blockingEnabled: nextValue,
      });
      if (!nextValue) {
        await clearActiveDetoxGroupId();
      }
    } catch (error) {
      console.error('[CustomizeScreen] Failed to save blockingEnabled:', error);
      setBlockingEnabled(previousValue);
      setActiveGroupId(previousActiveGroupId);
      setToggleError(error?.message || 'Failed to update blocker state.');
    } finally {
      setIsSavingToggle(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Detox</Text>

      <Text style={styles.description}>Set up Detox groups for distraction-free time</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detox Groups</Text>

        {detoxGroups.map((group) => {
          const isActive = group.id === activeGroupId;

          return (
            <View key={group.id} style={[styles.modeCard, isActive && styles.modeCardActive]}>
              <TouchableOpacity
                style={styles.modeContent}
                onPress={() => handleActivateGroup(group.id)}
                activeOpacity={0.8}
                disabled={isSyncingActiveGroup}
              >
                <View style={styles.modeHeaderRow}>
                  <Text style={styles.itemName}>{group.name || 'New group'}</Text>
                  {isActive ? <Text style={styles.activeBadge}>Active</Text> : null}
                </View>

                <View style={styles.detailRow}>
                  <Icon name="clock" size={16} color="#555555" />
                  <Text style={styles.itemTime}>
                    {group.startTime} - {group.endTime}
                  </Text>
                </View>

                <Text style={styles.appSummary}>
                  {getBlockedAppsSummary(
                    group.selectedPackages,
                    appNamesByPackage,
                  )}
                </Text>
              </TouchableOpacity>

              <View style={styles.actionColumn}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => openEditGroup(group)}
                >
                  <Icon name="edit" size={22} color="#222E50" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => openDeleteModal(group)}
                >
                  <Icon name="trash-2" size={22} color="#222E50" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={styles.bottomActionRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openEditGroup(undefined)}
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
              {groupToDeleteName ? `Delete ${groupToDeleteName}?` : 'Delete this mode?'}
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
