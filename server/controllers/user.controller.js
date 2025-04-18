import User from "../models/user.model.js";
// importing the AppError
import AppError from "../utils/error.util.js";
// defining the user-controllers
const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  // validations
  if (!fullName || !email || !password) {
    // returns the object of AppError
    // forwarded to utility and error-middleware
    return next(AppError("All fields are required", 400));
  }
  // finding the user is exists or not
  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(AppError("Email Already exists ", 400));
  }

  //  creating the user in 2 steps
  // 1st step : storing only basic information
  // 2nd step : profile uploading at third-party(failed) || saving finally
  const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url: "", // todo : attaching the url
    },
  });

  if (!user) {
    return next(AppError("User registration failed, please try again", 400));
  }

  // todo : file-upload

  // finally user save
  await user.save();
};

const login = (req, res) => {};

const logout = (req, res) => {};

const getProfile = (req, res) => {};

// exporting the controller
export { register, login, logout, getProfile };
