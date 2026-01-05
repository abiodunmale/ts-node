import mongoose, { Schema, Document } from "mongoose";

export interface ITodo extends Document {
    title: string;
    completed: boolean;
    user?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const todoSchema: Schema<ITodo> = new Schema(
    {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, }
  },
  { timestamps: true }  
)

todoSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<ITodo>('Todo', todoSchema);