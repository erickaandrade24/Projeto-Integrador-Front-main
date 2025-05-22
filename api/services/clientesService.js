const Cliente = require("../models/clienteModel");
const Chamado = require("../models/chamadoModel");

class ClienteService {
  async createCliente(clienteData) {
    try {
      if (!clienteData.mensagem) {
        throw new Error("Mensagem do chamado é obrigatória");
      }

      const result = await Cliente.create(clienteData);

      await Chamado.addHistory({
        chamado_id: result.chamadoId,
        usuario_id: 1,
        acao: "create",
        comentario: "Chamado criado automaticamente com novo cliente",
        campo_alterado: null,
        valor_anterior: null,
        novo_valor: null,
      });

      return result;
    } catch (error) {
      console.error("Error creating cliente and chamado:", error);
      throw new Error(`Falha ao criar cliente e chamado: ${error.message}`);
    }
  }

  async getAllClientes() {
    return await Cliente.findAll();
  }

  async getClienteById(id) {
    return await Cliente.findById(id);
  }

  async updateCliente(id, clienteData) {
    return await Cliente.update(id, clienteData);
  }

  async deleteCliente(id) {
    return await Cliente.delete(id);
  }
}

module.exports = new ClienteService();
