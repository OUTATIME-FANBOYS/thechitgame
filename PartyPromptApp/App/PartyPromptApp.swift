import SwiftUI

@main
struct PartyPromptApp: App {
    var body: some Scene {
        WindowGroup {
            NavigationView {
                JoinOrCreateView()
            }
        }
    }
}
