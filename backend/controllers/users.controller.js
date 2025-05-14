

import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

//  Signup API


export const signup = async (req, res) => {
    try {
        console.log("Received req.body:", req.body);

        const { fullName, userName, email, password, confirmPassword, profileImage, gender } = req.body;

        // Validate required fields
        if (!confirmPassword) {
            return res.status(400).json({ message: "Confirm Password is required." });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Gender-based default profile image
        let defaultProfileImage;
        if (gender === "male") {
            defaultProfileImage = `https://avatar.iran.liara.run/public/boy?username=${email}`;
        } else if (gender === "female") {
            defaultProfileImage = `https://avatar.iran.liara.run/public/girl?username=${email}`;
        } else {
            defaultProfileImage = `https://avatar.iran.liara.run/public/random?username=${email}`;
        }

        const user = new User({
            fullName,
            userName,
            email,
            password: hashedPassword,
            gender,
            profileImage: defaultProfileImage
        });



        // const profileImageUrl = req.file ? req.file.path : profileImage || defaultProfileImage;

        // const user = new User({
        //     fullName,
        //     userName,
        //     email,
        //     password,
        //     gender,
        //     profileImage: profileImageUrl
        // });

        await user.save();

        const token = jwt.sign({ userEmail: user.email }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            message: "User registered successfully",
            success: true,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};




export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password (User not found)" });
        }

        console.log(`🔹 Entered Password: ${password}`);
        console.log(`🔹 Stored Password: ${user.password}`);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`🔹 Password Match: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password (Wrong password)" });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

        res.status(200)
            .cookie("token", token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' })
            .json({
                message: "Login successful",
                token: token,
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    userName: user.userName,
                    gender: user.gender
                }
            });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



export const logout = async (req, res) => {
    try {
        res.status(200).cookie("token", "", { maxAge: 0, httpOnly: true }).json({
            message: "Logout successful"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};



export const fetchAll = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(otherUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};




export const updateProfile = async (req, res) => {
    const userId = req.params.id;
    console.log("User ID:", req.params.id);

    const { fullName, userName, email, gender } = req.body;
    console.log("REQ BODY:", req.body);
   
    try {
        let updatedData = { fullName, userName, email, gender };

        // Profile image agar upload hui ho to usko update karein
        if (req.file) {
            updatedData.profileImage = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }
        
        console.log("REQ FILE:", req.file);
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Error updating profile", error });
    }
};



export const changePassword = async (req, res) => {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect old password" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error changing password", error });
    }
};







// Send OTP
export const checkCredentials = async (req, res) => {
    try {
        console.log("checkCredentials",req.body);
        const { email } = req.body;
        const user = await User.findOne({ email });
       

        if (!user) {
            return res.status(404).json({ isSuccess: false, message: "User not found" });
        }

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000);
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
       

        await user.save();

        // TODO: Send OTP via email service (Nodemailer, Twilio, etc.)
        console.log(`OTP for ${email}: ${otp}`);

        return res.status(200).json({ isSuccess: true, message: "OTP sent to email" });

    } catch (error) {
        console.error("Error in checkCredentials:", error);
        return res.status(500).json({ isSuccess: false, message: "Internal Server Error" });
    }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        console.log("verifyOtp user:", user);

        if (!user) {
            return res.status(404).json({ isSuccess: false, message: "User not found" });
        }

        if (!user.otp || String(user.otp) !== String(otp) || user.otpExpires < Date.now()) {
            return res.status(400).json({ isSuccess: false, message: "Invalid or expired OTP" });
        }

        // Clear OTP after successful verification
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        return res.status(200).json({ isSuccess: true, message: "OTP verified successfully" });

    } catch (error) {
        console.error("Error in verifyOtp:", error);
        return res.status(500).json({ isSuccess: false, message: "Internal Server Error" });
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ isSuccess: false, message: "User not found" });
        }

        // 🛑 Always hash the new password before saving
        user.password = await bcrypt.hash(newPassword, 10);

        // Clear OTP fields
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        return res.status(200).json({ isSuccess: true, message: "Password reset successfully" });

    } catch (error) {
        console.error("Error in resetPassword:", error);
        return res.status(500).json({ isSuccess: false, message: "Internal Server Error" });
    }
};











































// const BaseController = require('./base.controller');

// const randomize = require('randomatic');
// const fs = require('fs-extra');

// const util = require('util');
// require('util.promisify').shim();
// const removeFile = util.promisify(fs.unlink);
// const {
// 	sendRegisterUserDetails
// } = require('../shared/send-mail');

// const User = require('../models/user');

// class UsersController extends BaseController {
// 	whitelist = [
// 		'password',
// 		'sergeonName',
// 		'lastName',
// 		'clinic',
// 		'type',
// 		'email',
// 		'jobTitle',
// 	];

// 	whitelisttype = [
// 		'manager',
// 		'admin'
// 	]

// 	_populate = async (req, res, next) => {
// 		if (req.params.id && req.params.id != 'newuser') {
// 			const {
// 				id,
// 			} = req.params;

// 			try {
// 				const user = await
// 					User.findById(id).exec();

// 				if (!user) {
// 					const err = new Error('User not found.');
// 					err.status = 404;
// 					return next(err);
// 				}
// 				req.user = user;
// 				next();
// 			} catch (err) {
// 				console.log(err);
// 				next(err);
// 			}
// 		} else {
// 			next();
// 		}
// 	}

// 	search = async (req, res, next) => {
// 		let filter = {};
// 		let sort = {};

// 		if (req.query.sort && req.query.key) {
// 			sort = {
// 				[req.query.key]: [req.query.sort],
// 			};
// 		}

// 		if (req.query.filter) {
// 			filter['$or'] = [];
// 			filter['$or'].push({
// 				'sergeonName': {
// 					'$regex': req.query.filter,
// 					'$options': 'i',
// 				},
// 			});
// 			filter['$or'].push({
// 				'clinic': {
// 					'$regex': req.query.filter,
// 					'$options': 'i',
// 				},
// 			});
// 		}

// 		try {

// 			const [results, itemCount] = await Promise.all([
// 				User.find(filter).sort(sort).limit(req.query.limit).skip(req.skip).exec(),
// 				User.countDocuments(filter),
// 			]);

// 			const pageCount = Math.ceil(itemCount / req.query.limit);

// 			res.json({
// 				object: 'list',
// 				page: {
// 					...req.query,
// 					totalPages: pageCount,
// 					totalElements: itemCount,
// 				},
// 				data: results,
// 				isSuccess: true,
// 			});

// 		} catch (err) {
// 			next(err);
// 		}
// 	}

// 	fetch = async (req, res) => {
// 		const user = req.user || req.currentEmployee;

// 		if (!user) {
// 			return res.sendStatus(404);
// 		}

// 		res.json(user);
// 	}

// 	create = async (req, res, next) => {
// 		try {
// 			const filter = req.body;

// 			if (!filter.type) {
// 				filter.type = 'manager';
// 			}

// 			if (!filter.password) {
// 				filter.password = "BVI2024!"
// 			}


// 			const params = this.filterParams(filter, this.whitelist);
// 			let newUser = new User({
// 				...params,
// 				password: filter.password,
// 				type: filter.type,
// 				provider: 'local'
// 			});
// 			// console.log('newUser==>', newUser)
// 			let savedUser = await newUser.save();
// 			// console.log('savedUser==>', savedUser)
// 			sendRegisterUserDetails(savedUser)


// 			res.status(201)
// 				.json(await savedUser.save());
// 		} catch (err) {
// 			if (err)
// 				err.status = 400;
// 			next(err);
// 		}
// 	}

// 	update = async (req, res, next) => {
// 		let user = req.body;
// 		let updatedUser = Object.assign(req.user, user);
// 		try {
// 			res.status(200).json(await updatedUser.save());
// 		} catch (err) {
// 			next(err);
// 		}
// 	}

// 	delete = async (req, res, next) => {
// 		if (!req.user) {
// 			return res.sendStatus(403);
// 		}
// 		try {
// 			await req.user.remove();
// 			res.json({
// 				isSuccess: true,
// 			});
// 		} catch (err) {
// 			next(err);
// 		}
// 	}



// }
// module.exports = new UsersController();
