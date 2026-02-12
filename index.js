console.log("🔥 ESTE INDEX.JS FOI CARREGADO 🔥");

const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "segredo_producao";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 🔐 Middleware de autenticação
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.usuario = decoded;
    next();
  });
}

// 📦 Banco SQLite
const dbPath = path.resolve(__dirname, "database.db");
const db = new Database(dbPath);

// Tabelas
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

db.prepare(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    senha TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE
  )
`).run();
const statusPadrao = [
  "Falta Corte",
  "Falta Dobra",
  "Falta Solda",
  "Falta Liberação Qualidade",
  "Finalizada"
];

statusPadrao.forEach((nome) => {
  db.prepare(`
    INSERT OR IGNORE INTO status (nome)
    VALUES (?)
  `).run(nome);
});



// 🧪 Rota teste
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// 📄 GET ordens (PROTEGIDA)
app.get("/ordens", autenticar, (req, res) => {
  const rows = db.prepare("SELECT * FROM ordens ORDER BY id DESC").all();
  res.json(rows);
});

// 👤 REGISTER (APENAS UMA!)
app.post("/register", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha obrigatórios" });
  }

  const senhaHash = bcrypt.hashSync(senha, 10);

  try {
    db.prepare(
      "INSERT INTO usuarios (email, senha) VALUES (?, ?)"
    ).run(email, senhaHash);

    res.json({ message: "Usuário criado com sucesso" });
  } catch {
    res.status(400).json({ error: "Usuário já existe" });
  }
});

// 🔑 LOGIN
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  const user = db
    .prepare("SELECT * FROM usuarios WHERE email = ?")
    .get(email);

  if (!user) {
    return res.status(401).json({ error: "Usuário não encontrado" });
  }

  const senhaValida = bcrypt.compareSync(senha, user.senha);

  if (!senhaValida) {
    return res.status(401).json({ error: "Senha inválida" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token });
});


// 🏭 POST ordens
app.post("/ordens", autenticar, (req, res) => {
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
