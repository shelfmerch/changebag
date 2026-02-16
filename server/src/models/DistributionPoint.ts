import { Schema, model, Document, Types } from 'mongoose';

export interface IDistributionPoint extends Document {
  name: string;
  cityId: Types.ObjectId;
  categoryId: Types.ObjectId;
  defaultToteCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DistributionPointSchema = new Schema<IDistributionPoint>({
  name: { type: String, required: true },
  cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'DistributionCategory', required: true },
  defaultToteCount: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model<IDistributionPoint>('DistributionPoint', DistributionPointSchema); 