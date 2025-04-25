// importing the Router from express
import { Router } from "express";
import {
  getAllCourses,
  getLecturesByCourseId,
} from "../controllers/course.controller.js";

// creating the router
const router = Router();

// creating the sub-routes of "/api/v1/user"
router.route("/").get(getAllCourses); // another-approach
router.get("/:id", getLecturesByCourseId);

// exporting the router
export default router;
