import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { PrismaService } from 'nestjs-prisma';
import { Injectable } from '@nestjs/common';

interface ValidationEntity {
  id?: number | string;
}

@Injectable()
@ValidatorConstraint({ name: 'IsNotExist', async: true })
export class IsNotExist implements ValidatorConstraintInterface {
  constructor(private readonly prismaService: PrismaService) {}

  async validate(value: any, validationArguments: ValidationArguments) {
    const modelName = validationArguments.constraints[0] as string;
    const pathToProperty = validationArguments.constraints[1];
    const currentValue = validationArguments.object as ValidationEntity;

    const whereCondition = {
      [pathToProperty]: value,
    };

    let entity;

    switch (modelName) {
      case 'Role':
        entity = await this.prismaService.role.findFirst({
          where: whereCondition,
        });
        break;
      case 'Status':
        entity = await this.prismaService.status.findFirst({
          where: whereCondition,
        });
        break;
    }

    if ((entity as ValidationEntity)?.id === currentValue?.[pathToProperty]) {
      return true;
    }

    return !entity;
  }
}
