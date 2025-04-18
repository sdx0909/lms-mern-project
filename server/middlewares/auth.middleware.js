import jwt from "jsonwebtoken";
import AppError from "../utils/error.util.js";

const isLoggedIn = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new AppError("Unauthenticated, Please log in..!"), 400);
  }

  const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

  // setting the user-details in req.user body
  req.user = userDetails;

  next();
};

// exporting the isLoggedIn
export { isLoggedIn };
