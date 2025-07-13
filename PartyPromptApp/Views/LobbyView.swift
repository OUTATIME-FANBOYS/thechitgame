import SwiftUI
import Firebase

struct LobbyView: View {
    let sessionCode: String
    let userName: String
    let userID: String

    @State private var users: [String] = []
    @State private var prompt: String = ""
    @State private var navigateToPrompt = false
    @State private var isHost = false

    // Firebase listener references
    @State private var usersListener: ListenerRegistration?
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Session: \(sessionCode)").font(.headline)
            Text("Welcome, \(userName)!").font(.subheadline)

            List(users, id: \.self) { user in
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
            setupFirebaseListeners()
        }
        .onDisappear {
            usersListener?.remove() // Stop listening when leaving the view
        }
    }

    func setupFirebaseListeners() {
        // Listen for user list changes
        usersListener = FirebaseSessionService.shared.observeUsers(sessionCode: sessionCode) { updatedUsers in
            self.users = updatedUsers
        }

        // Check if the current user is the host
        FirebaseSessionService.shared.isHost(sessionCode: sessionCode, userID: userID) { isCurrentUserHost in
            self.isHost = isCurrentUserHost
        }
    }

    func startPrompt() {
        FirebaseSessionService.shared.setPrompt(sessionCode: sessionCode, prompt: prompt)
        navigateToPrompt = true
    }
}

