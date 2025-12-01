import jwt from "jsonwebtoken";
import { sendError, sendSuccess } from "../../utils/responseHandler.js";
import messages from "../../utils/messages.js";

//user authentication middleware.

const isAuth = async (req, res, next) => {
  try {
    const { token, userId } = req.body;

    let token_decode;
    try {
      token_decode = await jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "JsonWebTokenError") {
        return sendError(res, messages.INVALID_TOKEN, 401, {
          reason: "Invalid JWT signature.",
        });
      }

      // Token expired
      if (err.name === "TokenExpiredError") {
        return sendError(res, messages.EXPIRE_TOKEN, 401);
      }

      // Other verify errors
      return sendError(res, messages.INVALID_TOKEN, 401);
    }

    if (userId !== token_decode.userId)
      return sendError(res, messages.INVALID_TOKEN, 401, {
        reason: "User ID Not Match",
      });
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export default isAuth;
