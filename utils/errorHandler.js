// utils/errorHandler.js
export const globalErrorHandler = (err, req, res, next) => {
  console.error("Error:", err); // log for debugging
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
