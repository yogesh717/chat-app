import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String,  required: true },
    profileImage: {
      type: String,
      default: "",
  },
  
    otp: { type: String }, 
    otpExpires: { type: Date },
  },
  { timestamps: true }
);

// UserSchema.set("toJSON", {
//   transform: (doc, obj) => {
//     delete obj.password;
//     delete obj.__v;
//     return obj;
//   },
// });

// Hash Password Before Saving
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// Compare Password
// UserSchema.methods.authenticate = function (password) {
//   return bcrypt.compareSync(password, this.password);
// };

// Generate JWT Token
// UserSchema.methods.generateToken = function () {
//   return jwt.sign(
//     { _id: this._id, email: this.email },
//     process.env.JWT_SECRET || "default_secret",
//     { expiresIn: "7d" }
//   );
// };

const User = mongoose.model("User", UserSchema);
export default User;




// fullName: { type: String, required: true },
// username: { type: String, required: true,unique:true },
// password,profile,gender,