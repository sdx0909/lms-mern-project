const errorMiddleware = (err, req, res) => {
  // for handeling empty-error-messages
  err.statusCode = 500;
  err.message = "Something went wrong";

  // actual-sending the error-response
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
};

export default errorMiddleware;
