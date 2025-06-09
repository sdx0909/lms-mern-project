import { raw } from "express";
import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";
import fs from "fs/promises";
import cloudinary from "cloudinary";
import { resetPassword } from "./user.controller.js";
import { log } from "console";

const getAllCourses = async (req, res, next) => {
  // finding all the data from Course-collection excepting the "lectures" details
  try {
    // we dont need of letures
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

// creating courses by admin
const createCourse = async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category || !createdBy) {
    console.log(
      `title>${title}\description>${description}\ncategory>${category}\ncreatedBy>${createdBy}`
    );
    return next(new AppError("All fields are required", 401));
  }

  const course = await Course.create({
    title,
    description,
    category,
    createdBy,
    thumbnail: {
      public_id: "Dummy",
      secure_url: "Dummy",
    },
  });

  // is course is not created
  if (!course) {
    return next(
      new AppError("Course could not be created, please try again", 400)
    );
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

      // Send the error message
      return next(
        new AppError(
          JSON.stringify(error) || "File not uploaded, please try again",
          400
        )
      );
    }
  }

  // save the course in database
  await course.save();

  // sends the success-response to user
  res.status(201).json({
    success: true,
    message: "course created successfully",
    course: course,
  });
};

// updating the courses by admin
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(
      id,
      {
        // updating/setting the new values only
        $set: req.body,
      },
      {
        // checks the new data is valid or not
        runValidators: true,
      }
    );

    if (!course) {
      return next(new AppError("course with given id does not exists", 401));
    }

    // sending the success-response
    return res.status(201).json({
      success: true,
      message: "course updated successfully",
      updatedCourse: course,
    });
  } catch (e) {
    return next(new AppError(e.message, 500));
  }
};

// removing the course by admin
const removeCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("course with given id does not exists", 401));
    }

    // delete the course
    await Course.findByIdAndDelete(id);

    res.status(201).json({
      success: true,
      message: "course deleted successfully",
    });
  } catch (e) {
    return next(new AppError(e.message, 401));
  }
};
// exporting the controllers
export {
  getAllCourses,
  getLecturesByCourseId,
  updateCourse,
  removeCourse,
  createCourse,
};
