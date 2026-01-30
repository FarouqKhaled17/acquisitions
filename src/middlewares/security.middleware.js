import aj from '#config/arcjet';
import logger from '#config/logger';

export const secMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;
    let msg;

    switch (role) {
      case 'admin':
        limit = 20;
        msg = 'Admin req limit exceeded 20 per minute. Slow down';
        break;
      case 'user':
        limit = 10;
        msg = 'User req limit exceeded 10 per minute. Slow down';
        break;
      default:
        limit = 5;
        msg = 'Guest req limit exceeded 5 per minute. Slow down';
        break;
    }

    const client = aj.withRule('slidingWindow', {
      mode: 'LIVE',
      interval: 2,
      max: limit,
      name: `${role}-slidingWindow`,
    });

    const decision = await client.protect(req);

    // Bot check
    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn(`Bot detected: ${decision.reason}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        path: req.originalUrl
      });
      return res.status(403).json({ message: 'Access denied: Bot detected' });
    }

    // Rate limit check
    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn(`Rate limit exceeded for role ${role}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        path: req.originalUrl
      });
      return res.status(429).json({ message: msg });
    }

    // Shield / security check
    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn(`Security decision denied for role ${role}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        path: req.originalUrl
      });
      return res.status(403).json({ message: 'Access denied' });
    }

    next();

  } catch (error) {
    console.error('Security middleware error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
export default secMiddleware;
