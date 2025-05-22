const pool = require("../config/database");

class Cliente {
  static async create(cliente) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [clienteResult] = await connection.execute(
        "INSERT INTO clientes (nome, email, empresa, telefone) VALUES (?, ?, ?, ?)",
        [cliente.nome, cliente.email, cliente.empresa, cliente.telefone],
      );
      const clienteId = clienteResult.insertId;

      const [chamadoResult] = await connection.execute(
        `INSERT INTO chamados 
       (cliente_id, usuario_id, titulo, descricao, mensagem_cliente, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
        [
          clienteId,
          1,
          `Novo chamado para ${cliente.nome}`,
          cliente.descricao || "Descrição não fornecida",
          cliente.mensagem || "Mensagem não fornecida",
          "open",
        ],
      );

      await connection.commit();
      return {
        clienteId,
        chamadoId: chamadoResult.insertId,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    const [rows] = await pool.query(
      "SELECT * FROM clientes WHERE ativo = TRUE",
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM clientes WHERE id = ? AND ativo = TRUE",
      [id],
    );
    return rows[0];
  }

  static async update(id, cliente) {
    await pool.execute(
      "UPDATE clientes SET nome = ?, email = ?, empresa = ?, telefone = ? WHERE id = ?",
      [cliente.nome, cliente.email, cliente.empresa, cliente.telefone, id],
    );
  }

  static async delete(id) {
    await pool.execute("UPDATE clientes SET ativo = FALSE WHERE id = ?", [id]);
  }
}

module.exports = Cliente;
