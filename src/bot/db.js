// db.js
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '../../database');
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath);
}

const db = new Database(path.join(dbPath, 'messages.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_number TEXT,
        body TEXT,
        timestamp TEXT,
        type TEXT DEFAULT 'text',
        file_url TEXT DEFAULT NULL
    )
`);

function saveMessage(from, body, timestamp, type = 'text', fileUrl = null) {
    const stmt = db.prepare(`
        INSERT INTO messages (from_number, body, timestamp, type, file_url)
        VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(from, body, timestamp, type, fileUrl);
}

function getAllMessages() {
    const rows = db.prepare('SELECT * FROM messages ORDER BY id ASC').all();
    return rows.map(msg => ({
        id: msg.id,
        from: msg.from_number,
        body: msg.body,
        timestamp: msg.timestamp,
        type: msg.type,
        url: msg.file_url
    }));
}

module.exports = {
    saveMessage,
    getAllMessages
};