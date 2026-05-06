import Task from "../models/Task.js";
import AccountDeletionFeedback from "../models/AccountDeletionFeedback.js";
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

const getLast7Days = () => {
  const days = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - index);
    days.push(date);
  }

  return days;
};

export const getProfile = async (req, res, next) => {
  try {
    const last7Days = getLast7Days();
    const startDate = new Date(last7Days[0]);
    const endDate = new Date(last7Days[last7Days.length - 1]);
    endDate.setUTCHours(23, 59, 59, 999);

    const [completedTasks, totalTasks, weekly] = await Promise.all([
      Task.countDocuments({ userId: req.user._id, completed: true }),
      Task.countDocuments({ userId: req.user._id }),
      Task.aggregate([
        {
          $match: {
            userId: req.user._id,
            completed: true,
            completedAt: {
              $ne: null,
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
            completed: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const weeklyMap = new Map(weekly.map((item) => [item._id, item.completed]));
    const weeklyCompleted = last7Days.map((date) => {
      const dateKey = date.toISOString().slice(0, 10);
      return {
        date: dateKey,
        dayLabel: new Intl.DateTimeFormat("en", {
          weekday: "short"
        }).format(date),
        completed: weeklyMap.get(dateKey) || 0
      };
    });

    res.json({
      user: req.user,
      stats: {
        completedTasks,
        totalTasks,
        weeklyCompleted
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

export const updateAchievementReward = async (req, res, next) => {
  try {
    const achievementReward = req.body.achievementReward?.trim() || "";

    if (!achievementReward) {
      return res.status(400).json({ message: "Pledge text is required" });
    }

    if (req.user.achievementReward) {
      return res.status(409).json({ message: "Pledge is locked for this 0 to 100 cycle" });
    }

    await User.updateOne(
      { _id: req.user._id },
      { achievementReward }
    );

    req.user.achievementReward = achievementReward;

    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const reason = req.body.reason?.trim() || "";
    const feedback = req.body.feedback?.trim() || "";
    const rating = req.body.rating?.trim() || "";

    await AccountDeletionFeedback.create({
      userSnapshot: {
        name: req.user.name,
        email: req.user.email
      },
      reason,
      feedback,
      rating
    });

    await Promise.all([
      Task.deleteMany({ userId: req.user._id }),
      User.deleteOne({ _id: req.user._id })
    ]);

    res.json({ message: "Account deleted" });
  } catch (error) {
    next(error);
  }
};
