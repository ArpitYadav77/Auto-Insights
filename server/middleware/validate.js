const { validationResult } = require('express-validator');

/**
 * Validation middleware factory.
 * Takes an array of express-validator validation rules and returns
 * a middleware chain that runs validations then checks for errors.
 *
 * Usage:
 *   const { body } = require('express-validator');
 *   router.post('/register', validate([
 *     body('email').isEmail(),
 *     body('password').isLength({ min: 6 }),
 *   ]), controller.register);
 *
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} Express middleware
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check results
    const result = validationResult(req);

    if (result.isEmpty()) {
      return next();
    }

    // Format errors
    const formattedErrors = result.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  };
};

module.exports = validate;
