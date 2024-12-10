import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/UserModel.js";

export const protect = asyncHandler(async (req, res, next) => {
    try {
        // Check if User is Logged in
        const token = req.cookies.token;

        if (!token) {
            // 401 Unauthorized
            res.status(401).json({ message: "Not authorized, please login!" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get User details from the token -----> Exclude password
        const user = await User.findById(decoded.id).select("-password");

        // Check if User exists
        if(!user) {
            res.status(404).json({ message: "User not found!" });
        }

        // Set User details in the request object
        req.user = user;

        next();
      } catch (error) {
        // 401 Unauthorized
        res.status(401).json({ message: "Not authorized, token failed!" });
      }
});