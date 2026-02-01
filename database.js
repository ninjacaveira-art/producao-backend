const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "database.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erro ao conectar no banco:", err.message);
  } else {
    console.log("Banco de dados SQLite conectado");
  }
});

// Criar tabela de ordens
db.run(`
  CREATE TABLE IF NOT EXISTS ordens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    of TEXT,
    produto TEXT,
    quantidade INTEGER,
    status TEXT,
    data TEXT
  )
`);

module.exports = db;
