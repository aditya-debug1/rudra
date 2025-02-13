import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import createError from "../utils/createError";
import { JWT_SECRET } from "../config/dotenv";
import User, { UserAccount } from "../models/user";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

interface Payload {
  _id: string;
  username: string;
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies instead of headers
    const token = req.cookies.Access_Token;

    if (!token) {
      return next(createError(401, "Access denied. No token provided"));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as Payload;

    // Find user and check if token matches active token
    const user = await User.findById(decoded._id)
      .select("-password") // Exclude sensitive fields
      .lean();

    if (!user || user.activeToken !== token) {
      res.clearCookie("Access_Token");
      return next(createError(401, "Session expired or invalidated"));
    }

    if (user.isLocked) {
      next(
        createError(
          401,
          "Your account has been locked. Please contact your administrator or try again later.",
        ),
      );
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    next(createError(401, "Invalid token"));
  }
};

export default verifyToken;
