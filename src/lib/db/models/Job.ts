import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  requirements: string;
  employerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
      required: true,
    },
    employerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Job: Model<IJob> =
  mongoose.models.Job ?? mongoose.model<IJob>("Job", JobSchema);

export default Job;
