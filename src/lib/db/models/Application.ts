import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  resumeText: string;
  resumeFilename: string;
  resumeFile: string;      // base64-encoded original file
  resumeMimeType: string;  // e.g. "application/pdf"
  /** ATS score 0-100, populated server-side by Gemini — never exposed to the candidate */
  score: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeText: {
      type: String,
      required: true,
    },
    resumeFilename: {
      type: String,
      default: "resume",
    },
    resumeFile: {
      type: String,
      default: "",
    },
    resumeMimeType: {
      type: String,
      default: "",
    },
    score: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// One application per candidate per job
ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

const Application: Model<IApplication> =
  mongoose.models.Application ??
  mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
