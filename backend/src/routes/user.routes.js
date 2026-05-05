import { Router } from "express";
import { body } from "express-validator";
import { getProfile, updateAvatar } from "../controllers/user.controller.js";
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

export default router;
