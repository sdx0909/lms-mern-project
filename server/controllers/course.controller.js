import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";

// creating
const getAllCourses = async (req, res, next) => {
  // finding all the data from Course-collection excepting the "lectures" details
  try {
    const courses = await Course.find({}).select("-lectures");

    res.status(201).json({
      success: true,
      message: "All-Courses",
      courses,
    });
  } catch (e) {
    return next(new AppError(e.message, 401));
  }
};

const getLecturesByCourseId = async (req, res, next) => {
  try {
    // getting the couse-id from req.params
    const { id } = req.params;
    // finding the respective-course of id
    const course = await Course.findById(id);

    // validations for course
    if (!course) {
      return next(new AppError("Course not exists", 401));
    }

    res.status(201).json({
      success: true,
      message: "courses lectures fetched successfully",
      lectures: course.lectures,
    });
  } catch (e) {
    return next(new AppError(e.message, 401));
  }
};

// exporting the controllers
export { getAllCourses, getLecturesByCourseId };
