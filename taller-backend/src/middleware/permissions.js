import pool from "../config.js";

export const authorize = (permisoNecesario) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        "SELECT tiene_permiso($1, $2) AS permitido",
        [userId, permisoNecesario]
      );

      if (req.user.rol === "Administrador") {
        return next(); // Acceso total
      }

      next();
    } catch (err) {
      console.error("Error en autorización:", err);
      res.status(500).json({ message: "Error validando permisos" });
    }
  };
};
