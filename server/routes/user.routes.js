// importing the Router from express
import { Router } from "express";
import {
  getProfile,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

// creating the router
const router = Router();

// creating the sub-routes of "/api/v1/user"
router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", isLoggedIn, getProfile);

// exporting the router
export default router;
