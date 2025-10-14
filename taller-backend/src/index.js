import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import clientesRoutes from "./routes/clientes.js";
import bicicletasRoutes from "./routes/bicicletas.js";
import diagnosticosRoutes from "./routes/diagnosticos.js";
import cotizacionesRoutes from "./routes/cotizaciones.js";
import productosRoutes from "./routes/productos.js";
import statsRoutes from "./routes/stats.js";


const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/auth", authRoutes);
app.use("/clientes", clientesRoutes);
app.use("/bicicletas", bicicletasRoutes);
app.use("/diagnosticos", diagnosticosRoutes);
app.use("/cotizaciones", cotizacionesRoutes);
app.use("/productos", productosRoutes);
app.use("/stats", statsRoutes);



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
