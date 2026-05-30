import { verifyJwt } from '../utils/jwt.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const headerUserId = req.headers['x-user-id'];
  const headerUserRole = req.headers['x-user-role'];

  if (token) {
    const payload = await verifyJwt(token);
    if (!payload) {
      return res.status(401).json({ success: false, error: 'Authentication required. Token invalid or expired.' });
    }
    req.user = payload;
    return next();
  }

  if (headerUserId && headerUserRole) {
    req.user = { id: headerUserId, role: headerUserRole };
    return next();
  }

  return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
}

export function requireRole(allowedRoles) {
  return async (req, res, next) => {
    await requireAuth(req, res, () => {
      if (!req.user) return;

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
        });
      }

      next();
    });
  };
}
