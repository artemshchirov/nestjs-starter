import { User, Session } from '@prisma/client';

export type JwtPayloadType = Pick<User, 'id' | 'roleId'> & {
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
