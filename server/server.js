// requiring the app module
import app from "./app.js";
import { config } from "dotenv";
config();

// declaring the PORT
const PORT = process.env.PORT || 5000;

// listening on PORT
app.listen(PORT, () => {
  console.log(`server is listening at http:localhost:${PORT}`);
});
