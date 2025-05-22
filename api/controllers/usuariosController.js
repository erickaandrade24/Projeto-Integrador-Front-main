const usuarioService = require("../services/usuariosService");

class UsuarioController {
  async create(req, res) {
    try {
      const usuario = await usuarioService.createUsuario(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const usuarios = await usuarioService.getAllUsuarios();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const usuario = await usuarioService.getUsuarioById(req.params.id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      await usuarioService.updateUsuario(req.params.id, req.body);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await usuarioService.deleteUsuario(req.params.id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, senha } = req.body;
      const usuario = await usuarioService.authenticate(email, senha);

      if (!usuario) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UsuarioController();
