import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Task name is required"],
      trim: true,
      maxlength: 120
    },
    subtitle: {
      type: String,
      required: [true, "Task subtitle is required"],
      trim: true,
      maxlength: 80
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: ""
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"]
    },
    endTime: {
      type: String,
      required: [true, "End time is required"]
    },
    taskDate: {
      type: String,
      required: [true, "Task date is required"],
      index: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, taskDate: 1, completed: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
