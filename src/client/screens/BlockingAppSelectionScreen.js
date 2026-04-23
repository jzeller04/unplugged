import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppSelectionService from '../android/AppSelectionService';

const BlockingAppSelectionScreen = ({ route, navigation }) => {
  const initialSelectedPackages = Array.isArray(route.params?.initialSelectedPackages)
    ? route.params.initialSelectedPackages
    : null;
  const onSelectionConfirm = route.params?.onSelectionConfirm;
  const isChildPickerFlow = typeof onSelectionConfirm === 'function';
  const [apps, setApps] = useState([]);
  const [selectedPackageNames, setSelectedPackageNames] = useState(() => new Set());
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  const loadAppSelectionData = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setSaveError('');
    setSaveSuccessMessage('');

    try {
      const installedApps = await AppSelectionService.getApps();

      const sortedApps = [...(installedApps || [])].sort((leftApp, rightApp) =>
        (leftApp.appName || '').localeCompare(rightApp.appName || ''),
      );
      const visiblePackageNames = new Set(sortedApps.map((app) => app.packageName));
      const sourceSelectedPackages = initialSelectedPackages;
      const preselectedPackages = Array.isArray(sourceSelectedPackages)
        ? Array.from(
            new Set(
              sourceSelectedPackages.filter((packageName) => visiblePackageNames.has(packageName)),
            ),
          )
        : [];

      setApps(sortedApps);
      setSelectedPackageNames(new Set(preselectedPackages));
      setStatus(sortedApps.length > 0 ? 'success' : 'empty');
    } catch (error) {
      console.error('[BlockingAppSelectionScreen] Failed to load app selection data:', error);
      setApps([]);
      setSelectedPackageNames(new Set());
      setErrorMessage(error?.message || 'Failed to load installed apps.');
      setStatus('error');
    }
  }, [initialSelectedPackages]);

  useEffect(() => {
    if (!isChildPickerFlow) {
      setStatus('unsupported');
      return;
    }

    loadAppSelectionData();
  }, [isChildPickerFlow, loadAppSelectionData]);

  const handleConfirmPress = async () => {
    if (isSaving || status !== 'success') {
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccessMessage('');

    try {
      const cleanSelectedPackages = apps.reduce(
        (packages, packageName) => {
          const normalizedPackageName =
            typeof packageName?.packageName === 'string'
              ? packageName.packageName.trim()
              : '';

          if (!normalizedPackageName || !selectedPackageNames.has(normalizedPackageName)) {
            return packages;
          }

          packages.push(normalizedPackageName);
          return packages;
        },
        [],
      );

      if (isChildPickerFlow) {
        onSelectionConfirm(cleanSelectedPackages);
        navigation.goBack();
        return;
      }

      setSaveError('Open this picker from Focus Mode or Edit Mode to save selections.');
    } catch (error) {
      console.error('[BlockingAppSelectionScreen] Failed to save blocked packages:', error);
      setSaveError(error?.message || 'Failed to save blocked apps.');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePackageSelection = (packageName) => {
    setSaveError('');
    setSaveSuccessMessage('');

    setSelectedPackageNames((currentPackages) => {
      const nextPackages = new Set(currentPackages);

      if (nextPackages.has(packageName)) {
        nextPackages.delete(packageName);
      } else {
        nextPackages.add(packageName);
      }

      return nextPackages;
    });
  };

  const handleExitPress = () => {
    navigation.goBack();
  };

  if (!isChildPickerFlow) {
    return (
      <View style={styles.container}>
        <View style={styles.unsupportedContent}>
          <Text style={styles.stateTitle}>Open from a setup flow</Text>
          <Text style={styles.stateBody}>
            App selection now belongs to Focus Mode or Edit Mode so selections
            save into the right blocker flow.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleExitPress}>
            <Text style={styles.retryButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderAppRow = ({ item }) => {
    const isSelected = selectedPackageNames.has(item.packageName);
    const iconSource = item.appIcon
      ? { uri: `data:image/png;base64,${item.appIcon}` }
      : null;

    return (
      <TouchableOpacity
        style={[styles.row, isSelected && styles.rowSelected]}
        onPress={() => togglePackageSelection(item.packageName)}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          {iconSource ? (
            <Image source={iconSource} style={styles.icon} />
          ) : (
            <View style={styles.iconFallback}>
              <Text style={styles.iconFallbackText}>
                {(item.appName || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.rowText}>
          <Text style={styles.appName}>{item.appName}</Text>
        </View>

        <View style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorSelected]}>
          {isSelected ? <View style={styles.selectionIndicatorDot} /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderStateContent = (title, body, showRetry = false) => (
    <View style={styles.stateContent}>
      {status === 'loading' ? <ActivityIndicator size="large" color="#426B69" /> : null}
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateBody}>{body}</Text>
      {showRetry ? (
        <TouchableOpacity style={styles.retryButton} onPress={loadAppSelectionData}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderBody = () => {
    if (status === 'loading') {
      return renderStateContent(
        'Loading apps',
        'Fetching installed apps and current blocked apps.',
      );
    }

    if (status === 'error') {
      return renderStateContent('Could not load app selection', errorMessage, true);
    }

    if (status === 'empty') {
      return renderStateContent(
        'No apps found',
        'No launchable apps were returned by the device.',
      );
    }

    return (
      <FlatList
        data={apps}
        keyExtractor={(item) => item.packageName}
        renderItem={renderAppRow}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const isConfirmDisabled = isSaving || status !== 'success';
  const confirmButtonLabel = isSaving ? 'Saving...' : 'Confirm';

  return (
    <View style={styles.container}>
      {isChildPickerFlow ? (
        <TouchableOpacity onPress={handleExitPress} style={styles.exitButton}>
          <Icon name="x" size={25} color="#222E50" style={styles.exitIcon} />
        </TouchableOpacity>
      ) : null}
      <View style={styles.header}>
        <Text style={styles.title}>Select Apps to Block</Text>
        <Text style={styles.description}>
          Choose apps for this blocker setup.
        </Text>
      </View>

      {renderBody()}

      <View pointerEvents="box-none" style={styles.confirmButtonOverlay}>
        {saveError ? <Text style={styles.saveErrorText}>{saveError}</Text> : null}
        {!saveError && saveSuccessMessage ? (
          <Text style={styles.saveSuccessText}>{saveSuccessMessage}</Text>
        ) : null}
        <Pressable
          style={({ pressed }) => [
            styles.confirmButton,
            isConfirmDisabled && styles.confirmButtonDisabled,
            pressed && !isConfirmDisabled && styles.confirmButtonPressed,
          ]}
          disabled={isConfirmDisabled}
          onPress={handleConfirmPress}
        >
          <Text style={styles.confirmButtonText}>{confirmButtonLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default BlockingAppSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
  },
  unsupportedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 1,
  },
  exitIcon: {
    marginRight: 16,
  },
  title: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 30,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'left',
    marginTop: 50,
  },
  description: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 92,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  rowSelected: {
    backgroundColor: '#E7EEE7',
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  iconFallback: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#D7D7D7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconFallbackText: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 13,
    fontWeight: '700',
  },
  rowText: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  appName: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 18,
  },
  selectionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#6F7894',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectionIndicatorSelected: {
    backgroundColor: '#426B69',
    borderColor: '#426B69',
  },
  selectionIndicatorDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#FFFFFF',
  },
  stateContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  stateTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  stateBody: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#426B69',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Verdana',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButtonOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 14,
    alignItems: 'center',
  },
  confirmButton: {
    minWidth: 220,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 24,
    backgroundColor: '#426B69',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#91A9A6',
  },
  confirmButtonPressed: {
    backgroundColor: '#5A8783',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Verdana',
    fontSize: 16,
    fontWeight: '600',
  },
  saveErrorText: {
    color: '#B22222',
    fontFamily: 'Verdana',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  saveSuccessText: {
    color: '#426B69',
    fontFamily: 'Verdana',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
});
