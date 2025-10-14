import express from "express";
import pool from "../config.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Crear bicicleta
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { numero_chasis, marca, modelo, color, tipo, anio, id_cliente } = req.body;

    const result = await pool.query(
      `INSERT INTO bicicletas (numero_chasis, marca, modelo, color, tipo, anio, id_cliente)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [numero_chasis, marca, modelo, color, tipo, anio, id_cliente]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error registrando bicicleta:", err);
    res.status(500).json({ error: "Error al registrar bicicleta" });
  }
});

// Listar bicicletas
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, c.nombre_completo AS cliente
       FROM bicicletas b
       JOIN clientes c ON b.id_cliente = c.id_cliente`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error obteniendo bicicletas:", err);
    res.status(500).json({ error: "Error al obtener bicicletas" });
  }
});

export default router;
