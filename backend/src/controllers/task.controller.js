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

export const createTask = async (req, res, next) => {
  try {
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

    if (task.endTime <= task.startTime) {
      return res.status(400).json({ message: "End time must be after start time" });
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

    user.achievementScore = Math.min(100, user.achievementScore + 5);

    if (user.lastCompletedDate !== completionDate) {
      user.streak = user.lastCompletedDate === yesterdayKey(completionDate) ? user.streak + 1 : 1;
      user.lastCompletedDate = completionDate;
    }

    await user.save();

    res.json({
      task,
      achievementScore: user.achievementScore,
      streak: user.streak
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
