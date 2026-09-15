import  jwt  from "jsonwebtoken";
import User from "../models/user.js";


const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("isActive");
    if (!user || !user.isActive) {
      return res.status(403).json({ message: "Account is deactivated or no longer exists" });
    }

    req.id = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default isAuthenticated;
