import Joi from "joi";

export const registerValidator = Joi.object({
  studentId: Joi.string().required().messages({
    "string.empty": "Student ID is required",
  }),
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),
  email: Joi.string()
    .email()
    .pattern(/@au\.edu$/)
    .required()
    .messages({
      "string.email": "Invalid email format",
      "string.pattern.base": "Email must be an Assumption University email",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
  }),
});

export const loginValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})
