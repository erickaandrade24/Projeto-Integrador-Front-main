require("dotenv").config({ path: `${__dirname}/.env` });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const clientesRoutes = require("./routes/clientesRoutes");
const usuariosRoutes = require("./routes/usuariosRoutes");
const chamadosRoutes = require("./routes/chamadosRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/clientes", clientesRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/chamados", chamadosRoutes);
app.use("/api/auth", authRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
