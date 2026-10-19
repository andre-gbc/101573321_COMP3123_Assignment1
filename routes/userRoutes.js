const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

router.post(
  "/signup",
  [
    body("username").trim().isLength({ min: 3, max: 30 }),
    body("email").trim().isEmail().normalizeEmail(),
    body("password").isLength({ min: 8, max: 72 })
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg
        }))
      });
    }

    try {
      const { username, email, password } = req.body;

      const existingUser = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Username or email already exists"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        email,
        password: hashedPassword
      });

      return res.status(201).json({
        message: "User created",
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "Username or email already exists"
        });
      }

      next(error);
    }
  }
);

router.post(
  "/login",
  [
    body("identifier").trim().notEmpty(),
    body("password").notEmpty()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg
        }))
      });
    }

    try {
      const { identifier, password } = req.body;

      const user = await User.findOne({
        $or: [
          { username: identifier },
          { email: identifier.toLowerCase() }
        ]
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          message: "Invalid credentials"
        });
      }

      const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "Login successful",
        token
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;