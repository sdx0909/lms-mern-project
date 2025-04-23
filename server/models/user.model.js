// accessing the Schema and model from mongoose
import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import crypto from "crypto";

config();

// dafining the user-structure
const userSchema = new Schema(
  {
    // configuring the user-data
    fullName: {
      type: String,
      required: [true, "Name is required"],
      minLength: [3, "Name must be at-least 3 character"],
      maxLength: [50, "Name must be at-most 50 character"],
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please fill a valid email address",
      ], // Matches email against regex]
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [8, "password must be 8 characters"],
      Select: false,
    },
    avatar: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

// for encrypting the user-password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // password is modified
  this.password = await bcrypt.hash(this.password, 10);
});

// generic-methods for jwtTokens
userSchema.methods = {
  generateJWTToken: async function () {
    return await jwt.sign(
      {
        id: this._id,
        email: this.email,
        subscription: this.subscription,
        role: this.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
  },
  // comparing the encrypted-password
  comparePassword: async function (plainTextPassword) {
    return await bcrypt.compare(plainTextPassword, this.password);
  },
  // generatePasswordReserToken
  generatePasswordResetToken: async function () {
    // creating the random token
    const resetToken = await crypto.randomBytes(20).toString("hex");

    // storing token and expiry into database
    // this.forgotPasswordToken = resetToken;

    // storing with encrypted-token
    this.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15min from now

    // finally return the token
    return resetToken;
  },
};

// creating the userSchema-model
const User = model("user", userSchema);

// exporting the User-Model
export default User;
