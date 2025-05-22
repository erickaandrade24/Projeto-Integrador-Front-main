const Auth = require("../models/authModel");

class AuthService {
  async login(email, passwordUser) {
    const user = await Auth.findByEmail(email);
    if (!user) throw new Error("Usuário não encontrado");

    const isValidPassword = await Auth.comparePassword(
      passwordUser,
      user.senha,
    );
    if (!isValidPassword) throw new Error("Senha inválida");

    const token = await Auth.generateToken(user);

    if (!token) throw new Error("Erro ao gerar token");

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async register(userData) {
    const existingUser = await Auth.findByEmail(userData.email);
    if (existingUser) throw new Error("Email já cadastrado");

    const hashedPassword = await Auth.hashPassword(userData.password);
    const newUser = { ...userData, password: hashedPassword };

    return await Auth.create(newUser);
  }
}

module.exports = new AuthService();
