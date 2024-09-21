// middleware/validateMovie.js

const { body, validationResult } = require('express-validator');

const validateMovie = [
  body('imdbID')
    .notEmpty()
    .withMessage('imdbID is required')
    .isString()
    .withMessage('imdbID must be a string')
    .matches(/^tt\d{7,8}$/)
    .withMessage('imdbID must follow the format tt followed by 7 or 8 digits'),

  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('director')
    .optional()
    .isString()
    .withMessage('Director must be a string')
    .isLength({ max: 100 })
    .withMessage('Director cannot exceed 100 characters'),

  body('genre')
    .optional()
    .isString()
    .withMessage('Genre must be a string')
    .isLength({ max: 100 })
    .withMessage('Genre cannot exceed 100 characters'),

  body('releaseYear')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Release year must be a valid year'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Rating must be between 0 and 10'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

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

module.exports = validateMovie;
