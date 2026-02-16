import { Schema, model, Document } from 'mongoose';

export interface IDistributionCategory extends Document {
  name: string;
  icon: string;
  color: string;
  defaultToteCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DistributionCategorySchema = new Schema<IDistributionCategory>({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  defaultToteCount: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model<IDistributionCategory>('DistributionCategory', DistributionCategorySchema); 