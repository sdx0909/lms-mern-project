// requiring the app module
import app from "./app.js";
import { config } from "dotenv";
import connectionToDB from "./config/dbConnection.js";
config();
import cloudinary from "cloudinary";

// declaring the PORT
const PORT = process.env.PORT || 5000;

// cloudinary-configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// listening on PORT
app.listen(PORT, async () => {
  console.log(`server is listening at http:localhost:${PORT}`);
  await connectionToDB();
});
