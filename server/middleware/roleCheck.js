/**
 * Role-based access control middleware factory.
 * Usage: roleCheck('admin', 'user')
 *
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const roleCheck = (...roles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Check if user's role is in the allowed list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

module.exports = roleCheck;
