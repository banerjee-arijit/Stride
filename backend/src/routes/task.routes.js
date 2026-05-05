import { Router } from "express";
import { body, param, query } from "express-validator";
import { completeTask, createTask, deleteTask, getTask, getTasks, updateTask } from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();
const wordCount = (value = "") => value.trim().split(/\s+/).filter(Boolean).length;

router.use(protect);

router
  .route("/")
  .post(
    [
      body("title")
        .trim()
        .isLength({ min: 2, max: 120 })
        .withMessage("Task name is required")
        .custom((title) => wordCount(title) <= 10)
        .withMessage("Title cannot be more than 10 words"),
      body("subtitle")
        .trim()
        .isLength({ min: 2, max: 80 })
        .withMessage("Subtitle is required")
        .custom((subtitle) => wordCount(subtitle) <= 5)
        .withMessage("Subtitle cannot be more than 5 words"),
      body("description").optional().trim().isLength({ max: 5000 }),
      body("startTime").matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Start time must be HH:mm"),
      body("endTime")
        .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
        .withMessage("End time must be HH:mm")
        .custom((endTime, { req }) => endTime > req.body.startTime)
        .withMessage("End time must be after start time"),
      body("taskDate").isISO8601().withMessage("Task date must be a valid date")
    ],
    validate,
    createTask
  )
  .get(
    [
      query("date").optional().isISO8601().withMessage("Date must be valid"),
      query("view").optional().isIn(["today", "upcoming", "completed"]).withMessage("Invalid view"),
      query("search").optional().trim().isLength({ max: 80 })
    ],
    validate,
    getTasks
  );

router.patch(
  "/:id/complete",
  [param("id").isMongoId().withMessage("Invalid task id")],
  validate,
  completeTask
);

router
  .route("/:id")
  .get([param("id").isMongoId().withMessage("Invalid task id")], validate, getTask)
  .patch(
    [
      param("id").isMongoId().withMessage("Invalid task id"),
      body("title")
        .optional()
        .trim()
        .isLength({ min: 2, max: 120 })
        .withMessage("Task name must be 2-120 characters")
        .custom((title) => wordCount(title) <= 10)
        .withMessage("Title cannot be more than 10 words"),
      body("subtitle")
        .optional()
        .trim()
        .isLength({ min: 2, max: 80 })
        .withMessage("Subtitle must be 2-80 characters")
        .custom((subtitle) => wordCount(subtitle) <= 5)
        .withMessage("Subtitle cannot be more than 5 words"),
      body("description").optional().trim().isLength({ max: 5000 }),
      body("startTime").optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Start time must be HH:mm"),
      body("endTime").optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("End time must be HH:mm"),
      body("taskDate").optional().isISO8601().withMessage("Task date must be a valid date"),
      body().custom((body) => {
        if (body.startTime && body.endTime) return body.endTime > body.startTime;
        return true;
      }).withMessage("End time must be after start time")
    ],
    validate,
    updateTask
  );

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid task id")],
  validate,
  deleteTask
);

export default router;
