import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { AuthProviders, Prisma, User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findMany(params: Prisma.UserFindManyArgs): Promise<User[]> {
    return this.prisma.user.findMany(params);
  }

  async findOne(params: Prisma.UserFindUniqueArgs): Promise<User | null> {
    return this.prisma.user.findUnique(params);
  }

  async findOneByEmail(params: {
    where: Prisma.UserWhereUniqueInput;
    include?: Prisma.UserInclude;
  }): Promise<User | null> {
    return this.prisma.user.findUnique(params);
  }

  async findOneBySocialIdAndProvider(
    socialId: string,
    provider: AuthProviders,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        socialId,
        provider,
      },
    });
  }

  async update(id: User['id'], data: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        file: true,
      },
    });
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
