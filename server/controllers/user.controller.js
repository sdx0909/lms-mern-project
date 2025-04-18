// importing the AppError
import AppError from "../utils/error.util.js";
// defining the user-controllers
const register = (req, res) => {
  const { fullName, email, password } = req.body;

  // validations
  if (!fullName || !email || !password) {
    // returns the object of AppError
    // forwarded to app.js
    return new next(AppError("All fields are required", 400));
  }
};

const login = (req, res) => {};

const logout = (req, res) => {};

const getProfile = (req, res) => {};

// exporting the controller
export { register, login, logout, getProfile };
