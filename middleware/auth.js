// // Custom middleware for authentication and authorization
// function isAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     // If the user is authenticated, continue to the next middleware/route handler
//     return next();
//   }
//   // If not authenticated, redirect to the login page or send an error message
//   res.redirect("/login"); // You can customize the redirection URL
// }



// // Another example: Protecting routes by role
// function isAuthorized(role) {
//   return (req, res, next) => {
//     if (req.isAuthenticated() && req.user.role === role) {
//       return next();
//     }
//     // If not authorized, redirect or send an error message
//     res.redirect("/unauthorized"); // Customize the URL or error message
//   };
// }

// module.exports={
//     isAuthenticated,
//     isAuthorized
// }







/**
 * Authentication and Authorization Middleware
 * Provides secure route protection with role-based access control
 */

/**
 * Checks if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function isAuthenticated(req, res, next) {
  // Check authentication status
  if (req.isAuthenticated()) {
    // Add security headers for authenticated routes
    res.set({
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });
    return next();
  }

  // Store original URL for redirect after login
  req.session.returnTo = req.originalUrl;
  
  // Set flash message and redirect
  req.flash('error', 'Please log in to access this page');
  return res.redirect('/login');
}

/**
 * Role-based authorization middleware factory
 * @param {String|Array} allowedRoles - Single role or array of permitted roles
 * @returns {Function} Middleware function for specific role authorization
 */
function isAuthorized(allowedRoles) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl;
      req.flash('error', 'Please log in first');
      return res.redirect('/login');
    }

    // Convert single role to array for uniform handling
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Check if user has any of the required roles
    if (roles.includes(req.user.role)) {
      return next();
    }

    // Log unauthorized access attempts
    console.warn(`Unauthorized access attempt by ${req.user.ID} (${req.user.role}) to ${req.originalUrl}`);
    
    // Respond based on request type
    if (req.accepts('html')) {
      req.flash('error', 'You are not authorized to access this resource');
      return res.redirect('/unauthorized');
    }
    
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Insufficient privileges'
    });
  };
}

/**
 * Higher-order middleware for specific role checks
 */
const isStudent = isAuthorized('student');
const isSupervisor = isAuthorized('supervisor');
const isHOD = isAuthorized('HOD');
const isAdmin = isAuthorized('admin');

module.exports = {
  isAuthenticated,
  isAuthorized,
  isStudent,
  isSupervisor,
  isHOD,
  isAdmin
};