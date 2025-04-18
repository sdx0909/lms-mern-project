// accessing the Schema and model from mongoose
import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

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
// creating the userSchema-model
const User = model("user", userSchema);

// exporting the User-Model
export default User;
