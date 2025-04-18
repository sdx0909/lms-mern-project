// requiring the express module
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import userRouter from "./routes/user.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

// creating app from express
const app = express();

// inbuilt middlewares
app.use(express.json());
app.use(
  cors({
    origin: [process.env.FRONTEND_URI],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));

// Server Status Check Route
app.get("/ping", (req, res) => {
  res.send("Pong");
});

app.get("/", (req, res) => {
  res.send("root-page");
});

// TODO: handeling random request
// handeling any random-request
// app.all("*", (req, res) => {
//   res.status(404).send("404 - Not Found");
// });
// routes of 3 modules

// for version-1 --> student
app.use("/api/v1/user", userRouter);

// for handeling custom error-handeling AppError in middleware
app.use(errorMiddleware);

// exporting the app module
export default app;
