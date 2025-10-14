import express from "express";
import pool from "../config.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Crear diagnóstico
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { id_bicicleta, fallas_identificadas, recomendaciones } = req.body;

    // Tomamos el id_usuario del token, no del body
    const userId = req.user.id_usuario;

    const result = await pool.query(
      `INSERT INTO diagnosticos (id_bicicleta, id_usuario, fallas_identificadas, recomendaciones)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id_bicicleta, userId, fallas_identificadas, recomendaciones]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error registrando diagnóstico:", err);
    res.status(500).json({ error: "Error al registrar diagnóstico" });
  }
});

// Listar diagnósticos completos
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Vista_Diagnosticos_Completos");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error obteniendo diagnósticos:", err);
    res.status(500).json({ error: "Error al obtener diagnósticos" });
  }
});

export default router;
