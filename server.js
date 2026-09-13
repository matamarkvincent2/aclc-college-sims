const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT,
    role TEXT,
    identifier TEXT,
    details TEXT
  )`);

  // Seed default demo accounts if table is empty
  db.get("SELECT count(*) as count FROM profiles", (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare("INSERT INTO profiles (fullName, role, identifier, details) VALUES (?, ?, ?, ?)");
      stmt.run("Juan Dela Cruz", "Student", "2026-0001", "BSIT - 3rd Year");
      stmt.run("Prof. Maria Santos", "Faculty", "FAC-1001", "Computer Studies Department");
      stmt.run("Admin Director", "Admin", "ADM-0001", "System Administrator");
      stmt.finalize();
    }
  });
});

// Explicit root route fix so Express serves index.html properly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all profiles
app.get('/api/profiles', (req, res) => {
  db.all("SELECT * FROM profiles", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ profiles: rows });
  });
});

// Add a new profile
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

// Delete a profile (Admin utility)
app.delete('/api/profiles/:id', (req, res) => {
  db.run("DELETE FROM profiles WHERE id = ?", req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`ACLC College of Mandaue SIMS server active on port ${PORT}`);
});