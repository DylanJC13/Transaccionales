import express from "express";
import pool from "../config.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const [bicicletas, clientes, cotizaciones] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM bicicletas"),
      pool.query("SELECT COUNT(*) AS total FROM clientes"),
      pool.query("SELECT COUNT(*) AS total FROM cotizaciones"),
    ]);

    res.json({
      bicicletas: parseInt(bicicletas.rows[0].total, 10),
      clientes: parseInt(clientes.rows[0].total, 10),
      cotizaciones: parseInt(cotizaciones.rows[0].total, 10),
    });
  } catch (err) {
    console.error("❌ Error obteniendo estadísticas:", err);
    res.status(500).json({ message: "Error obteniendo estadísticas" });
  }
});

export default router;

