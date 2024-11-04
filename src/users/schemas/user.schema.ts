import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, enum: ['ADMIN', 'PARTNER'], default: 'PARTNER' })
  role: string;

  @Prop({ required: false, default: '' })
  phone: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, default: true })
  isFirstLogin: boolean;

  @Prop({ required: false, default: '' })
  hashedPassword: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: Schema.Types.ObjectId, ref: 'clients', required: false, default: null })
  clientId: string;

  @Prop({ default: Date.now, required: true })
  createdAt: Date;

  @Prop({ default: Date.now, required: true })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
