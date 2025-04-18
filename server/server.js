// requiring the app module
import app from "./app.js";
import { config } from "dotenv";
import connectionToDB from "./config/dbConnection.js";
config();

// declaring the PORT
const PORT = process.env.PORT || 5000;

// listening on PORT
app.listen(PORT, async () => {
  console.log(`server is listening at http:localhost:${PORT}`);
  await connectionToDB();
});
