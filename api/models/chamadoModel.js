const pool = require("../config/database");

class Chamado {
  static async create(chamado) {
    const [result] = await pool.execute(
      `INSERT INTO chamados 
      (cliente_id, usuario_id, titulo, descricao, mensagem_cliente, prioridade, status, prazo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        chamado.cliente_id ,
        chamado.usuario_id,
        chamado.titulo,
        chamado.descricao,
        chamado.mensagem_cliente || null,
        chamado.prioridade,
        chamado.status,
        chamado.prazo || null,
      ],
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.query(`
      SELECT c.*, cl.nome as cliente_nome, u.nome as usuario_nome 
      FROM chamados c
      JOIN clientes cl ON c.cliente_id = cl.id
      JOIN usuarios u ON c.usuario_id = u.id
    `);
    return rows;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT * FROM usuarios WHERE email = ?`,
      [email],
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT c.*, cl.nome as cliente_nome, u.nome as usuario_nome 
      FROM chamados c
      JOIN clientes cl ON c.cliente_id = cl.id
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id = ?
    `,
      [id],
    );
    return rows[0];
  }

  static async findByStatus(status) {
    const [rows] = await pool.execute(
      `
      SELECT c.*, cl.nome as cliente_nome, u.nome as usuario_nome 
      FROM chamados c
      JOIN clientes cl ON c.cliente_id = cl.id
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.status = ?
    `,
      [status],
    );
    return rows;
  }

  static async update(id, chamado) {
    console.log("Chamado update", chamado);
    
    const [rows] = await pool.execute(`SELECT * FROM chamados WHERE id = ?`, [
      id,
    ]);

    const chamadoAntigo = rows[0];

    const camposParaAtualizar = {
      titulo: chamado.titulo || chamadoAntigo.titulo,
      descricao: chamado.descricao || chamadoAntigo.descricao,
      prioridade: chamado.prioridade || chamadoAntigo.prioridade,
      usuario_id: chamado.usuario_id || chamadoAntigo.usuario_id,
      status: chamado.status || chamadoAntigo.status,
      prazo: chamado.prazo || chamadoAntigo.prazo,
    }
    
    // Atualiza o chamado
    await pool.execute(
      `UPDATE chamados SET 
      titulo = COALESCE(?, titulo),
      descricao = COALESCE(?, descricao),
      prioridade = COALESCE(?, prioridade),
      usuario_id = COALESCE(?, usuario_id),
      status = COALESCE(?, status),
      prazo = COALESCE(?, prazo),
      updated_at = NOW()
    WHERE id = ?`,
      [
        camposParaAtualizar.titulo,
        camposParaAtualizar.descricao,
        camposParaAtualizar.prioridade,
        camposParaAtualizar.usuario_id,
        camposParaAtualizar.status,
        camposParaAtualizar.prazo,
        id,
      ],
    );
  }

  static async delete(id) {
    await pool.execute("DELETE FROM chamados WHERE id = ?", [id]);
  }

  static async addHistory(history) {
    await pool.execute(
      `INSERT INTO historico_chamados 
      (chamado_id, usuario_id, acao, campo_alterado, valor_anterior, novo_valor, comentario) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        history.chamado_id,
        history.usuario_id,
        history.acao,
        history.campo_alterado,
        history.valor_anterior,
        history.novo_valor,
        history.comentario,
      ],
    );
  }

  static async getHistory(chamado_id) {
    const [rows] = await pool.execute(
      `
      SELECT h.*, u.nome as usuario_nome 
      FROM historico_chamados h
      JOIN usuarios u ON h.usuario_id = u.id
      WHERE h.chamado_id = ?
      ORDER BY h.created_at DESC
    `,
      [chamado_id],
    );
    return rows;
  }

  static async getAllHistory(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    
    const [rows] = await pool.execute(
      `
      SELECT h.*, c.titulo as chamado_titulo, u.nome as usuario_nome 
      FROM historico_chamados h
      JOIN chamados c ON h.chamado_id = c.id
      JOIN usuarios u ON h.usuario_id = u.id
      ORDER BY h.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [ pageSize, offset]
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM historico_chamados`,
    );

    return {
      items: rows,
      totalItems: countResult[0].total,
      totalPages: Math.ceil(countResult[0].total / pageSize),
      currentPage: page,
      pageSize: pageSize
    };
  }
}

module.exports = Chamado;
