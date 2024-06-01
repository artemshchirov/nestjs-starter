import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { FilterUserDto, SortUserDto } from './dto/query-user.dto';
import { AuthProviders, Prisma, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (typeof createUserDto.password !== 'string') {
      throw new Error('Password must be a string');
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);
    const createdUser = await this.usersRepository.createUser({
      ...createUserDto,
      password: hashedPassword,
    });

    return new UserEntity({
      ...createdUser,
      provider: createdUser.provider as AuthProviders,
    });
  }

  async findMany(params: Prisma.UserFindManyArgs): Promise<User[]> {
    return this.usersRepository.findMany(params);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    const where: Prisma.UserWhereInput = {};
    if (filterOptions?.roles?.length) {
      where.role = {
        id: {
          in: filterOptions.roles.map((role) => role.id),
        },
      };
    }

    const orderBy =
      sortOptions?.map((sort) => ({
        [sort.orderBy]: sort.order,
      })) || [];

    // FIXME: Consider using Prisma's `select` for better performance and to exclude sensitive fields.
    const users = await this.usersRepository.findMany({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where,
      orderBy,
    });

    return users.map(
      (user) =>
        new UserEntity({
          ...user,
          provider: user.provider as AuthProviders,
        }),
    );
  }

  async findOne(params: Prisma.UserFindUniqueArgs): Promise<User> {
    const user = await this.usersRepository.findOne(params);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserEntity(user);
  }

  async findOneByEmail(params: {
    where: Prisma.UserWhereUniqueInput;
    include?: Prisma.UserInclude;
  }): Promise<User> {
    const user = await this.usersRepository.findOneByEmail(params);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserEntity(user);
  }

  async findOneBySocialIdAndProvider(
    socialId: string,
    provider: AuthProviders,
  ): Promise<User | null> {
    return this.usersRepository.findOneBySocialIdAndProvider(
      socialId,
      provider,
    );
  }

  async update(id: User['id'], payload: UpdateUserDto): Promise<User> {
    if (payload.password) {
      payload.password = await this.hashPassword(payload.password);
    }

    return this.usersRepository.update(id, payload);
  }

  async softDelete(id: number): Promise<void> {
    await this.usersRepository.softDelete(id);
  }
}
