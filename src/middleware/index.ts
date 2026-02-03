import { errorResponse } from "../response.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../types.js";


interface AuthJwtPayload extends JwtPayload {
  userId: string;
  role: string;
  email: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthJwtPayload;
}

const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json(errorResponse("UNAUTHORIZED"));
      return;
    }
    console.log("Auth Header after check:", authHeader);

    const token = authHeader.split(" ")[1] as string;
    console.log("JWT Token:", token);    

    const decoded = jwt.verify(token, JWT_SECRET) as AuthJwtPayload;
    console.log("Decoded JWT:", decoded);
    req.user = decoded;
    next();
  } catch (error:any) {
    console.log(error)
    res.status(401).json(errorResponse("UNAUTHORIZED"));
  }
};

export default authMiddleware;
