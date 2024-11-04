import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(@InjectModel(Client.name) private clientModel: Model<ClientDocument>) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const createdClient = new this.clientModel(createClientDto);
    return createdClient.save();
  }

  async findAll(): Promise<Client[]> {
    return this.clientModel.find().exec();
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientModel.findById(id).exec();
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const existingClient = await this.clientModel.findByIdAndUpdate(id, updateClientDto, { new: true }).exec();
    if (!existingClient) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return existingClient;
  }

  async remove(id: string): Promise<Client> {
    const deletedClient = await this.clientModel.findByIdAndRemove(id).exec();
    if (!deletedClient) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return deletedClient;
  }
}
