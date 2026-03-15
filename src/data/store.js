const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

const readDB = () => {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { projects: [], certifications: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { readDB, writeDB };
