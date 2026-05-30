import { randomUUID } from 'crypto';

/**
 * Correlation ID middleware.
 * Generates or propagates a correlation ID for distributed tracing.
 * Also logs each request in structured JSON format.
 */
export function correlationId(req, res, next) {
  req.correlationId = req.headers['x-correlation-id'] || randomUUID();
  res.setHeader('x-correlation-id', req.correlationId);

  // Structured JSON request logging
  console.log(JSON.stringify({
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  }));

  next();
}
