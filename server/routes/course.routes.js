// importing the Router from express
import { Router } from "express";
import {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
} from "../controllers/course.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

// creating the router
const router = Router();

router
  .route("/")
  .get(getAllCourses) // for uploading the thumbnail-course-image
  .post(upload.single("thumbnail"), createCourse);

router
  .route("/:id")
  .get(isLoggedIn, getLecturesByCourseId)
  .put(updateCourse)
  .delete(removeCourse);

// exporting the router
export default router;
