import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './vendor.entity';
import { CreateVendorDto, UpdateVendorDto } from './vendor.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {}

  findAll(userId: string): Promise<Vendor[]> {
    return this.vendorRepo.find({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<Vendor> {
    const vendor = await this.vendorRepo.findOne({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    if (vendor.userId !== userId) throw new ForbiddenException();
    return vendor;
  }

  create(userId: string, dto: CreateVendorDto): Promise<Vendor> {
    const vendor = this.vendorRepo.create({ ...dto, userId });
    return this.vendorRepo.save(vendor);
  }

  async update(id: string, userId: string, dto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findOne(id, userId);
    Object.assign(vendor, dto);
    return this.vendorRepo.save(vendor);
  }

  async remove(id: string, userId: string): Promise<void> {
    const vendor = await this.findOne(id, userId);
    await this.vendorRepo.remove(vendor);
  }
}
