import jwt from "jsonwebtoken";

//Admin authentication middleware.

const isAdmin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.json({ success: true, message: "No token provided." });
    }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    if (token_decode.role == "Admin") {
      next();
    } else {
      res.json({ message: "Sorry You don't have the access" });
    }
  } catch (error) {
    res.json({ message: error });
  }
};

export default isAdmin;
