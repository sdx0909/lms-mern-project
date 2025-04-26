import { raw } from "express";
import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";
import fs from "fs/promises";
import cloudinary from "cloudinary";
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

// crating couses by admin
const createCourse = async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;
  // validations
  if (!title || !description || !category || !createdBy) {
    return next(new AppError("all fields are required"));
  }
  // creatig the course
  const course = await Course.create({
    title,
    description,
    category,
    createdBy,
    thumbnail: {
      public_id: "dummy",
      secure_url: "dummy",
    },
  });

  // if course not created
  if (!course) {
    return next(new AppError("course could not created,please try again"), 401);
  }
  // Run only if user sends a file
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms", // Save files in a folder named lms
      });

      // If success
      if (result) {
        // Set the public_id and secure_url in array
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
      }

      // After successful upload remove the file from local storage
      fs.rm(`uploads/${req.file.filename}`);
    } catch (error) {
      // Empty the uploads directory without deleting the uploads directory
      for (const file of await fs.readdir("uploads/")) {
        await fs.unlink(path.join("uploads/", file));
      }
    }
  }

  await course.save();

  // sending the success-response
  return res.status(201).json({
    success: true,
    message: "course-created successfully",
    data: course,
  });
};

// updating the courses by admin
const updateCourse = async (req, res, next) => {};

// removing the course by admin
const removeCourse = async (req, res, next) => {};
// exporting the controllers
export {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
};
