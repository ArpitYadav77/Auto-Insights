const jwt = require('jsonwebtoken');
const path = require('path');
const config = require('../config/env');

/**
 * Format a date object to a human-readable string.
 * @param {Date} date
 * @param {string} locale
 * @returns {string}
 */
const formatDate = (date, locale = 'en-US') => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generate a signed JWT token.
 * @param {Object} payload - Data to encode in the token (e.g. { id, role })
 * @returns {string} Signed JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });
};

/**
 * Sanitize a filename by removing dangerous characters.
 * @param {string} filename
 * @returns {string}
 */
const sanitizeFilename = (filename) => {
  if (!filename) return '';
  // Remove path traversal patterns and dangerous chars
  return filename
    .replace(/\.\./g, '')
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
};

/**
 * Get the file extension from a filename (lowercase, without dot).
 * @param {string} filename
 * @returns {string}
 */
const getFileExtension = (filename) => {
  if (!filename) return '';
  return path.extname(filename).toLowerCase().replace('.', '');
};

module.exports = {
  formatDate,
  generateToken,
  sanitizeFilename,
  getFileExtension,
};
