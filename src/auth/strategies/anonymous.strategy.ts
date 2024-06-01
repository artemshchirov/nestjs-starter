import { Strategy } from 'passport-anonymous';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class AnonymousStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  public validate(payload: unknown, request: unknown): unknown {
    console.log('*** Inside AnonymousStrategy validate method ***');
    console.log('Payload:', payload);
    console.log('Request:', request);

    console.log('Returning request as is.');
    return request;
  }
}
