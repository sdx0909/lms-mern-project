class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    // initializing the statusCode
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
