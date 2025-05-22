const Usuario = require("../models/usuarioModel");
const bcrypt = require("bcrypt");

class UsuarioService {
  async createUsuario(usuarioData) {
    return await Usuario.create(usuarioData);
  }

  async getAllUsuarios() {
    return await Usuario.findAll();
  }

  async getUsuarioById(id) {
    return await Usuario.findById(id);
  }

  async updateUsuario(id, usuarioData) {
    return await Usuario.update(id, usuarioData);
  }

  async deleteUsuario(id) {
    return await Usuario.delete(id);
  }

  async authenticate(email, password) {
    const usuario = await Usuario.findByEmail(email);
    if (!usuario) return null;

    const isValid = await bcrypt.compare(password, usuario.senha);
    if (!isValid) return null;

    // Removendo password do objeto de usuário antes de retornar, por questões de segurança é claro!!!
    const { senha, ...userWithoutPassword } = usuario;
    return userWithoutPassword;
  }
}

module.exports = new UsuarioService();
