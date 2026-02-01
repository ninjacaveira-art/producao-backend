const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Banco SQLite (compatível com Render)
const dbPath = path.resolve(__dirname, "database.db");
const db = new Database(dbPath);

// Criar tabela
db.prepare(`
  CREATE TABLE IF NOT EXISTS ordens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    of TEXT,
    produto TEXT,
    quantidade INTEGER,
    status TEXT,
    data TEXT
  )
`).run();

// Rota teste
app.get("/", (req, res) => {
  res.send("Backend funcionando no Render 🚀");
});

// GET ordens
app.get("/ordens", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM ordens ORDER BY id DESC")
    .all();
  res.json(rows);
});

// POST ordens
app.post("/ordens", (req, res) => {
  const { of, produto, quantidade, status, data } = req.body;

  const result = db.prepare(`
    INSERT INTO ordens (of, produto, quantidade, status, data)
    VALUES (?, ?, ?, ?, ?)
  `).run(of, produto, quantidade, status, data);

  res.json({
    id: result.lastInsertRowid,
    of,
    produto,
    quantidade,
    status,
    data,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
