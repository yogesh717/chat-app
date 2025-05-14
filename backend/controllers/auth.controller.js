import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); 

const JWT_SECRET = process.env.JWT_SECRET; 

//  Signup API
export const signup = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { firstName, lastName, email, password } = req.body;

  
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

   
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

  
    const user = new User({ firstName, lastName, email, password: hashedPassword });
    await user.save();

   
    const token = jwt.sign({ userEmail: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ message: "User registered successfully", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



//  Login API
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("req.body", req.body);
 
    const user = await User.findOne({ email });

    console.log("user", user);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ userEmail: user.email, userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    console.log("token", token);
    
    res.status(200).json({ 
      message: "Login successful", 
      token, 
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName }  
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

