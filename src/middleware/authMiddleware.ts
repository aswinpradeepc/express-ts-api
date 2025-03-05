import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findOne({ 'tokens.token': token });

    if (!user) {
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }

    const tokenDoc = user.tokens.find(t => t.token === token);
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }
};