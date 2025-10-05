// Middleware de autorización basado en roles
export const authorize = (roles = []) => {
    // roles puede ser un string o un array
    if (typeof roles === 'string') {
      roles = [roles];
    }
  
    return (req, res, next) => {
      const user = req.user; // req.user debe venir de passport "jwt" o de verifyToken
  
      if (!user) {
        return res.status(401).json({ message: 'No autenticado' });
      }
  
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'No autorizado' });
      }
  
      next();
    };
  };
  