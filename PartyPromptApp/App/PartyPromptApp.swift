import SwiftUI
import Firebase

@main
struct PartyPromptApp: App {
    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            NavigationView {
                JoinOrCreateView()
            }
        }
    }
}
