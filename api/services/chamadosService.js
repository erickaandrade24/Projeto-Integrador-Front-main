const Chamado = require("../models/chamadoModel");

class ChamadoService {
  async createChamado(chamadoData) {
    const chamadoId = await Chamado.create(chamadoData);

    // Add to history
    await Chamado.addHistory({
      chamado_id: +chamadoId,
      usuario_id: +chamadoData.usuario_id,
      acao: "create",
      comentario: "Chamado criado",
      campo_alterado: null,
      valor_anterior: null,
      novo_valor: null,
    });

    return chamadoId;
  }

  async getAllChamados() {
    return await Chamado.findAll();
  }

  async getChamadoById(id) {
    return await Chamado.findById(id);
  }

  async getChamadosByStatus(status) {
    return await Chamado.findByStatus(status);
  }

  async updateChamado(id, chamadoData, usuarioId) {
    try {
      if (!id) throw new Error("ID do chamado é obrigatório");
      if (!usuarioId) throw new Error("ID do usuário é obrigatório");

      const oldChamado = await Chamado.findById(id);
      if (!oldChamado) throw new Error("Chamado não encontrado");

      const updateData = {
        titulo: chamadoData.titulo ?? oldChamado.titulo,
        descricao: chamadoData.descricao ?? oldChamado.descricao,
        prioridade: chamadoData.prioridade ?? oldChamado.prioridade,
        usuario_id: usuarioId,
        status: chamadoData.status ?? oldChamado.status,
        prazo: chamadoData.prazo ?? oldChamado.prazo,
        updated_at: new Date(),
      };

      await Chamado.update(id, updateData, oldChamado);

      const changes = [];
      const fieldsToCheck = ["titulo", "descricao", "prioridade"];

      fieldsToCheck.forEach((field) => {
        if (oldChamado[field] !== updateData[field]) {
          changes.push({
            campo: field,
            de: oldChamado[field],
            para: updateData[field],
          });
        }
      });

      await Promise.all(
        changes.map((change) =>
          Chamado.addHistory({
            chamado_id: id,
            usuario_id: usuarioId,
            acao: "update",
            campo_alterado: change.campo,
            valor_anterior: change.de,
            novo_valor: change.para,
            comentario: `Campo ${change.campo} alterado de "${change.de}" para "${change.para}"`,
          }),
        ),
      );

      return await Chamado.findById(id);
    } catch (error) {
      console.error("Error in updateChamado:", error);
      throw error;
    }
  }

  async updateChamadoStatus(id, newStatus, usuarioId) {
    const oldChamado = await Chamado.findById(id);
    await Chamado.update(id, { status: newStatus });

    await Chamado.addHistory({
      chamado_id: id,
      usuario_id: usuarioId,
      acao: "status_change",
      campo_alterado: "status",
      valor_anterior: oldChamado.status,
      novo_valor: newStatus,
      comentario: `Status alterado de "${oldChamado.status}" para "${newStatus}"`,
    });

    if (newStatus === "done") {
      await Chamado.update(id, {
        encerrado_em: new Date(),
        encerrado_por: usuarioId,
      });
    }
  }

  async deleteChamado(id) {
    return await Chamado.delete(id);
  }

  async getChamadoHistory(chamado_id) {
    return await Chamado.getHistory(chamado_id);
  }

  async getAllHistory(
    page,
    pageSize,
  ) {
    const result= await Chamado.getAllHistory(
      page,
      pageSize,
    );

    return result;
    
  }
}

module.exports = new ChamadoService();
