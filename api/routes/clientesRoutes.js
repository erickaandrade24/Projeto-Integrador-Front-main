const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clientesController");

router.post("/", clienteController.create);
router.get("/", clienteController.getAll);
router.get("/:id", clienteController.getById);
router.put("/:id", clienteController.update);
router.delete("/:id", clienteController.delete);

module.exports = router;
