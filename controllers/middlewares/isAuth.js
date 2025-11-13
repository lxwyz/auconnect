import jwt from "jsonwebtoken";
import { sendError, sendSuccess } from "../../utils/responseHandler.js";
import messages from "../../utils/messages.js";

//user authentication middleware.

const isAuth = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return sendError(res, messages.MISSING_TOKEN, 401);

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!req.params.id == token_decode.id)
      return sendError(res, messages.INVALID_TOKEN, 401);

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export default isAuth;
