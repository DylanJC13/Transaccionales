import express from "express";
import pool from "../config.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Crear cotización
router.post("/", authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const { id_diagnostico, productos, impuestos } = req.body;
    const id_usuario = req.user.id_usuario; // Se toma del token

    await client.query("BEGIN");

    const subtotal = productos.reduce((sum, p) => sum + p.precio_unitario * p.cantidad, 0);
    const total = subtotal + (impuestos || 0);

    const cotResult = await client.query(
      `INSERT INTO cotizaciones (id_diagnostico, id_usuario, subtotal, impuestos, total)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id_diagnostico, id_usuario, subtotal, impuestos, total]
    );

    const cotizacion = cotResult.rows[0];

    for (const prod of productos) {
      await client.query(
        `INSERT INTO detalle_cotizacion (id_cotizacion, id_producto, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          cotizacion.id_cotizacion,
          prod.id_producto,
          prod.cantidad,
          prod.precio_unitario,
          prod.precio_unitario * prod.cantidad
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({ message: "Cotización creada con éxito", cotizacion });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error creando cotización:", err);
    res.status(500).json({ error: "Error al crear cotización" });
  } finally {
    client.release();
  }
});

// Listar cotizaciones
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Vista_Cotizaciones_Completas");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error obteniendo cotizaciones:", err);
    res.status(500).json({ error: "Error al obtener cotizaciones" });
  }
});

export default router;
