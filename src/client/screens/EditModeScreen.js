import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppSelectionService from '../android/AppSelectionService';

const createGroupId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const sortPackagesByAppName = (packages = [], appNamesByPackage = {}) =>
  [...packages].sort((leftPackageName, rightPackageName) =>
    (appNamesByPackage[leftPackageName] || leftPackageName).localeCompare(
      appNamesByPackage[rightPackageName] || rightPackageName,
    ),
  );

const EditModeScreen = ({ route, navigation }) => {
  const existing = route.params?.groupData || route.params?.group || null;
  const screenMode = route.params?.screenMode || (existing ? 'edit' : 'create');
  const onSave = route.params?.onSave;
  const initialSelectedPackages = existing?.selectedPackages ?? [];

  const [name, setName] = useState(existing?.name || '');
  const [startTime, setStartTime] = useState(existing?.startTime || '09:00 AM');
  const [endTime, setEndTime] = useState(existing?.endTime || '05:00 PM');
  const [selectedPackages, setSelectedPackages] = useState(initialSelectedPackages);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [appIconsByPackage, setAppIconsByPackage] = useState({});
  const [appNamesByPackage, setAppNamesByPackage] = useState({});

  const hasUnsavedChanges =
    name !== (existing?.name || '') ||
    startTime !== (existing?.startTime || '09:00 AM') ||
    endTime !== (existing?.endTime || '05:00 PM') ||
    selectedPackages.join('|') !== initialSelectedPackages.join('|');

  const selectedAppsSummary = selectedPackages.length === 0
    ? 'No apps selected'
    : `${selectedPackages.length} app${selectedPackages.length === 1 ? '' : 's'} selected`;
  const sortedSelectedPackages = sortPackagesByAppName(selectedPackages, appNamesByPackage);

  useEffect(() => {
    const hydrateAppMetadata = async () => {
      try {
        const installedApps = await AppSelectionService.getApps();
        const nextAppIconsByPackage = {};
        const nextAppNamesByPackage = {};

        (installedApps || []).forEach((app) => {
          if (!app?.packageName) {
            return;
          }

          if (app.appIcon) {
            nextAppIconsByPackage[app.packageName] = app.appIcon;
          }

          if (app.appName) {
            nextAppNamesByPackage[app.packageName] = app.appName;
          }
        });

        setAppIconsByPackage(nextAppIconsByPackage);
        setAppNamesByPackage(nextAppNamesByPackage);
      } catch (error) {
        console.error('[EditModeScreen] Failed to load app metadata:', error);
      }
    };

    hydrateAppMetadata();
  }, []);

  const handleSaveGroup = () => {
    const sortedPackages = sortPackagesByAppName(selectedPackages, appNamesByPackage);
    const nextSavedGroup = {
      id: existing?.id || createGroupId(),
      name: name.trim() || 'Untitled Group',
      startTime,
      endTime,
      selectedPackages: sortedPackages,
    };

    if (onSave) {
      onSave(nextSavedGroup);
    }

    navigation.goBack();
  };

  const handleExitPress = () => {
    if (!hasUnsavedChanges) {
      navigation.goBack();
      return;
    }
    setExitModalVisible(true);
  };

  const handleChooseAppsPress = () => {
    navigation.navigate('BlockingAppSelection', {
      initialSelectedPackages: selectedPackages,
      onSelectionConfirm: (nextSelectedPackages = []) => {
        const cleanSelectedPackages = Array.from(
          new Set(
            nextSelectedPackages.filter(
              (packageName) => typeof packageName === 'string' && packageName.trim().length > 0,
            ),
          ),
        );
        setSelectedPackages(sortPackagesByAppName(cleanSelectedPackages, appNamesByPackage));
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleExitPress} style={styles.exitButton}>
        <Icon name="x" size={25} color="#222E50" style={{ marginRight: 16 }} />
      </TouchableOpacity>

      <Text style={styles.title}>
        {screenMode === 'edit' ? 'Edit Group' : 'Create Group'}
      </Text>

      <Text style={styles.label}>Group Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter group name"
      />

      <Text style={styles.label}>Start Time</Text>
      <TextInput
        style={styles.input}
        value={startTime}
        onChangeText={setStartTime}
        placeholder="10:00 AM"
      />

      <Text style={styles.label}>End Time</Text>
      <TextInput
        style={styles.input}
        value={endTime}
        onChangeText={setEndTime}
        placeholder="10:00 PM"
      />

      <Text style={styles.label}>Selected Apps</Text>
      <View style={styles.selectionBox}>
        <Text style={styles.selectionText}>{selectedAppsSummary}</Text>
        {sortedSelectedPackages.length > 0 ? (
          <View style={styles.selectedIconsRow}>
            {sortedSelectedPackages.slice(0, 6).map((packageName) => {
              const appIcon = appIconsByPackage[packageName];

              if (!appIcon) {
                return (
                  <View key={packageName} style={styles.selectedIconFallback}>
                    <Text style={styles.selectedIconFallbackText}>
                      {(packageName || '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                );
              }

              return (
                <Image
                  key={packageName}
                  source={{ uri: `data:image/png;base64,${appIcon}` }}
                  style={styles.selectedAppIcon}
                />
              );
            })}
          </View>
        ) : null}
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleChooseAppsPress}>
        <Text style={styles.secondaryButtonText}>Choose Apps</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveGroup}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>

      <Modal visible={exitModalVisible} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Discard changes?</Text>
            <Text style={styles.modalSubtitle}>
              Your changes will not be saved.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setExitModalVisible(false)}
              >
                <Text style={styles.cancelText}>Keep editing</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setExitModalVisible(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.confirmText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF'
  },
  title: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 48,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'left',
    marginTop: 50,
  },
  label: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 18,
  },
  input: {
    fontFamily: 'Verdana',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 18,
    fontSize: 16,
  },
  selectionBox: {
    backgroundColor: '#F0F0F0',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  selectionText: {
    color: '#555555',
    fontFamily: 'Verdana',
    fontSize: 16,
  },
  selectedIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  selectedAppIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedIconFallback: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#B5CA8D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedIconFallbackText: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    fontFamily: 'Verdana',
    color: '#222E50',
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  saveButton: {
    backgroundColor: '#426B69',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveText: {
    fontFamily: 'Verdana',
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    right: 24,
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

export default EditModeScreen;
