import Foundation

class DummySession {
    static let shared = DummySession()

    struct Session {
        var id: String
        var hostID: String
        var users: [String: String] // userID: name
        var prompt: String
        var responses: [String]
    }

    private var sessions: [String: Session] = [:]

    func joinOrCreateSession(sessionCode: String, userID: String, userName: String, isCreating: Bool) {
        if isCreating {
            sessions[sessionCode] = Session(id: sessionCode, hostID: userID, users: [:], prompt: "", responses: [])
        }
        sessions[sessionCode]?.users[userID] = userName
    }

    func getUsers(sessionCode: String) -> [String] {
        return sessions[sessionCode]?.users.values.map { $0 } ?? []
    }

    func isHost(sessionCode: String, userID: String) -> Bool {
        return sessions[sessionCode]?.hostID == userID
    }

    func setPrompt(sessionCode: String, prompt: String) {
        sessions[sessionCode]?.prompt = prompt
    }

    func getPrompt(sessionCode: String) -> String {
        return sessions[sessionCode]?.prompt ?? ""
    }

    func submitResponse(sessionCode: String, text: String) {
        sessions[sessionCode]?.responses.append(text)
    }

    func getResponses(sessionCode: String) -> [String] {
        return sessions[sessionCode]?.responses.shuffled() ?? []
    }
}

