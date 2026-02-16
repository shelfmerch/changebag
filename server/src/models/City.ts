import { Schema, model, Document, Types } from 'mongoose';

export interface ICity extends Document {
  name: string;
  state?: string;
  countryId: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CitySchema = new Schema<ICity>({
  name: { type: String, required: true },
  state: { type: String },
  countryId: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model<ICity>('City', CitySchema); 