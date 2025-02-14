import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/dotenv";
import { AuthLogModel } from "../models/auth";
import createError from "../utils/createError";

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
  isLocked: boolean;
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies instead of headers
    const token = req.cookies.Access_Token;

    if (!token) {
      return next(createError(401, "Access denied. No token provided"));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as Payload;

    // Find the most recent auth log for this token
    const lastAuthLog = await AuthLogModel.findOne({
      userID: decoded._id,
    }).sort({ timestamp: -1 });

    if (!lastAuthLog || lastAuthLog?.sessionID !== token) {
      res.clearCookie("Access_Token");
      return next(createError(401, "Session expired or invalidated"));
    }

    if (decoded.isLocked) {
      next(
        createError(
          401,
          "Your account has been locked. Please contact your administrator or try again later.",
        ),
      );
      return;
    }
    req.user = decoded;
    next();
  } catch (error) {
    next(createError(401, "Invalid token"));
  }
};

export default verifyToken;
