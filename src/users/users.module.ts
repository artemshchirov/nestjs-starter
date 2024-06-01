import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { UsersRepository } from './users.repository';

@Module({
  controllers: [UsersController],
  providers: [IsExist, IsNotExist, UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
