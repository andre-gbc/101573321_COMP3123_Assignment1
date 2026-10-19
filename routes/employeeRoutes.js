const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

const employeeValidation = [
  body("first_name").trim().isLength({ min: 1, max: 100 }),
  body("last_name").trim().isLength({ min: 1, max: 100 }),
  body("email").trim().isEmail().normalizeEmail(),
  body("position").trim().isLength({ min: 1, max: 100 }),
  body("salary").isFloat({ min: 0.01 }),
  body("date_of_joining").isISO8601({ strict: true }),
  body("department").trim().isLength({ min: 1, max: 100 })
];

function checkValidation(req, res, next) {
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

  next();
}

async function checkOwnership(req, res, next) {
  const id = req.params.eid || req.query.eid;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid employee ID" });
  }

  try {
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (employee.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Access forbidden" });
    }

    next();
  } catch (error) {
    next(error);
  }
}

router.get("/employees", async (req, res, next) => {
  try {
    const employees = await Employee.find({ user: req.userId });
    return res.status(200).json(employees);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/employees",
  employeeValidation,
  checkValidation,
  async (req, res, next) => {
    try {
      const employee = await Employee.create({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        position: req.body.position,
        salary: req.body.salary,
        date_of_joining: req.body.date_of_joining,
        department: req.body.department,
        user: req.userId
      });

      return res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/employees/:eid", checkOwnership, async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.eid,
      user: req.userId
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/employees/:eid",
  checkOwnership,
  employeeValidation,
  checkValidation,
  async (req, res, next) => {
    try {
      const employee = await Employee.findOneAndUpdate(
        { _id: req.params.eid, user: req.userId },
        {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          position: req.body.position,
          salary: req.body.salary,
          date_of_joining: req.body.date_of_joining,
          department: req.body.department
        },
        { new: true, runValidators: true }
      );

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      return res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/employees", checkOwnership, async (req, res, next) => {
  try {
    const employee = await Employee.findOneAndDelete({
      _id: req.query.eid,
      user: req.userId
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;