import { ApiProperty } from '@nestjs/swagger';
import { File } from '@prisma/client';
import { Allow } from 'class-validator';

export class FileEntity implements File {
  @ApiProperty({ example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae' })
  id: string;

  @ApiProperty({ example: '/path/to/file' })
  @Allow()
  path: string;
}
