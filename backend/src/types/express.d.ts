

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    visitorId?: string;
    sessionId?: string;
  }
}

export { };
