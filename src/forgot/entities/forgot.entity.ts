import { ApiProperty } from '@nestjs/swagger';
import { Forgot } from '@prisma/client';
import { UserEntity } from '../../users/entities/user.entity';

export class ForgotEntity implements Forgot {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'somehash123' })
  hash: string;

  @ApiProperty({ type: UserEntity })
  userId: number | null;

  @ApiProperty({ example: '2022-10-21T14:48:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2022-10-21T14:48:00.000Z', required: false })
  deletedAt: Date | null;
}
