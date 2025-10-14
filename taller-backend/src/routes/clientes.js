// src/routes/clientes.js
import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import pool from "../config.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { nombre_completo, documento, telefono, email, direccion } = req.body;

    if (!nombre_completo || !documento) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const result = await pool.query(
      `INSERT INTO Clientes (nombre_completo, documento, telefono, email, direccion)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre_completo, documento, telefono, email, direccion]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error registrando cliente:", err);
    res.status(500).json({ message: "Error registrando cliente" });
  }
});

export default router;
