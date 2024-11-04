import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(@InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const createdCampaign = new this.campaignModel(createCampaignDto);
    return createdCampaign.save();
  }

  async findAll(): Promise<Campaign[]> {
    return this.campaignModel.find().exec();
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(id).exec();
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return campaign;
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto): Promise<Campaign> {
    const existingCampaign = await this.campaignModel.findByIdAndUpdate(id, updateCampaignDto, { new: true }).exec();
    if (!existingCampaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return existingCampaign;
  }

  async remove(id: string): Promise<Campaign> {
    const deletedCampaign = await this.campaignModel.findByIdAndRemove(id).exec();
    if (!deletedCampaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return deletedCampaign;
  }
}
