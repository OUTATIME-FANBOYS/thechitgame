import SwiftUI
import Firebase

struct PromptView: View {
    let sessionCode: String
    let userID: String

    @State private var prompt: String = ""
    @State private var response: String = ""
    @State private var submitted = false
    @State private var isHost = false
    @State private var responses: [String] = []
    @State private var currentIndex: Int = 0

    // Firebase listeners
    @State private var promptListener: ListenerRegistration?
    @State private var responsesListener: ListenerRegistration?
    @State private var indexListener: ListenerRegistration?

    var body: some View {
        VStack(spacing: 20) {
            Text(prompt)
                .font(.title)
                .multilineTextAlignment(.center)

            if !submitted && !isHost {
                TextField("Your response...", text: $response)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)

                Button("Submit") {
                    submitResponse()
                }
                .buttonStyle(.borderedProminent)
            } else if submitted && !isHost {
                Text("Waiting for host to scroll...").foregroundColor(.gray)
            }

            if responses.indices.contains(currentIndex) {
                Text(responses[currentIndex])
                    .font(.title2)
                    .padding()
            }

            if isHost {
                HStack {
                    Button("Previous") {
                        if currentIndex > 0 {
                            currentIndex -= 1
                            syncCurrentIndex()
                        }
                    }
                    .disabled(currentIndex == 0)

                    Button("Next") {
                        if currentIndex < responses.count - 1 {
                            currentIndex += 1
                            syncCurrentIndex()
                        }
                    }
                    .disabled(currentIndex >= responses.count - 1)
                }
            }
        }
        .padding()
        .onAppear {
            setupFirebaseListeners()
        }
        .onDisappear {
            promptListener?.remove()
            responsesListener?.remove()
            indexListener?.remove()
        }
    }

    func setupFirebaseListeners() {
        // Live prompt updates
        promptListener = FirebaseSessionService.shared.observePrompt(sessionCode: sessionCode) { updatedPrompt in
            self.prompt = updatedPrompt
        }

        // Check if user is host
        FirebaseSessionService.shared.isHost(sessionCode: sessionCode, userID: userID) { result in
            self.isHost = result
        }

        // Live responses
        responsesListener = FirebaseSessionService.shared.observeResponses(sessionCode: sessionCode) { newResponses in
            self.responses = newResponses
        }

        // Live currentIndex sync
        indexListener = FirebaseSessionService.shared.observeCurrentIndex(sessionCode: sessionCode) { newIndex in
            self.currentIndex = newIndex
        }
    }

    func submitResponse() {
        FirebaseSessionService.shared.submitResponse(sessionCode: sessionCode, text: response)
        submitted = true
    }

    func syncCurrentIndex() {
        FirebaseSessionService.shared.setCurrentIndex(sessionCode: sessionCode, index: currentIndex)
    }
}

