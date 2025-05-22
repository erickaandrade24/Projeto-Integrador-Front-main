const chamadoService = require("../services/chamadosService");

class ChamadoController {
  async create(req, res) {
    try {
      const chamadoId = await chamadoService.createChamado({
        ...req.body,
        usuario_id: req.user.id,
      });
      res.status(201).json({ id: chamadoId });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const chamados = await chamadoService.getAllChamados();
      res.json(chamados);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const chamado = await chamadoService.getChamadoById(req.params.id);
      if (!chamado) {
        return res.status(404).json({ error: "Chamado não encontrado" });
      }
      res.json(chamado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getByStatus(req, res) {
    try {
      const chamados = await chamadoService.getChamadosByStatus(
        req.params.status,
      );
      res.json(chamados);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedChamado = await chamadoService.updateChamado(
        +req.params.id,
        req.body,
        req.user.id,
      );

      res.json(updatedChamado);
    } catch (error) {
      console.error("Update error:", error);
      res.status(400).json({
        error: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }

  async updateStatus(req, res) {
    try {
      await chamadoService.updateChamadoStatus(
        +req.params.id,
        req.body.status,
        req.user.id,
      );
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await chamadoService.deleteChamado(req.params.id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getHistory(req, res) {
    try {
      const history = await chamadoService.getChamadoHistory(req.params.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllHistory(req, res) {
    try {
      
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pageSize);

      const history = await chamadoService.getAllHistory(page, pageSize);

      res.json({
        items: history,
        totalItems: history.totalItems,
        totalPages: history.totalPages,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}


module.exports = new ChamadoController();
