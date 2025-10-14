import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config.js";

const router = express.Router();

// Registrar usuario
router.post("/register", async (req, res) => {
  try {
    const { nombre_usuario, password, nombre_completo, email, telefono } = req.body;

    // Encriptar password
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO Usuarios (nombre_usuario, password_hash, nombre_completo, email, telefono)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nombre_usuario, nombre_completo, email, activo`,
      [nombre_usuario, hash, nombre_completo, email, telefono]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error en /auth/register:", err);
    res.status(500).json({ error: "Error en servidor", detalle: err.message });
  }
});

// Login usuario
router.post("/login", async (req, res) => {
  try {
    const { nombre_usuario, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM Usuarios WHERE nombre_usuario = $1 AND activo = true",
      [nombre_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado o inactivo" });
    }

    const user = result.rows[0];
    const validPass = await bcrypt.compare(password, user.password_hash);

    if (!validPass) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Buscar el rol del usuario
    const rolResult = await pool.query(
      `SELECT r.nombre_rol 
       FROM Usuario_Rol ur
       JOIN Roles r ON ur.id_rol = r.id_rol
       WHERE ur.id_usuario = $1
       LIMIT 1`,
      [user.id_usuario]
    );

    let rol = "Pendiente asignación";
    if (rolResult.rows.length > 0) {
      rol = rolResult.rows[0].nombre_rol;
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id_usuario: user.id_usuario, 
        nombre_usuario: user.nombre_usuario, 
        rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Actualizar último acceso
    await pool.query(
      "UPDATE Usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id_usuario = $1",
      [user.id_usuario]
    );

    res.json({ token, usuario: { id: user.id_usuario, nombre: user.nombre_completo, rol } });
  } catch (err) {
    console.error("❌ Error en /auth/login:", err);
    res.status(500).json({ error: "Error en servidor", detalle: err.message });
  }
});


export default router;
