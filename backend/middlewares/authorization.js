import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/userModel.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized - No access token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Unauthorized - Access token expired" });
      }
      return res.status(403).json({ message: "Unauthorized - Invalid token" });
    }

    if (!decoded || !decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      res.clearCookie('accessToken');
      return res.status(401).json({ message: "Unauthorized - Invalid user identifier" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.clearCookie('accessToken');
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Error in protectedRoute middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const adminRoute = async (req, res, next) => {
  try {
    const user = req.user; // ✅ user is already attached by protectedRoute middleware

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden - Admin access required" });
    }

    next(); // ✅ proceed to next middleware/route if user is admin

  } catch (error) {
    console.error("Error in adminRoute middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}