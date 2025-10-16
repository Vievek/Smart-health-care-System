import jwt from "jsonwebtoken";
import { UserService } from "../services/UserService.js";
import { Request, Response, NextFunction } from "express";
import { IUser } from "@shared/healthcare-types";

// Extend the Express Request interface
export interface AuthRequest extends Request {
  user?: IUser & { _id?: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "Access denied. No token provided." });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userService = new UserService();
    const user = await userService.getById(decoded.id);

    if (!user) {
      res.status(401).json({ error: "Invalid token." });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Access denied. No user found." });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res
        .status(403)
        .json({ error: "Access denied. Insufficient permissions." });
      return;
    }

    next();
  };
};
