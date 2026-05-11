import Task from "../models/Task.js";
import User from "../models/User.js";
import { todayKey, yesterdayKey } from "../utils/date.js";

const buildTaskQuery = (userId, query) => {
  const filters = { userId };

  if (query.date) filters.taskDate = query.date;
  if (query.view === "today") filters.taskDate = todayKey();
  if (query.view === "upcoming") {
    filters.taskDate = { $gt: todayKey() };
    filters.completed = false;
  }
  if (query.view === "completed") filters.completed = true;
  if (query.search) filters.title = { $regex: query.search, $options: "i" };

  return filters;
};

const findOverlappingTask = async ({ userId, taskDate, startTime, endTime, excludeTaskId }) => {
  const conflictQuery = { userId, taskDate };

  if (excludeTaskId) {
    conflictQuery._id = { $ne: excludeTaskId };
  }

  if (startTime < endTime) {
    conflictQuery.$or = [
      {
        $expr: { $lt: ["$startTime", "$endTime"] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      },
      {
        $expr: { $gte: ["$startTime", "$endTime"] },
        $or: [
          { endTime: { $gt: startTime } },
          { startTime: { $lt: endTime } }
        ]
      }
    ];
  } else {
    conflictQuery.$or = [
      {
        $expr: { $lt: ["$startTime", "$endTime"] },
        $or: [
          { startTime: { $lt: endTime } },
          { endTime: { $gt: startTime } }
        ]
      },
      {
        $expr: { $gte: ["$startTime", "$endTime"] }
      }
    ];
  }

  return Task.findOne(conflictQuery);
};

const getCurrentTimeKey = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const validateTaskTimeWindow = ({ taskDate, startTime, endTime }) => {
  if (endTime === startTime) {
    return "End time cannot be the same as start time";
  }

  if (taskDate < todayKey()) {
    return "Task date cannot be in the past";
  }

  if (taskDate === todayKey() && startTime < getCurrentTimeKey()) {
    return "You cannot create a task before the current time";
  }

  return null;
};

export const createTask = async (req, res, next) => {
  try {
    const timeValidationMessage = validateTaskTimeWindow(req.body);

    if (timeValidationMessage) {
      return res.status(400).json({ message: timeValidationMessage });
    }

    const conflictingTask = await findOverlappingTask({
      userId: req.user._id,
      taskDate: req.body.taskDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    });

    if (conflictingTask) {
      return res.status(409).json({
        message: "Another task already exists in that time range"
      });
    }

    const task = await Task.create({
      userId: req.user._id,
      title: req.body.title,
      subtitle: req.body.subtitle,
      description: req.body.description,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      taskDate: req.body.taskDate
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find(buildTaskQuery(req.user._id, req.query)).sort({
      taskDate: 1,
      startTime: 1,
      createdAt: -1
    });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const allowedFields = ["title", "subtitle", "description", "taskDate", "startTime", "endTime"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    const timeValidationMessage = validateTaskTimeWindow(task);

    if (timeValidationMessage) {
      return res.status(400).json({ message: timeValidationMessage });
    }

    const conflictingTask = await findOverlappingTask({
      userId: req.user._id,
      taskDate: task.taskDate,
      startTime: task.startTime,
      endTime: task.endTime,
      excludeTaskId: task._id
    });

    if (conflictingTask) {
      return res.status(409).json({
        message: "Another task already exists in that time range"
      });
    }

    await task.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const completeTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.completed) {
      return res.status(409).json({ message: "Task is already completed" });
    }

    task.completed = true;
    task.completedAt = new Date();
    await task.save();

    const user = await User.findById(req.user._id);
    const completionDate = task.completedAt.toISOString().slice(0, 10);

    const nextScore =
      process.env.DEMO_FORCE_SCORE_100 === "true" ? 200 : Math.min(200, user.achievementScore + 5);
    const fullCycleReached = nextScore >= 200;

    user.achievementScore = nextScore;

    if (user.lastCompletedDate !== completionDate) {
      user.streak = user.lastCompletedDate === yesterdayKey(completionDate) ? user.streak + 1 : 1;
      user.lastCompletedDate = completionDate;
    }

    let scoreReset = false;
    if (fullCycleReached) {
      user.achievementScore = 0;
      user.achievementReward = "";
      scoreReset = true;
    }

    await user.save();

    res.json({
      task,
      achievementScore: user.achievementScore,
      achievementReward: user.achievementReward,
      streak: user.streak,
      goalReached: fullCycleReached,
      scoreReset
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
