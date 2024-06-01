---
to: src/database/seeds/<%= h.inflection.transform(name, ['underscore', 'dasherize']) %>/<%= h.inflection.transform(name, ['underscore', 'dasherize']) %>-seed.module.ts
---
import { Module } from '@nestjs/common';
import { <%= name %>SeedService } from './<%= h.inflection.transform(name, ['underscore', 'dasherize']) %>-seed.service';

@Module({
  providers: [<%= name %>SeedService],
  exports: [<%= name %>SeedService],
})
export class <%= name %>SeedModule {}
