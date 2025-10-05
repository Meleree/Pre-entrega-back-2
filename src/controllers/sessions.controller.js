import AuthService from "../services/auth.service.js";

class SessionsController {
    constructor() {
        this.authService = new AuthService();
    }

    // Registro
    register = async (req, res) => {
        try {
            const user = await this.authService.register(req.body);
            res.status(201).json({ success: true, user });
        } catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    };

    // Login
    login = async (req, res) => {
        try {
            const { user, token } = await this.authService.login(req.body);
            res.json({ success: true, user, token });
        } catch (err) {
            res.status(401).json({ success: false, message: err.message });
        }
    };

    // Logout
    logout = async (req, res) => {
        try {
            await this.authService.logout(req.user);
            res.json({ success: true, message: "Sesión cerrada correctamente" });
        } catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    };
}

export default new SessionsController();
