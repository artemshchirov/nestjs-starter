import { Injectable } from '@nestjs/common';
import { SessionRepository } from './session.repository';
import { Prisma, Session, User, Role } from '@prisma/client';
import { NullableType } from '../utils/types/nullable.type';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async findOne(
    where: Prisma.SessionWhereUniqueInput,
  ): Promise<NullableType<Session>> {
    return this.sessionRepository.findOne(where);
  }

  async findOneWithUser(
    where: Prisma.SessionWhereUniqueInput,
  ): Promise<
    NullableType<
      Session & { user: NullableType<User & { role: NullableType<Role> }> }
    >
  > {
    return this.sessionRepository.findOneWithUser(where);
  }

  async findMany(where: Prisma.SessionWhereInput): Promise<Session[]> {
    return this.sessionRepository.findMany(where);
  }

  async create(data: { userId: number }) {
    return this.sessionRepository.create(data);
  }

  async softDelete({
    excludeId,
    ...criteria
  }: {
    id?: Session['id'];
    user?: Pick<User, 'id'>;
    excludeId?: Session['id'];
  }): Promise<void> {
    return this.sessionRepository.softDelete({ excludeId, ...criteria });
  }
}
