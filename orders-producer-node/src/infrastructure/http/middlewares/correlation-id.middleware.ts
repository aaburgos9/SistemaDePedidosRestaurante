// import { Request, Response, NextFunction } from "express";
// import { v4 as uuidv4 } from "uuid";

/**
 * Middleware that attaches or propagates correlation ID for distributed tracing
 */
// export function correlationIdMiddleware(req: Request, _res: Response, next: NextFunction) {
//   const header = req.headers["x-correlation-id"] as string | undefined;
//   if (!header) {
//     (req.headers as any)["x-correlation-id"] = uuidv4();
//   }
//   next();
// }
