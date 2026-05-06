import Task from "../models/Task.js";
import User from "../models/User.js";

const allowedAvatars = [
  "sunrise",
  "mint",
  "focus",
  "spark",
  "orbit",
  "bloom",
  "ember",
  "wave"
];

export const getProfile = async (req, res, next) => {
  try {
    const [completedTasks, totalTasks, weekly] = await Promise.all([
      Task.countDocuments({ userId: req.user._id, completed: true }),
      Task.countDocuments({ userId: req.user._id }),
      Task.aggregate([
        {
          $match: {
            userId: req.user._id,
            completed: true,
            completedAt: { $ne: null }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
            completed: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 7 }
      ])
    ]);

    res.json({
      user: req.user,
      stats: {
        completedTasks,
        totalTasks,
        weeklyCompleted: weekly.reverse().map((item) => ({
          date: item._id,
          completed: item.completed
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    if (!allowedAvatars.includes(avatar)) {
      return res.status(400).json({ message: "Invalid avatar selected" });
    }

    await User.updateOne({ _id: req.user._id }, { avatar });
    req.user.avatar = avatar;

    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};
