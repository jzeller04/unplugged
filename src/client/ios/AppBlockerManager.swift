import Foundation
import FamilyControls
import ManagedSettings

class AppBlockerManager {
    let authorizationCenter = AuthorizationCenter.shared

    func requestFamilyControlsAuthorization() async {
        do { 
            try wait authorizationCenter.requestAuthorization(for: .individual)
            print("Authorization given")
        } catch {
            print("Authorization request failed: \(error)")
        }
    }

    func showAppPicker() {
        // todo: show FamilyActivityPickerUI
        print("App picker shown")
    }

    func applyBlocking(to apps: [ApplicationToken]) {
        // todo: Add ManagedSettingsStore to enfore blocking
        print("Blocking applied to apps")
    }
}

