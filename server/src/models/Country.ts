import { Schema, model, Document } from 'mongoose';

export interface ICountry extends Document {
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CountrySchema = new Schema<ICountry>({
  name: { type: String, required: true },
  code: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model<ICountry>('Country', CountrySchema); 