import { NextResponse } from 'next/server';

/**
 * Extract user info from custom request headers.
 * The frontend sends x-user-id and x-user-role headers with each authenticated request.
 */
export function getUserFromRequest(request) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  if (!userId || !userRole) {
    return null;
  }

  return { id: userId, role: userRole };
}

/**
 * Check if the request user has one of the allowed roles.
 * Returns null if authorized, or a NextResponse error if not.
 */
export function requireRole(request, allowedRoles) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required. Please log in.' },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: `Access denied. Required role: ${allowedRoles.join(' or ')}` },
      { status: 403 }
    );
  }

  return null; // Authorized
}

/**
 * Require any authenticated user (any role).
 * Returns null if authenticated, or a NextResponse error if not.
 */
export function requireAuth(request) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required. Please log in.' },
      { status: 401 }
    );
  }

  return null; // Authenticated
}
