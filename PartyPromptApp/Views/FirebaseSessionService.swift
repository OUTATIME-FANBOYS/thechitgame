import Foundation
import FirebaseFirestore

struct PartySession: Codable {
    var id: String
    var hostID: String
    var users: [String: String] // userID: name
    var prompt: String
    var responses: [String]
    var currentIndex: Int
}

class FirebaseSessionService: ObservableObject {
    static let shared = FirebaseSessionService()

    private let db = Firestore.firestore()

    func createOrJoinSession(sessionCode: String, userID: String, userName: String, isCreating: Bool, completion: @escaping () -> Void) {
        let ref = db.collection("sessions").document(sessionCode)

        ref.getDocument { snapshot, error in
            if let data = snapshot?.data(), !isCreating {
                ref.updateData([
                    "users.\(userID)": userName
                ]) { _ in completion() }
            } else {
                let session = PartySession(
                    id: sessionCode,
                    hostID: userID,
                    users: [userID: userName],
                    prompt: "",
                    responses: [],
                    currentIndex: 0
                )
                try? ref.setData(from: session) { _ in completion() }
            }
        }
    }

    func observeUsers(sessionCode: String, onUpdate: @escaping ([String]) -> Void) -> ListenerRegistration {
        return db.collection("sessions").document(sessionCode)
            .addSnapshotListener { snapshot, error in
                if let data = try? snapshot?.data(as: PartySession.self) {
                    onUpdate(Array(data.users.values))
                }
            }
    }

    func isHost(sessionCode: String, userID: String, completion: @escaping (Bool) -> Void) {
        db.collection("sessions").document(sessionCode).getDocument { snapshot, _ in
            if let data = try? snapshot?.data(as: PartySession.self) {
                completion(data.hostID == userID)
            }
        }
    }

    func setPrompt(sessionCode: String, prompt: String) {
        db.collection("sessions").document(sessionCode).updateData(["prompt": prompt])
    }

    func observePrompt(sessionCode: String, onUpdate: @escaping (String) -> Void) -> ListenerRegistration {
        return db.collection("sessions").document(sessionCode)
            .addSnapshotListener { snapshot, _ in
                if let data = try? snapshot?.data(as: PartySession.self) {
                    onUpdate(data.prompt)
                }
            }
    }

    func submitResponse(sessionCode: String, text: String) {
        let ref = db.collection("sessions").document(sessionCode)
        ref.updateData([
            "responses": FieldValue.arrayUnion([text])
        ])
    }

    func observeResponses(sessionCode: String, onUpdate: @escaping ([String]) -> Void) -> ListenerRegistration {
        return db.collection("sessions").document(sessionCode)
            .addSnapshotListener { snapshot, _ in
                if let data = try? snapshot?.data(as: PartySession.self) {
                    onUpdate(data.responses.shuffled())
                }
            }
    }

    func setCurrentIndex(sessionCode: String, index: Int) {
        db.collection("sessions").document(sessionCode).updateData(["currentIndex": index])
    }

    func observeCurrentIndex(sessionCode: String, onUpdate: @escaping (Int) -> Void) -> ListenerRegistration {
        return db.collection("sessions").document(sessionCode)
            .addSnapshotListener { snapshot, _ in
                if let data = try? snapshot?.data(as: PartySession.self) {
                    onUpdate(data.currentIndex)
                }
            }
    }
}

