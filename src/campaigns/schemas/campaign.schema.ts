import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CampaignDocument = Campaign & Document;

@Schema()
export class Campaign {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['PREPARATION', 'INPROGRESS', 'FINISHED', 'ARCHIVED'], default: 'INPROGRESS' })
  status: string;

  @Prop({ required: true })
  clientId: string;

  @Prop({ required: true })
  objective: string;

  @Prop({ required: true })
  tool: string;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  @Prop({ required: true })
  budget: number;

  @Prop({ required: true, type: [String] })
  zones: string[];

  @Prop({ required: true })
  numberOfTrucks: number;

  @Prop({ required: true })
  numberOfFaces: number;

  @Prop({ required: true, type: [{ type: Object }] })
  data: Record<string, any>[];

  @Prop({ required: true, type: Object })
  report: Record<string, any>;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
