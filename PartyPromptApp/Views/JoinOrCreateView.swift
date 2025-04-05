import SwiftUI

struct JoinOrCreateView: View {
    @State private var sessionCode: String = ""
    @State private var navigateToNameEntry = false
    @State private var isCreating = false

    var body: some View {
        VStack(spacing: 20) {
            Text("Party Prompt 🎉")
                .font(.largeTitle.bold())

            TextField("Enter session code", text: $sessionCode)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding(.horizontal)

            Button("Join Session") {
                isCreating = false
                navigateToNameEntry = true
            }
            .buttonStyle(.borderedProminent)

            Button("Create Session") {
                sessionCode = UUID().uuidString.prefix(6).uppercased()
                isCreating = true
                navigateToNameEntry = true
            }
            .buttonStyle(.bordered)

            NavigationLink(
                destination: NameEntryView(sessionCode: sessionCode, isCreating: isCreating),
                isActive: $navigateToNameEntry
            ) {
                EmptyView()
            }
        }
        .padding()
    }
}
