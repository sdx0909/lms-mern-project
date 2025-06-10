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

// adding the lecture to course by course-id
const addLectureToCourseById = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("course with given id does not exists", 401));
    }

    if (!title || !description) {
      return next(new AppError("title and description is required", 401));
    }

    const lectureData = {};

    // if file is requested
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms", // Save files in a folder named lms
        });

        // If success
        if (result) {
          // Set the public_id and secure_url in array
          lectureData.public_id = result.public_id;
          lectureData.secure_url = result.secure_url;
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

    course.lectures.push({
      title,
      description,
      lecture: lectureData,
    });

    course.numberOfLectures = course.lectures.length;

    await course.save();

    // success response
    res.status(200).json({
      success: true,
      message: "Lecture added successfully to the course",
      course,
    });
  } catch (e) {
    return next(new AppError(e.message, 401));
  }
};

// todo: Remove the lecture from the course
// @DELETE method
// {{url}}api/v1/courses?courseId=68479c505add3569097e4411lectureId=68479c915add3569097e4416
const removeLectureFromCourse = async (req, res, next) => {
  try {
    const { courseId, lectureId } = req.query;

    console.log(`courseId > ${courseId}`);
    console.log(`lectureId > ${lectureId}`);
    // validations
    // Checking if both courseId and lectureId are present
    if (!courseId) {
      return next(new AppError("courseId is required", 400));
    }

    if (!lectureId) {
      return next(new AppError("lectureId is required", 400));
    }

    // Find the course using the courseId
    const course = await Course.findById(courseId);

    // If no course send custom message
    if (!course) {
      return next(new AppError("Invalid ID or Course does not exist.", 404));
    }

    // Find the index of the lecture using the lectureId
    const lectureIndex = course.lectures.findIndex(
      (lecture) => lecture.id.toString() === lectureId.toString()
    );

    // If returned index is -1 then send error as mentioned below
    if (lectureIndex === -1) {
      return next(new AppError("Lecture does not exist.", 404));
    }

    // Delete the lecture from cloudinary
    await cloudinary.v2.uploader.destroy(
      course.lectures[lectureIndex].lecture.public_id,
      {
        resource_type: "video",
      }
    );

    // Remove the lecture from the array
    course.lectures.splice(lectureIndex, 1);

    // update the number of lectures based on lectres array length
    course.numberOfLectures = course.lectures.length;

    // Save the course object
    await course.save();

    // Return success-response
    res.status(200).json({
      success: true,
      message: "Course lecture removed successfully",
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

// exporting the controllers
export {
  getAllCourses,
  getLecturesByCourseId,
  updateCourse,
  removeCourse,
  createCourse,
  addLectureToCourseById,
  removeLectureFromCourse,
};
