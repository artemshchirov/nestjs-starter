import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Forgot, Prisma, User } from '@prisma/client';

type ForgotWithUser = Forgot & {
  user: User | null;
};

@Injectable()
export class ForgotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(params: Prisma.ForgotFindUniqueArgs): Promise<Forgot | null> {
    return this.prisma.forgot.findFirst(params);
  }

  async findOneByHash(hash: string): Promise<ForgotWithUser | null> {
    return this.prisma.forgot.findFirst({
      where: {
        hash,
      },
      include: {
        user: true,
      },
    });
  }

  async findMany(where: Prisma.ForgotWhereInput): Promise<Forgot[]> {
    return this.prisma.forgot.findMany({
      where,
    });
  }

  async create(data: Prisma.ForgotCreateInput): Promise<Forgot> {
    return this.prisma.forgot.create({ data });
  }

  async softDelete(id: Forgot['id']): Promise<void> {
    await this.prisma.forgot.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
