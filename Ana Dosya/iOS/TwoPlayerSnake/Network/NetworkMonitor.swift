import Foundation
import Network

final class NetworkMonitor {
    static let shared = NetworkMonitor()

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "com.twoplayersnake.networkmonitor")

    private(set) var isConnected: Bool = false
    var onStatusChange: ((Bool) -> Void)?

    private init() {
        // Başlangıç durumunu anlık kontrol et; ağ hazır olmadan 'online' varsayma
        self.isConnected = (monitor.currentPath.status == .satisfied)

        monitor.pathUpdateHandler = { [weak self] path in
            guard let self = self else { return }
            let connected = path.status == .satisfied
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
        return isConnected && (monitor.currentPath.status == .satisfied)
    }
}

