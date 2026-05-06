import { Router } from "express";
import { body } from "express-validator";
import { deleteAccount, getProfile, updateAchievementReward, updateAvatar } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.get("/profile", protect, getProfile);
router.patch(
  "/profile/avatar",
  protect,
  [body("avatar").isString().withMessage("Avatar is required")],
  validate,
  updateAvatar
);
router.patch(
  "/profile/reward",
  protect,
  [body("achievementReward").isString().isLength({ max: 160 }).withMessage("Reward must be 160 characters or fewer")],
  validate,
  updateAchievementReward
);
router.delete(
  "/profile",
  protect,
  [
    body("reason").isString().trim().notEmpty().withMessage("Reason is required"),
    body("feedback").optional({ values: "falsy" }).isString().isLength({ max: 1000 }).withMessage("Feedback must be 1000 characters or fewer"),
    body("rating").isString().trim().notEmpty().withMessage("Rating is required")
  ],
  validate,
  deleteAccount
);

export default router;
