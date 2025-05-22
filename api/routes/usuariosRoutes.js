const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuariosController");

router.post("/", usuarioController.create);
router.post("/login", usuarioController.login);
router.get("/", usuarioController.getAll);
router.get("/:id", usuarioController.getById);
router.put("/:id", usuarioController.update);
router.delete("/:id", usuarioController.delete);

module.exports = router;
