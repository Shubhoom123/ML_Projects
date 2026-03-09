const { validationResult, query, param } = require('express-validator');

// Validation error handler
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Invalid input parameters',
            details: errors.array() 
        });
    }
    next();
};

// Common validation rules
const paginationValidation = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a positive integer'),
    validate
];

const stateValidation = [
    query('state')
        .optional()
        .isIn(['open', 'closed', 'all'])
        .withMessage('State must be open, closed, or all'),
    validate
];

const daysValidation = [
    query('days')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Days must be between 1 and 365'),
    validate
];

const shaValidation = [
    param('sha')
        .isAlphanumeric()
        .isLength({ min: 7, max: 40 })
        .withMessage('Invalid SHA format'),
    validate
];

const numberValidation = [
    param('number')
        .isInt({ min: 1 })
        .withMessage('Invalid number parameter'),
    validate
];

module.exports = {
    paginationValidation,
    stateValidation,
    daysValidation,
    shaValidation,
    numberValidation
};
