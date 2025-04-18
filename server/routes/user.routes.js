// importing the Router from express
import { Router } from "express";
import {
  getProfile,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";

// creating the router
const router = Router();

// creating the sub-routes of "/api/v1/user"
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", getProfile);

// exporting the router
export default router;
