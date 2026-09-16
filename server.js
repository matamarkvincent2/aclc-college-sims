const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(express.json());
// Serve static files directly from the root directory
app.use(express.static(__dirname));

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = [
      { id: 1, fullName: 'TESTING', role: 'Student', identifier: '2026-0001', details: 'BSIT - 3rd Year' }
    ];
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Explicit route to send index.html from root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/profiles', (req, res) => {
  const profiles = readDB();
  res.json({ profiles });
});

app.post('/api/profiles', (req, res) => {
  const { fullName, role, identifier, details } = req.body;
  const profiles = readDB();
  const newProfile = {
    id: Date.now(),
    fullName,
    role,
    identifier,
    details
  };
  profiles.push(newProfile);
  writeDB(profiles);
  res.json({ id: newProfile.id });
});

app.delete('/api/profiles/:id', (req, res) => {
  let profiles = readDB();
  const id = Number(req.params.id);
  profiles = profiles.filter(p => p.id !== id);
  writeDB(profiles);
  res.json({ deleted: 1 });
});

app.listen(PORT, () => {
  console.log(`ACLC College of Mandaue SIMS server active on port ${PORT}`);
});