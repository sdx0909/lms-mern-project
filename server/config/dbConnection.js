import { config } from "dotenv";
// importing the mongoose
import mongoose from "mongoose";

config();
// ignoring the strict-query-mode
mongoose.set("strictQuery", false);

// creating the connection-controller
const connectionToDB = async () => {
  try {
    const { connection } = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/lms"
    );
    if (connection) {
      console.log(`connected to MongoDB: ${connection.host}`);
    }
  } catch (err) {
    console.log(err.message);
    process.exit(1); // kill the process
  }
};

// exporting the connectionToDB
export default connectionToDB;
