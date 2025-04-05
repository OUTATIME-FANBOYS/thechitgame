import SwiftUI

struct LobbyView: View {
    let sessionCode: String
    let userName: String
    let userID: String
    @State private var users: [String] = []
    @State private var prompt: String = ""
    @State private var navigateToPrompt = false
    @State private var isHost = false

    var body: some View {
        VStack(spacing: 20) {
            Text("Session: \(sessionCode)").font(.headline)
            Text("Welcome, \(userName)!").font(.subheadline)

            List(users, id: \ .self) { user in
                Text(user)
            }

            if isHost {
                TextField("Enter a prompt...", text: $prompt)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)

                Button("Start Game") {
                    startPrompt()
                }
                .buttonStyle(.borderedProminent)
            }

            NavigationLink(
                destination: PromptView(sessionCode: sessionCode, userID: userID),
                isActive: $navigateToPrompt
            ) {
                EmptyView()
            }
        }
        .padding()
        .onAppear {
            listenForUsers()
            checkIfHost()
        }
    }

    func listenForUsers() {
        users = DummySession.shared.getUsers(sessionCode: sessionCode)
    }

    func checkIfHost() {
        isHost = DummySession.shared.isHost(sessionCode: sessionCode, userID: userID)
    }

    func startPrompt() {
        DummySession.shared.setPrompt(sessionCode: sessionCode, prompt: prompt)
        navigateToPrompt = true
    }
}
