import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Attach user ID to request (immutable — we don't modify token)
    req.user = { id: decoded.userId };

    next(); // Proceed to the actual route handler
  } catch (error) {
    // Handle specific JWT errors
    if ((error as any).name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Not authorized, invalid token' });
    } else if ((error as any).name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Not authorized, token expired' });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
};