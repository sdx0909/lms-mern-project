import User from "../models/user.model.js";
// importing the AppError
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

// general for all cookie-options
const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
  httpOnly: true,
  secure: true,
};

// defining the user-controllers
const register = async (req, res, next) => {
  const { fullName, email, password, role } = req.body;

  // validations
  if (!fullName || !email || !password) {
    // returns the object of AppError
    // forwarded to utility and error-middleware
    return next(new AppError("All fields are required", 400));
  }
  // finding the user is exists or not
  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new AppError("Email Already exists ", 400));
  }

  //  creating the user in 2 steps
  // 1st step : storing only basic information
  // 2nd step : profile uploading at third-party(failed) || saving finally
  const user = await User.create({
    fullName,
    email,
    password,
    role,
    avatar: {
      public_id: email,
      // default-image
      secure_url:
        "https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg",
    },
  });

  if (!user) {
    return next(
      new AppError("User registration failed, please try again", 400)
    );
  }

  console.log(`File-Details:${JSON.stringify(req.file)}`);

  // logic for file-upload
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
      });

      // if file uploaded successfully on coudinary
      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // remove file from local-systems / server
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (e) {
      return next(new AppError("failed to upload file", 500));
    }
  }

  // finally user save
  await user.save();
  // for securing the password
  user.password = undefined;

  // directly login the user
  // generating the token
  const token = await user.generateJWTToken();

  // creating the cookie
  res.cookie("token", token, cookieOptions);

  // console.log(user);
  // getting the success-response
  res.status(201).json({
    status: "success",
    message: "User registered Successfully",
    user,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  // happy-handeling in try-catch
  try {
    // validations
    if (!email || !password) {
      return next(AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    // If no user or sent password do not match then send generic response
    if (!(user && (await user.comparePassword(password)))) {
      return next(
        new AppError(
          "Email or Password do not match or user does not exist",
          401
        )
      );
    }

    // generating the token and setting in the cookie
    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie("token", token, cookieOptions);

    // lastly sending success-response
    res.status(200).json({
      success: true,
      message: "User Logged-in Successfully",
      user,
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

const logout = (req, res, next) => {
  // setting cookie as null
  res.cookie("token", null, {
    secure: true,
    httpOnly: true,
    maxAge: 0,
  });

  // success-response of logout
  return res.status(201).json({
    success: true,
    message: "User Logged-Out Successfully",
  });
};

const getProfile = async (req, res, next) => {
  try {
    // getting user from the req in middleware
    const userId = req.user.id;
    // finding the record/details
    const user = await User.findById(userId);

    // success-response of get-profile
    return res.status(200).json({
      success: true,
      message: "User Details:",
      user,
    });
  } catch (e) {
    return next(new AppError("failed to fetch the user-details", 500));
  }
};

// forgotting Password 1st STEP
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is Required"), 400);
  }
  // check the user-exists in database
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("Email not registered", 400));
  }
  // generating token
  const resetToken = await user.generatePasswordResetToken();

  // saving the data-into database
  await user.save();

  // generating he reset password-url
  // constructing a url to send the correct data
  /*
   * HERE
   * req.protocol will send if http or https
   * req.get('host') will get the hostname
   * the rest is the route that we will create to verify if token is correct or not
   */
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/reset/${resetToken}`;

  console.log(resetPasswordUrl);

  /***
   * here ... we can use following link-url when our front-end part is ready
   */
  // const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // here we need to send an email to the user with the token
  const subject = "Reset Password";
  const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;

  //
  try {
    await sendEmail(email, subject, message);

    res.status(201).json({
      success: true,
      message: `Reset password token has been sent to ${email} successfully`,
    });
  } catch (e) {
    // If some error happened we need to clear the forgotPassword* fields in our DB
    // need to be changed
    user.forgotPasswordExpiry = undefined;
    user.passwordResetToken = undefined;

    user.save();

    return next(new AppError(e.message, 400));
  }
};

// reseting the new password  2nd STEP
const resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;

  const { password } = req.body;

  // matching with enc-enc tokens from sending and recieving end
  // for that creates newly-encryted resetPasswordToken
  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // checking that encrypted-tokens mathes or not
  // with following conditions
  const user = await User.findOne({
    // forgotPasswordToken: forgotPasswordToken; OR
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  // if user is empty
  if (!user) {
    return next(
      new AppError("Token is invalid or expired, please try again", 400)
    );
  }
  // if all is good then set the new password
  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  // finally save the password with undefined-credentials
  user.save();

  // sending the success-response
  return res.status(201).json({
    success: true,
    message: "password changed Successfully",
  });
};

// if user is already logged-in then he has to change the password
const changePassword = async (req, res, next) => {
  // user inputs the old-password and new-password
  const { oldPassword, newPassword } = req.body;
  // requiring from middelware
  const { id } = req.user;

  console.log(
    `OldPassword: ${oldPassword}\n NewPassword:${newPassword}\n id:${id}`
  );
  // if user does not input any oldPassword and newPassword
  if (!oldPassword || !newPassword) {
    return next(new AppError("All fields are mandatory", 400));
  }

  // finding the user-record from database on the basis of id
  const user = await User.findById(id).select("+password");

  // user is exists or not
  if (!user) {
    return next(new AppError("User not exists", 400));
  }
  // comparing the inputted password with db-password
  const isPasswordValid = await user.comparePassword(oldPassword);
  if (!isPasswordValid) {
    return next(new AppError("Invalid Old Password", 400));
  }
  // if all doing good then
  // set the new-password
  user.password = newPassword;

  // save the record
  await user.save();
  // for security setting virtually password as undefined
  user.password = undefined;

  // sending the success-response
  return res.status(201).json({
    success: true,
    message: "Password Updates Successfully",
  });
};

// if user is already logged-in then he has to update the avatar-profile picture
const updateUser = async (req, res, next) => {
  // update the user-full-name and profile-pictures
  const { fullName } = req.body;
  const { id } = req.user;

  // console.log(`fullName(req.body):${fullName}`);
  console.log(`id:${id}`);
  const user = await User.findById(id);
  // const user = await User.findById(id).select("+password");

  if (!user) {
    return next(new AppError("User not Exists"), 400);
  }
  // if user gives the fullName as input
  if (fullName) {
    // update the user's Fullname
    user.fullName = fullName;
  }

  // if user gives the profile-picture as input in req.file
  if (req.file) {
    console.log(`User-> public_id:${user.avatar.public_id}`);
    // delete the old-picture from coudinary
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    // uploading and setting the new-profile-picture
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
      });

      // if file uploaded successfully on coudinary
      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // remove file from local-systems / server
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (e) {
      return next(new AppError("failed to upload file", 500));
    }
  }
  // finally save the information
  await user.save();

  // return the seccess-response
  return res.status(201).json({
    success: true,
    message: "Details Updated Successfully",
  });
};

// exporting the controller
export {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
};
