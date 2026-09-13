const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT,
    role TEXT,
    identifier TEXT,
    details TEXT
  )`);
});

// Get all profiles filtered or general
app.get('/api/profiles', (req, res) => {
  db.all("SELECT * FROM profiles", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ profiles: rows });
  });
});

// Add a new profile (Student, Faculty, or Admin entry)
app.post('/api/profiles', (req, res) => {
  const { fullName, role, identifier, details } = req.body;
  db.run(
    "INSERT INTO profiles (fullName, role, identifier, details) VALUES (?, ?, ?, ?)",
    [fullName, role, identifier, details],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.listen(PORT, () => {
  console.log(`ACLC College of Mandaue SIMS server active on port ${PORT}`);
});