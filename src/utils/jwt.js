import jwt from 'jsonwebtoken';
import logger from '#/config/logger';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const EXPIRES_IN = '1h';

export const jwtTKN = {
  sign(payload) {
    try {
      return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
    }
    catch (err) {
      logger.error('Error signing JWT:', err);
      throw err;
    }
  },
  verify(token) {
    try {
      return jwt.verify(token, SECRET_KEY);
    }
    catch (err) {
      logger.error('Error verifying JWT:', err);
      throw err;
    }
  }
};


