import type { Request, Response, NextFunction } from 'express';

export const identifyUser = (req: Request, _res: Response, next: NextFunction) => {
  const userId = req.header('x-user-id') || req.header('x-sub');
  req.userId = userId || undefined;
  next();
};
