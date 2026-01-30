# Documentación API REST — LevelUp Gamer
**Base URL:** http://54.242.30.23:3000  
**Tecnología:** Node.js + Express + PostgreSQL  
**Auth:** JWT (Bearer Token)

---

## Autenticación (JWT)
En endpoints protegidos enviar:
Authorization: Bearer <token>

---

## 1) Registro de Usuario
### POST /usuarios
**Descripción:** Registra un nuevo usuario (cliente).

**Body (JSON):**
{
  "nombre": "Juan",
  "email": "juan@mail.com",
  "password": "1234"
}

**Respuestas:**
- 201: { "message": "Usuario creado" }
- 500: { "error": "..." }

---

## 2) Login
### POST /login
**Descripción:** Inicia sesión y devuelve token JWT.

**Body (JSON):**
{
  "email": "juan@mail.com",
  "password": "1234"
}

**Respuesta 200:**
{
  "token": "<jwt>",
  "nombre": "Juan",
  "rol": "cliente"
}

**Errores:**
- 401: credenciales inválidas
- 500: error interno

---

## 3) Productos (Catálogo)
### GET /productos
**Descripción:** Lista productos disponibles.

**Respuesta 200 (ejemplo):**
[
  { "id_producto": 1, "codigo": "PRD-001", "nombre": "Catan - El Juego", "precio": 29990 }
]

---

## 4) Boletas (Cliente logueado)
### POST /boletas  (PROTEGIDO)
**Header:** Authorization: Bearer <token>  
**Body:**
{ "total": 99990 }

**Respuesta 200/201 (ejemplo):**
{ "id_boleta": 10, "fecha": "2026-01-30T...", "total": 99990 }

### GET /boletas (PROTEGIDO)
**Header:** Authorization: Bearer <token>

**Respuesta 200 (ejemplo):**
[
  { "id_boleta": 10, "fecha": "2026-01-30T...", "total": 99990 }
]

---

## 5) Inventario (Vendedor)
> Requiere token válido y rol vendedor.

### POST /productos (PROTEGIDO - vendedor)
**Body:**
{ "codigo": "PRD-010", "nombre": "Producto nuevo", "precio": 50000 }

### PUT /productos/:id (PROTEGIDO - vendedor)
**Body:**
{ "codigo": "PRD-010", "nombre": "Producto editado", "precio": 60000 }

### DELETE /productos/:id (PROTEGIDO - vendedor)

**Errores comunes:**
- 401: token inválido/ausente
- 403: solo vendedor
- 404: no encontrado
- 500: error interno/validación (ej: código nulo)

---

## Ejemplos cURL
### Login
curl -X POST http://54.242.30.23:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@mail.com","password":"1234"}'

### Productos
curl http://54.242.30.23:3000/productos

### Boletas (con token)
curl http://54.242.30.23:3000/boletas \
  -H "Authorization: Bearer <token>"
