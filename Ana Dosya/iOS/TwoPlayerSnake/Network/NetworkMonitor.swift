import Foundation
import Network

final class NetworkMonitor {
    static let shared = NetworkMonitor()

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "com.twoplayersnake.networkmonitor")

    private(set) var isConnected: Bool = true
    var onStatusChange: ((Bool) -> Void)?

    private init() {
        // İyimser başlangıç (true): İlk 50ms'de ağ tespiti bitmeden sahte çevrimdışı moduna girmeyi önler.
        // NWPathMonitor ilk değerlendirmesini tamamlayınca gerçek durumu günceller.
        self.isConnected = true

        monitor.pathUpdateHandler = { [weak self] path in
            guard let self = self else { return }
            let connected = (path.status == .satisfied)
            let changed = self.isConnected != connected
            self.isConnected = connected

            if changed {
                DispatchQueue.main.async {
                    self.onStatusChange?(connected)
                }
            }
        }
        monitor.start(queue: queue)
    }

    func isOnline() -> Bool {
        return isConnected
    }

}

