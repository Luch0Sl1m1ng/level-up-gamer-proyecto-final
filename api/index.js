import express from 'express';
import cors from 'cors';
import pool from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "secreto_duoc";

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => res.send("API Level-Up Gamer v2.0 (CRUD Completo) 🚀"));

app.get('/productos', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM producto ORDER BY id_producto ASC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query("SELECT * FROM producto WHERE id_producto = $1", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "No encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/productos', async (req, res) => {
    const { codigo, nombre, precio, stock, id_categoria } = req.body;
    try {
        const codigoFinal = codigo || "PROD-" + Math.floor(Math.random() * 1000);
        
        const consulta = "INSERT INTO producto (codigo, nombre, precio, stock, id_categoria) VALUES ($1, $2, $3, $4, $5) RETURNING *";
        const values = [codigoFinal, nombre, precio, stock || 10, id_categoria || 1];
        
        const { rows } = await pool.query(consulta, values);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear (¿Código repetido?)" });
    }
});

app.put('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio } = req.body;
    try {
        const consulta = "UPDATE producto SET nombre = $1, precio = $2 WHERE id_producto = $3 RETURNING *";
        const { rows } = await pool.query(consulta, [nombre, precio, id]);
        
        if (rows.length === 0) return res.status(404).json({ message: "Producto no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/productos/:id', async (req, res) => {
    const { id } = req.params;
    try {

        const { rowCount } = await pool.query("DELETE FROM producto WHERE id_producto = $1", [id]);
        
        if (rowCount === 0) return res.status(404).json({ message: "Producto no encontrado" });
        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se puede eliminar (quizás ya fue vendido)" });
    }
});



app.post('/registro', async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);
        const consulta = "INSERT INTO usuario (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING *";
        const { rows } = await pool.query(consulta, [nombre, email, passwordEncriptada, rol || 'cliente']);
        res.status(201).json({ message: "Usuario creado", usuario: rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Email ya existe" });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows } = await pool.query("SELECT * FROM usuario WHERE email = $1", [email]);
        if (rows.length === 0) return res.status(404).json({ message: "Usuario no existe" });
        const usuario = rows[0];
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) return res.status(401).json({ message: "Clave incorrecta" });
        const token = jwt.sign({ email: usuario.email }, SECRET_KEY);
        res.json({ token, email: usuario.email });
    } catch (error) {
        res.status(500).json({ error: "Error en login" });
    }
});

app.listen(PORT, () => {
    console.log(`API Actualizada corriendo en puerto ${PORT}`);
});