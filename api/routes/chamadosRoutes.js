const express = require("express");
const router = express.Router();
const dotenv = require('dotenv');
const path = require('path');
const chamadoController = require("../controllers/chamadosController");
const authMiddleware = require("../middlewares/authMiddleware");

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath }); 

router.use(authMiddleware);

router.post("/", chamadoController.create);
router.get("/", chamadoController.getAll);
router.get("/historicos", chamadoController.getAllHistory);
router.get("/status/:status", chamadoController.getByStatus);
router.get("/:id", chamadoController.getById);
router.get("/:id/historico", chamadoController.getHistory);
router.put("/:id", chamadoController.update);
router.patch("/:id/status", chamadoController.updateStatus);
router.delete("/:id", chamadoController.delete);

module.exports = router;
