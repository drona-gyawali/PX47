import { verifyToken } from '../helpers.js';

export const AuthMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(403).json({ success: false, message: 'Token missing' });
    }
    const verifiedToken = verifyToken(token);
    if (!verifiedToken) {
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized aceess' });
    }
    req.user = verifiedToken;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: `invalid or expired token : more details=${error}`,
    });
  }
};
