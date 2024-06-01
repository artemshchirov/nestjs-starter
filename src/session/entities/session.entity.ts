import { Session } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SessionEntity implements Session {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2022-10-21T14:28:32.615Z' })
  createdAt: Date;

  @ApiProperty({
    required: false,
    nullable: true,
    example: '2022-10-21T14:28:32.615Z',
  })
  deletedAt: Date | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 1,
  })
  userId: number | null;
}
