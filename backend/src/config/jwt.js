const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token tidak valid atau sudah expired');
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};
