import SwiftUI

struct PromptView: View {
    let sessionCode: String
    let userID: String
    @State private var prompt: String = ""
    @State private var response: String = ""
    @State private var submitted = false
    @State private var isHost = false
    @State private var responses: [String] = []
    @State private var currentIndex = 0

    var body: some View {
        VStack(spacing: 20) {
            Text(prompt).font(.title).multilineTextAlignment(.center)

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
            fetchPrompt()
            fetchRole()
            loadResponses()
        }
    }

    func fetchPrompt() {
        prompt = DummySession.shared.getPrompt(sessionCode: sessionCode)
    }

    func fetchRole() {
        isHost = DummySession.shared.isHost(sessionCode: sessionCode, userID: userID)
    }

    func submitResponse() {
        DummySession.shared.submitResponse(sessionCode: sessionCode, text: response)
        submitted = true
        loadResponses()
    }

    func loadResponses() {
        responses = DummySession.shared.getResponses(sessionCode: sessionCode)
    }

    func syncCurrentIndex() {
        // Optional if you want to sync current index to DummySession
    }
}
