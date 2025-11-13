// utils/responseHandler.js
const sendSuccess = (res, message = "Success", data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const sendError = (
  res,
  message = "Something went wrong",
  status = 400,
  details = null
) => {
  return res.status(status).json({
    success: false,
    message,
    details,
  });
};

export { sendSuccess, sendError };
