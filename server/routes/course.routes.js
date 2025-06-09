// importing the Router from express
import { Router } from "express";
import {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
} from "../controllers/course.controller.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

// creating the router
const router = Router();

router
  .route("/")
  // RULE: for every-one get all the courses details
  .get(getAllCourses) // for uploading the thumbnail-course-image
  // todo : only admin can create the course
  .post(
    isLoggedIn,
    authorizedRoles("ADMIN"),
    upload.single("thumbnail"),
    createCourse
  );

router
  .route("/:id")
  // RULE: only logged-in user get the lectures of courses
  .get(isLoggedIn, getLecturesByCourseId)
  // RULE: only ADMIN user update the course details
  .put(isLoggedIn, authorizedRoles("ADMIN"), updateCourse)
  // RULE: only logged-in user remove the courses
  .delete(isLoggedIn, removeCourse);

// exporting the router
export default router;
