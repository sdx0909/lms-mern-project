// importing the model and Schema from "mongoose"
import { model, Schema } from "mongoose";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      minLength: [8, "title must be atleast 8 characters"],
      maxLength: [59, "title shoud be less than 60 characteres"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "description is required"],
      minLength: [8, "description must be atleast 8 characters"],
      maxLength: [200, "title shoud be less than 200 characteres"],
    },
    category: {
      type: String,
      required: [true, "category is required"],
    },
    // course-thumbnail
    thumbnail: {
      public_id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
    // list-of-lectures
    lectures: [
      {
        title: String,
        description: String,
        // individual-lectures-thumbnail
        lecture: {
          public_id: {
            type: String,
            // required: true,
          },
          secure_url: {
            type: String,
            // required: true,
          },
        },
      },
    ],
    numberOfLectures: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// creating the model of courseSchema
const Course = model("courses", courseSchema);

// exporting the courseSchema
export default Course;
