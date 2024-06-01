---
to: src/database/seeds/<%= h.inflection.transform(name, ['underscore', 'dasherize']) %>/<%= h.inflection.transform(name, ['underscore', 'dasherize']) %>-seed.service.ts
---
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { <%= name %> } from 'src/<%= h.inflection.transform(name, ['pluralize', 'underscore', 'dasherize']) %>/entities/<%= h.inflection.transform(name, ['underscore', 'dasherize']) %>.entity';

@Injectable()
export class <%= name %>SeedService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async run() {
    const count = await this.prisma.<%= h.inflection.transform(name, ['camel', 'singularize']) %>.count();

    if (count === 0) {
      await this.prisma.<%= h.inflection.transform(name, ['camel', 'singularize']) %>.create({
        data: {}, // Заполните данные по необходимости
      });
    }
  }
}
