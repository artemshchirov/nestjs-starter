import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { PrismaService } from 'nestjs-prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ name: 'IsExist', async: true })
export class IsExist implements ValidatorConstraintInterface {
  constructor(private readonly prismaService: PrismaService) {}

  async validate(value: any, validationArguments: ValidationArguments) {
    console.log('\n *** Inside validate method: ***\n');
    console.log('1. Value:', value);
    console.log('2. validationArguments:', validationArguments);

    const modelName = validationArguments.constraints[0];
    const pathToProperty = validationArguments.constraints[1];

    console.log('3. Model Name:', modelName);
    console.log('4. Path To Property:', pathToProperty);

    let whereCondition;

    if (modelName === 'FileEntity' && typeof value === 'object') {
      whereCondition = { id: value.id };
    } else {
      whereCondition = {
        [pathToProperty ? pathToProperty : validationArguments.property]: value,
      };
    }

    console.log('5. Where Condition:', whereCondition);

    let entity;

    switch (modelName) {
      case 'Role':
        console.log('6.1.1 Inside Role case');
        entity = await this.prismaService.role.findFirst({
          where: whereCondition,
        });
        console.log('6.1.2 Entity in Role case:', entity);
        break;
      case 'Status':
        console.log('6.2.1 Inside Status case');
        entity = await this.prismaService.status.findFirst({
          where: whereCondition,
        });
        console.log('6.2.2 Entity in Status case:', entity);
        break;
      case 'FileEntity':
        console.log('6.3.1 Inside FileEntity case');
        entity = await this.prismaService.file.findFirst({
          where: whereCondition,
        });
        console.log('6.3.2 Entity in FileEntity case:', entity);
        break;
      case 'USER':
        console.log('6.4.1 Inside USER case');
        entity = await this.prismaService.user.findFirst({
          where: whereCondition,
        });
        console.log('6.4.2 Entity in USER case:', entity);
        break;

      default:
        console.log('6.5.1 Inside default case');
        break;
    }

    console.log('7. Final Entity:', entity);
    return Boolean(entity);
  }
}
