import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { FileEntity } from 'src/files/entities/file.entity';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { RoleEntity } from '../../roles/entities/role.entity';
import { StatusEntity } from '../../statuses/entities/status.entity';
import { AuthProviders } from '@prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'test1@example.com' })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  @Validate(IsNotExist, ['USER'], {
    message: 'emailAlreadyExists',
  })
  @IsEmail()
  email?: string | null;

  @ApiProperty()
  @IsOptional()
  @MinLength(6)
  password?: string | null;

  provider?: AuthProviders;

  socialId?: string | null;

  @ApiProperty({ example: 'John' })
  @IsOptional()
  firstName?: string | null;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  lastName?: string | null;

  @ApiProperty({ type: FileEntity })
  @IsOptional()
  @IsString()
  @Validate(IsExist, ['FileEntity', 'id'], {
    message: 'imageNotExists',
  })
  photoId?: string | null;

  @ApiProperty({ type: RoleEntity })
  @IsOptional()
  @IsInt()
  @Validate(IsExist, ['Role', 'id'], {
    message: 'roleNotExists',
  })
  roleId?: number | null;

  @ApiProperty({ type: StatusEntity })
  @IsOptional()
  @IsInt()
  @Validate(IsExist, ['Status', 'id'], {
    message: 'statusNotExists',
  })
  statusId?: number | null;

  hash?: string | null;
}
