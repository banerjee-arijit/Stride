import mongoose from "mongoose";

const accountDeletionFeedbackSchema = new mongoose.Schema(
  {
    userSnapshot: {
      name: {
        type: String,
        trim: true,
        maxlength: 80
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    rating: {
      type: String,
      required: true,
      trim: true,
      maxlength: 16
    }
  },
  { timestamps: true }
);

const AccountDeletionFeedback = mongoose.model("AccountDeletionFeedback", accountDeletionFeedbackSchema);

export default AccountDeletionFeedback;
