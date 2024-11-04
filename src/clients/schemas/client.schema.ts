import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema()
export class Client {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  logo: string;

  @Prop({ required: false, default: '' })
  siret: string;

  @Prop({ required: false })
  capital: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: false, default: '' })
  website: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'users' }] })
  users: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'campaigns' }] })
  campaigns: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'InvoiceAndContract' }] })
  invoices: InvoiceAndContract[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'InvoiceAndContract' }] })
  contracts: InvoiceAndContract[];

  @Prop({ default: Date.now, required: true })
  createdAt: Date;

  @Prop({ default: Date.now, required: true })
  updatedAt: Date;
}

@Schema()
export class InvoiceAndContract {
  @Prop({ required: true, enum: ['invoice', 'contract'] })
  type: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  link: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  amount: string;

  @Prop({ default: Date.now, required: true })
  createdAt: Date;

  @Prop({ default: Date.now, required: true })
  updatedAt: Date;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
export const InvoiceAndContractSchema = SchemaFactory.createForClass(InvoiceAndContract);
