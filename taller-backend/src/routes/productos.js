import express from "express";
import pool from "../config.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// 👉 Listar productos
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM productos WHERE activo = true ORDER BY nombre_producto ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error obteniendo productos:", err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// 👉 Crear producto
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { codigo_producto, nombre_producto, descripcion, precio_unitario, stock, categoria } = req.body;

    const result = await pool.query(
      `INSERT INTO productos (codigo_producto, nombre_producto, descripcion, precio_unitario, stock, categoria, activo)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [codigo_producto, nombre_producto, descripcion, precio_unitario, stock, categoria]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creando producto:", err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

export default router;
