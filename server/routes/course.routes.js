// importing the Router from express
import { Router } from "express";
import {
  getAllCourses,
  getLecturesByCourseId,
} from "../controllers/course.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

// creating the router
const router = Router();

// creating the sub-routes of "/api/v1/user"
router.route("/").get(getAllCourses); // another-approach
router.get("/:id", isLoggedIn, getLecturesByCourseId);

// exporting the router
export default router;
