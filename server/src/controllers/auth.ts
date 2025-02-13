import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import createError from "../utils/createError";
import { JWT_SECRET, NODE_ENV } from "../config/dotenv";

class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { loginId, password } = req.body;

      if (!loginId || !password) {
        return next(createError(400, "Email and password are required"));
      }

      const user = await User.findOne({
        $or: [{ email: loginId }, { username: loginId }],
      });

      if (!user) {
        return next(createError(404, "Invalid user or password"));
      }

      // Compare hashed passwords
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return next(createError(401, "Invalid password"));
      }

      if (user.isLocked) {
        return next(createError(403, "Account is locked"));
      }

      const { password: _, ...safeUser } = user.toObject();

      const tokenPayload = {
        _id: safeUser._id,
        username: safeUser.username,
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: "24h",
        algorithm: "HS256",
      });

      // Store the new token as the active token
      await User.findByIdAndUpdate(user._id, { activeToken: token });

      const isProdution = NODE_ENV === "production";
      res.cookie("Access_Token", token, {
        httpOnly: true,
        secure: isProdution,
        sameSite: isProdution ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.status(200).json({
        success: true,
        data: safeUser,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Login failed",
        ),
      );
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Clear the active token in database
      await User.findByIdAndUpdate(req.user._id, { activeToken: null });

      const isProdution = NODE_ENV === "production";

      res.clearCookie("Access_Token", {
        httpOnly: true,
        secure: isProdution,
        sameSite: isProdution ? "none" : "lax",
        path: "/", // Added path to ensure cookie is cleared properly
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Logout failed",
        ),
      );
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(createError(500, "User not found in request"));
      }
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      return next(createError(500, "Internal server error"));
    }
  }
}

export default new AuthController();
