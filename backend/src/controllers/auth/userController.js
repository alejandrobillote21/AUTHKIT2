import asyncHandler from "express-async-handler";
import User from "../../models/auth/UserModel.js";
import generateToken from "../../helpers/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    //validation
    if (!name || !email || !password) {
        // 400 Bad Request
        res.status(400).json({ message: "All fields are required!" });
    }

    // Check password length
    if (password.length < 6) {
        return res
            .status(400)
            .json({ message: "Password must be at least 6 characters!" });
    }

    // check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        // Bad Request
        return res.status(400).json({ message: "User already exists!" });
    }

    // Create new user
    const user = await User.create({
        name,
        email,
        password,
    });

    // Generate token with User ID
    const token = generateToken(user._id);

    // Send back the user and token in the response to the client
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "none", // cross-site access --> allow all third-party cookies
      secure: true,
    });

    if (user) {
        const { _id, name, email, role, photo, bio, isVerified } = user;

        // 201 Created
        res.status(201).json({
            _id,
            name,
            email,
            role,
            photo,
            bio,
            isVerified,
            token,
        });
    } else {
        res.status(400).json({ message: "Invalid user data!" });
    }
});

// User login
export const loginUser = asyncHandler(async (req, res) => {
    // Get eamil and password from req.body
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        // 400 Bad Request
        return res.status(400).json({ message: "All fields are required!" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (!userExists) {
        return res.status(404).json({ message: "User not found, Sign Up!" });
    }

    // Check if the password match the hashed password in the Database
    const isMatch = await bcrypt.compare(password, userExists.password);

    if (!isMatch) {
        // 400 Bad Request
        return res.status(400).json({ message: "Invalid Credentials!" });
    }

    // Generate token with user ID
    const token = generateToken(userExists._id);

    if(userExists && isMatch) {
        const { _id, name, email, role, photo, bio, isVerified } = userExists;

        // Set the token in the Cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: 30 * 24 * 60 * 60 * 1000, // 30 days
            sameSite: true,
            secure: true,
        });

        // Send back the user and token in the response to the Client
        res.status(200).json({
            _id,
            name,
            email,
            role,
            photo,
            bio,
            isVerified,
            token,
        });
    } else{
        res.status(400).json({ message: "Invalid email or password!" });
    }
});

// Logout user
export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
    });

    res.status(200).json({ message: "Successfully logged out!" });
});
  

// Get User
export const getUser = asyncHandler(async (req, res) => {
    // Get User details from the token ----> Exclude password
    const user = await User.findById(req.user._id).select("-password");

    if (user) {
        res.status(200).json(user);
    } else {
        // 404 Not found
        res.status(404).json({ message: "User not found!" });
    }
});

    // Update User
    export const updateUser = asyncHandler(async (req, res) => {
        // Get User details from the token ---> Protect Middleware
        const user = await User.findById(req.user._id);

        if (user) {
            // User properties to update
            const { name, bio, photo } = req.body;
            // Update User properties
            user.name = req.body.name || user.name;
            user.bio = req.body.bio || user.bio;
            user.photo = req.body.photo || user.photo;

            const updated = await user.save();

        res.status(200).json({
            _id: updated._id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            photo: updated.photo,
            bio: updated.bio,
            isVerified: updated.isVerified,
            });
        } else {
            // 404 Not Found
            res.status(404).json({ message: "User not found!" });
        }
});