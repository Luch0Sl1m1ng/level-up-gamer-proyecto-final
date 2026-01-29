const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = 'clave_secreta_levelup';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: "No token" });
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });
        req.user = decoded;
        next();
    });
};

app.post('/registro', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO usuario (nombre, email, password, rol) VALUES ($1, $2, $3, $4)', [nombre, email, hash, 'cliente']);
        res.status(201).json({ message: "Usuario creado" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ message: "Error" });
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Error" });
        const token = jwt.sign({ id: user.id_usuario, rol: user.rol }, SECRET);
        res.json({ token, rol: user.rol, nombre: user.nombre });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/productos', async (req, res) => {
    const result = await pool.query('SELECT * FROM producto');
    res.json(result.rows);
});

app.post('/boletas', verifyToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { total, productos } = req.body;
        await client.query('BEGIN');
        const resB = await client.query('INSERT INTO boleta (id_usuario, total) VALUES ($1, $2) RETURNING id_boleta', [req.user.id, total]);
        const idB = resB.rows[0].id_boleta;
        for (let p of productos) {
            await client.query('INSERT INTO detalle_boleta (id_boleta, id_producto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)', [idB, p.id_producto, p.cantidad, p.precio]);
        }
        await client.query('COMMIT');
        res.status(201).json({ id_boleta: idB });
    } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); }
    finally { client.release(); }
});

app.get('/mis-boletas', verifyToken, async (req, res) => {
    const result = await pool.query('SELECT * FROM boleta WHERE id_usuario = $1 ORDER BY fecha DESC', [req.user.id]);
    res.json(result.rows);
});

app.listen(3000, () => console.log('Servidor en puerto 3000'));