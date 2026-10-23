import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'tristar-fitness-jwt-secret-indore-2026';

/**
 * Middleware: Verifies Bearer JWT token if present.
 * Attaches decoded user payload to req.user.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded;
    }
    next();
  });
}

/**
 * Middleware: Strictly requires a valid authenticated user.
 */
export function requireAuth(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    next();
  });
}

/**
 * Middleware: Strictly requires an authenticated user with role === 'admin'.
 */
export function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required. Please log in as admin.' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
    }
    next();
  });
}
