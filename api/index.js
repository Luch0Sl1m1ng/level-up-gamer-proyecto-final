import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pkg from "pg";

const { Pool } = pkg;
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});

pool
  .connect()
  .then(() => console.log("Conectado a PostgreSQL"))
  .catch((e) => console.error("Error en PostgreSQL:", e.message));

const SECRET = process.env.SECRET_KEY || "secret_key";

function authRequired(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

function onlyVendedor(req, res, next) {
  if (req.user?.rol !== "vendedor") {
    return res.status(403).json({ error: "Solo vendedor" });
  }
  next();
}

app.post("/usuarios", async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    await pool.query(
      "INSERT INTO usuario (nombre, email, password, rol) VALUES ($1,$2,$3,$4)",
      [nombre, email, password, "cliente"]
    );
    res.status(201).json({ message: "Usuario creado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const r = await pool.query(
      "SELECT id_usuario, nombre, rol FROM usuario WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (r.rowCount === 0) return res.status(401).json({ error: "Credenciales inválidas" });

    const u = r.rows[0];
    const token = jwt.sign({ id: u.id_usuario, rol: u.rol }, SECRET, { expiresIn: "12h" });

    res.json({ token, nombre: u.nombre, rol: u.rol });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/productos", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT id_producto, codigo, nombre, precio FROM producto ORDER BY id_producto ASC"
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/productos", authRequired, onlyVendedor, async (req, res) => {
  const { codigo, nombre, precio } = req.body;

  try {
    if (!codigo || !codigo.trim()) {
      return res.status(400).json({ error: "codigo requerido" });
    }

    const r = await pool.query(
      "INSERT INTO producto (codigo, nombre, precio) VALUES ($1,$2,$3) RETURNING id_producto, codigo, nombre, precio",
      [codigo.trim(), nombre, precio]
    );

    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/productos/:id", authRequired, onlyVendedor, async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, precio } = req.body;

  try {
    if (!codigo || !codigo.trim()) {
      return res.status(400).json({ error: "codigo requerido" });
    }

    const r = await pool.query(
      "UPDATE producto SET codigo=$1, nombre=$2, precio=$3 WHERE id_producto=$4 RETURNING id_producto, codigo, nombre, precio",
      [codigo.trim(), nombre, precio, id]
    );

    if (r.rowCount === 0) return res.status(404).json({ error: "Producto no encontrado" });

    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/productos/:id", authRequired, onlyVendedor, async (req, res) => {
  const { id } = req.params;

  try {
    const r = await pool.query("DELETE FROM producto WHERE id_producto=$1 RETURNING id_producto", [id]);

    if (r.rowCount === 0) return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/boletas", authRequired, async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT id_boleta, fecha, total FROM boleta WHERE id_usuario=$1 ORDER BY id_boleta DESC",
      [req.user.id]
    );
    res.json(r.rows);
  } catch (err) {

    try {
      const r2 = await pool.query("SELECT id_boleta, fecha, total FROM boleta ORDER BY id_boleta DESC");
      res.json(r2.rows);
    } catch (e2) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post("/boletas", authRequired, async (req, res) => {
  const { total } = req.body;

  try {
    let r;
    try {

      r = await pool.query(
        "INSERT INTO boleta (total, fecha, id_usuario) VALUES ($1, NOW(), $2) RETURNING id_boleta, fecha, total",
        [total, req.user.id]
      );
    } catch (e) {

      r = await pool.query(
        "INSERT INTO boleta (total, fecha) VALUES ($1, NOW()) RETURNING id_boleta, fecha, total",
        [total]
      );
    }
    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 API en puerto ${PORT}`));
