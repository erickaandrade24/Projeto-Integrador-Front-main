const AuthService = require("../services/authService");

class authController {
  constructor() {
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.login(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      return res
        .status(200)
        .json({
          message: "Login successful",
          token: user.token,
          user: {
            id: user.user.id,
            name: user.user.name,
            email: user.user.email,
          },
        });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      const newUser = await AuthService.register({ name, email, password });
      return res
        .status(201)
        .json({ message: "User registered successfully", user: newUser });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new authController();
