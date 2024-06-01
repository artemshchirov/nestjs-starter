import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('*** Inside RolesGuard canActivate method ***');

    const roles = this.reflector.getAllAndOverride<number[]>('roles', [
      context.getClass(),
      context.getHandler(),
    ]);

    console.log('Roles from metadata:', roles);

    if (!roles.length) {
      console.log('No roles defined, access granted.');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    console.log('Request user:', request.user);

    const userRoleId = request.user?.role;
    console.log('User role ID:', userRoleId);

    const hasRole = roles.includes(userRoleId);
    console.log(`User has required role: ${hasRole}`);

    return hasRole;
  }
}
