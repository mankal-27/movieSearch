// middleware/validateRegister.js

const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  // Middleware to handle validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Extract error messages
      const extractedErrors = [];
      errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

      return res.status(400).json({
        errors: extractedErrors,
      });
    }
    next();
  },
];

module.exports = validateRegister;
