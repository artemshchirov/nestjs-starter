import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  Validate,
  IsInt,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';

import { FileEntity } from '../../files/entities/file.entity';
import { RoleEntity } from '../../roles/entities/role.entity';
import { StatusEntity } from '../../statuses/entities/status.entity';
import { AuthProviders } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'test1@example.com' })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  @Validate(IsNotExist, ['USER'], { message: 'emailAlreadyExists' })
  email: string | null;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password?: string | null;

  @IsOptional()
  @IsString()
  provider?: AuthProviders;

  @IsOptional()
  @IsString()
  socialId?: string | null;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string | null;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string | null;

  @ApiProperty({ type: () => FileEntity })
  @IsOptional()
  @IsString()
  @Validate(IsExist, ['FileEntity'], { message: 'imageNotExists' })
  photoId?: string | null;

  @ApiProperty({ type: RoleEntity })
  @IsOptional()
  @IsInt()
  @Validate(IsExist, ['Role'], { message: 'roleNotExists' })
  roleId?: number | null;

  @ApiProperty({ type: StatusEntity })
  @IsOptional()
  @IsInt()
  @Validate(IsExist, ['Status'], { message: 'statusNotExists' })
  statusId?: number | null;

  @IsOptional()
  @IsString()
  hash?: string | null;
}
