import jwt from "jsonwebtoken";
import AppError from "../utils/error.util.js";

const isLoggedIn = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new AppError("Unauthenticated, Please log in..!"), 400);
  }

  const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

  // setting the user-details in "req.user" body
  req.user = userDetails;

  next();
};

// for authorization of logged-in and Admin
const authorizedRoles =
  (...roles) =>
  async (req, res, next) => {
    const currentUserRole = req.user.role;
    // if role i
    if (!roles.includes(currentUserRole)) {
      return next(new AppError("You do not have permission to access", 401));
    }
    next();
  };

// exporting the isLoggedIn
export { isLoggedIn, authorizedRoles };
