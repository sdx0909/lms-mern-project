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

// creating the sub-routes of "/api/v1/user"
// another-approach
router
  .route("/")
  .get(upload.single("thumbnail"), getAllCourses) // for uploading the thumbnail-course-image
  .post(createCourse);

router
  .route("/:id")
  .get(isLoggedIn, getLecturesByCourseId)
  .put(updateCourse)
  .delete(removeCourse);

// exporting the router
export default router;
