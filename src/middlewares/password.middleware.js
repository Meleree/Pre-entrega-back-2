import jwt from "jsonwebtoken";

export const verifyResetToken = (req, res, next) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token requerido" });

    try {
        const payload = jwt.verify(token, process.env.JWT_RESET_SECRET);
        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({ error: "Token inválido o expirado" });
    }
};
