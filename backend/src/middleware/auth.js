/**
 * Mock Authentication Middleware
 * This middleware acts as a centralized "User Context" provider.
 * 
 * ERP BEST PRACTICE: By centralizing client_id and user_id here,
 * we avoid hardcoding them in controllers. When real JWT/Login 
 * is added, we only change this file.
 */
const authenticate = (req, res, next) => {
  // In a real application, these would be extracted from a JWT token
  // For now, we use the Test Corporation (Client ID: 1) and Test Admin (User ID: 1)
  req.user = {
    clientId: 1,
    userId: 1,
    name: 'Test Admin',
    role: 'Admin'
  };

  next();
};

module.exports = authenticate;
