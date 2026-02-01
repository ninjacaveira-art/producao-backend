const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Banco SQLite
const dbPath = path.resolve(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

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

// Rota teste
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// GET ordens
app.get("/ordens", (req, res) => {
  db.all("SELECT * FROM ordens ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json(err);
      return;
    }
    res.json(rows);
  });
});

// POST ordens (ESTA É A CHAVE!)
app.post("/ordens", (req, res) => {
  const { of, produto, quantidade, status, data } = req.body;

  db.run(
    "INSERT INTO ordens (of, produto, quantidade, status, data) VALUES (?, ?, ?, ?, ?)",
    [of, produto, quantidade, status, data],
    function (err) {
      if (err) {
        res.status(500).json(err);
        return;
      }

      res.json({
        id: this.lastID,
        of,
        produto,
        quantidade,
        status,
        data,
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
