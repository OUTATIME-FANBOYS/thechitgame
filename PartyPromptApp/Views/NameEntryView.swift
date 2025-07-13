import SwiftUI

struct NameEntryView: View {
    let sessionCode: String
    let isCreating: Bool
    @State private var name: String = ""
    @State private var navigateToLobby = false

    @AppStorage("userID") var userID: String = UUID().uuidString

    var body: some View {
        VStack(spacing: 20) {
            Text("Enter Your Name")
                .font(.title)

            TextField("Name", text: $name)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding(.horizontal)

            Button("Continue") {
                joinOrCreateSession()
            }
            .buttonStyle(.borderedProminent)

            NavigationLink(
                destination: LobbyView(sessionCode: sessionCode, userName: name, userID: userID),
                isActive: $navigateToLobby
            ) {
                EmptyView()
            }
        }
        .padding()
    }

    func joinOrCreateSession() {
        FirebaseSessionService.shared.createOrJoinSession(
            sessionCode: sessionCode,
            userID: userID,
            userName: name,
            isCreating: isCreating
        ) {
            navigateToLobby = true
        }
    }
}

