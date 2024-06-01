import { Injectable } from '@nestjs/common';
import { ForgotRepository } from './forgot.repository';
import { Forgot, Prisma, User } from '@prisma/client';

type ForgotWithUser = Forgot & {
  user: User | null;
};

@Injectable()
export class ForgotService {
  constructor(private readonly forgotRepository: ForgotRepository) {}

  async findOne(params: Prisma.ForgotFindUniqueArgs): Promise<Forgot | null> {
    return this.forgotRepository.findOne(params);
  }

  async findOneByHash(hash: string): Promise<ForgotWithUser | null> {
    return this.forgotRepository.findOneByHash(hash);
  }

  async findMany(where: Prisma.ForgotWhereInput): Promise<Forgot[]> {
    return this.forgotRepository.findMany(where);
  }

  async create(data: Prisma.ForgotCreateInput): Promise<Forgot> {
    return this.forgotRepository.create(data);
  }

  async softDelete(id: Forgot['id']): Promise<void> {
    return this.forgotRepository.softDelete(id);
  }
}
