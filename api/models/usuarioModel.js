const pool = require("../config/database");
const bcrypt = require("bcrypt");

class Usuario {
  static async create(usuario) {
    const hashedPassword = await bcrypt.hash(usuario.senha, 10);
    const [result] = await pool.execute(
      "INSERT INTO usuarios (nome, email, telefone, senha, perfil) VALUES (?, ?, ?, ?, ?)",
      [
        usuario.nome,
        usuario.email,
        usuario.telefone,
        hashedPassword,
        usuario.perfil,
      ],
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.query(
      "SELECT id, nome, email, telefone, perfil, created_at FROM usuarios WHERE ativo = TRUE",
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT id, nome, email, telefone, perfil, created_at FROM usuarios WHERE id = ? AND ativo = TRUE",
      [id],
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
    );
    return rows[0];
  }

  static async update(id, usuario) {
    let query =
      "UPDATE usuarios SET nome = ?, email = ?, telefone = ?, perfil = ?";
    const params = [
      usuario.nome,
      usuario.email,
      usuario.telefone,
      usuario.perfil,
    ];

    if (usuario.senha) {
      const hashedPassword = await bcrypt.hash(usuario.senha, 10);
      query += ", senha = ?";
      params.push(hashedPassword);
    }

    query += " WHERE id = ?";
    params.push(id);

    await pool.execute(query, params);
  }

  static async delete(id) {
    await pool.execute("UPDATE usuarios SET ativo = FALSE WHERE id = ?", [id]);
  }
}

module.exports = Usuario;
