const { body } = require('express-validator');
const { ARTICLE_STATUS } = require('../config/constants');

const articleValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('status')
    .optional()
    .isIn(Object.values(ARTICLE_STATUS))
    .withMessage('Invalid status'),
  body('excerpt').optional().isLength({ max: 300 }),
];

const commentValidator = [
  body('content').trim().notEmpty().withMessage('Comment content is required'),
  body('article').notEmpty().withMessage('Article ID is required'),
  body('guestName').optional().trim(),
  body('guestEmail').optional().isEmail().withMessage('Valid email required'),
];

module.exports = { articleValidator, commentValidator };
