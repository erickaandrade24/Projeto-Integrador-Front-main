const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

class Auth {
  static async create(user) {
    const hashedPassword = await this.hashPassword(user.senha);

    const [existingUser] = await pool.execute(
      `SELECT * FROM usuarios WHERE email = ?`,
      [user.email],
    );

    if (existingUser.length > 0) {
      throw new Error("Email já cadastrado");
    }

    const [result] = await pool.execute(
      `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`,
      [user.nome, user.email, hashedPassword],
    );

    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT * FROM usuarios WHERE email = ?`,
      [email],
    );

    return rows[0];
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async generateToken(user) {
    const secretKey = process.env.JWT_SECRET || "default_secret_key";

    if (!secretKey) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        nome: user.nome,
      },
      secretKey,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        algorithm: "HS256",
      },
    );

    return token;
  }

  static async verifyToken(token) {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error("JWT_SECRET is not configured");
    }

    try {
      return jwt.verify(token, secretKey);
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return null;
    }
  }
}

module.exports = Auth;
