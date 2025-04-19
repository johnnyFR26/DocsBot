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
        timestamp TEXT
    )
`);

function saveMessage(from, body, timestamp) {
    const stmt = db.prepare(`
        INSERT INTO messages (from_number, body, timestamp)
        VALUES (?, ?, ?)
    `);
    stmt.run(from, body, timestamp);
}

function getAllMessages() {
    return db.prepare('SELECT * FROM messages ORDER BY id ASC').all();
}

module.exports = {
    saveMessage,
    getAllMessages
};
