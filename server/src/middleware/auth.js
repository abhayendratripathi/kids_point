const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'kidpoints_secret_2024';

module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(header.slice(7), SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
