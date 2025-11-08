import Foundation
import DeviceActivity

class UsageMetricsManager {
    private let center = DeviceActivityCenter()
    
    func requestUsageData() {
        // todo: Set up DeviceActivitySchedule and pull usage events
        print("Getting usage data")
    }

    func getUsageDataMock() -> [String: TimeInterval] {
        [
            "Instagram": 1500,
            "Snapchat": 900,
            "TikTok": 1200
        ]
    }
}