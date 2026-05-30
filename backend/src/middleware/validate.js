import { validationResult } from 'express-validator';

/**
 * Validation middleware factory.
 * Accepts an array of express-validator validation rules,
 * runs them against the request, and returns structured 400 errors
 * if validation fails.
 *
 * @param {import('express-validator').ValidationChain[]} validations
 * @returns {import('express').RequestHandler}
 */
export function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array(),
      });
    }

    next();
  };
}
