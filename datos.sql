DROP TABLE IF EXISTS detalle_boleta;
DROP TABLE IF EXISTS boleta;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS categoria;

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'cliente'
);

CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    precio INTEGER NOT NULL,
    stock INTEGER DEFAULT 0,
    id_categoria INTEGER REFERENCES categoria(id_categoria)
);

INSERT INTO categoria (nombre) VALUES 
('Juegos de Mesa'), ('Accesorios'), ('Consolas'), ('Computadores Gamers'), ('Sillas Gamers');

INSERT INTO producto (codigo, id_categoria, nombre, precio, stock) VALUES
('JM001', 1, 'Catan - El Juego', 29990, 20),
('AC001', 2, 'Control Xbox Series X', 59990, 10),
('CO001', 3, 'PlayStation 5 Standard', 549990, 5),
('CG001', 4, 'PC Gamer ASUS ROG', 1299990, 3),
('SG001', 5, 'Silla Secretlab Titan', 349990, 5);

INSERT INTO usuario (nombre, email, password, rol) VALUES
('Admin LevelUp', 'admin@levelup.cl', '$2a$10$Xk.M.F/F./F./F./F./F./F./F./F./F./F./F./F.', 'admin');
