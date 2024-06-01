import { Module } from '@nestjs/common';
import { ForgotService } from './forgot.service';
import { ForgotRepository } from './forgot.repository';

@Module({
  providers: [ForgotService, ForgotRepository],
  exports: [ForgotService],
})
export class ForgotModule {}
