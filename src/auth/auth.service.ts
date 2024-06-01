import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import ms from 'ms';
import crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { User, Session, AuthProviders } from '@prisma/client';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { LoginResponseType } from './types/login-response.type';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { UsersService } from 'src/users/users.service';
import { SessionService } from 'src/session/session.service';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { SocialInterface } from '../social/interfaces/social.interface';
import { ForgotService } from '../forgot/forgot.service';
import { MailService } from '../mail/mail.service';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { NullableType } from '../utils/types/nullable.type';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly forgotService: ForgotService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseType> {
    const user = await this.usersService.findOneByEmail({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'notFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (user.deletedAt) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'User has been deleted',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (user.provider !== AuthProviders.EMAIL) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: `needLoginViaProvider:${user.provider}`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (!user.password) {
      throw new HttpException('needResetPassword', HttpStatus.UNAUTHORIZED);
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            password: 'incorrectPassword',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const session = await this.sessionService.create({ userId: user.id });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.roleId,
      sessionId: session.id,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  private async getTokensData(data: {
    id: User['id'];
    role: User['roleId'];
    sessionId: Session['id'];
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });
    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async validateSocialLogin(
    authProvider: AuthProviders,
    socialData: SocialInterface,
  ): Promise<LoginResponseType> {
    const socialEmail = socialData.email?.toLowerCase();

    let user = await this.usersService.findOneBySocialIdAndProvider(
      socialData.id,
      authProvider,
    );

    if (!user && socialEmail) {
      user = await this.usersService.findOneByEmail({
        where: { email: socialEmail },
      });

      if (!user) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: { email: 'emailNotFound' },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    if (user) {
      if (socialEmail && !user.email) {
        user.email = socialEmail;
      }
      await this.usersService.update(user.id, user);
    } else {
      user = await this.usersService.create({
        email: socialEmail ?? null,
        firstName: socialData.firstName ?? null,
        lastName: socialData.lastName ?? null,
        socialId: socialData.id,
        provider: authProvider,
        roleId: RoleEnum.USER,
        statusId: StatusEnum.ACTIVE,
      });
    }

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { user: 'userNotFound' },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const session = await this.sessionService.create({ userId: user.id });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.roleId,
      sessionId: session.id,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  async register(dto: AuthRegisterLoginDto): Promise<void> {
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    await this.usersService.create({
      ...dto,
      email: dto.email.toLowerCase(),
      roleId: RoleEnum.USER,
      statusId: StatusEnum.INACTIVE,
      hash,
    });

    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        hash,
      },
    });
  }

  async confirmEmail(hash: string): Promise<void> {
    const user = await this.usersService.findMany({
      where: { hash },
    });

    const foundUser = user[0];

    if (!foundUser) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'notFound',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.usersService.update(foundUser.id, {
      hash: null,
      statusId: StatusEnum.ACTIVE,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findOneByEmail({ where: { email } });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailNotExists',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    await this.forgotService.create({
      hash,
      user: {
        connect: {
          id: user.id,
        },
      },
    });

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
      },
    });
  }

  async resetPassword(hash: string, newPassword: string): Promise<void> {
    const forgot = await this.forgotService.findOneByHash(hash);

    if (!forgot) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: `notFound`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // TODO: If user was not found
    if (!forgot.user) {
      return;
    }

    const user = forgot.user;

    await this.sessionService.softDelete({
      user: {
        id: user.id,
      },
    });

    await this.usersService.update(user.id, { password: newPassword });

    await this.forgotService.softDelete(forgot.id);
  }

  async me(userJwtPayload: JwtPayloadType): Promise<User | null> {
    return this.usersService.findOne({
      where: {
        id: userJwtPayload.id,
      },
      include: {
        file: true,
      },
    });
  }

  async update(
    userJwtPayload: JwtPayloadType,
    userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    if (userDto.password) {
      if (userDto.oldPassword) {
        const currentUser = await this.usersService.findOne({
          where: { id: userJwtPayload.id },
        });

        if (!currentUser) {
          throw new HttpException(
            {
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errors: { user: 'userNotFound' },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }

        const isValidOldPassword = await bcrypt.compare(
          userDto.oldPassword,
          currentUser.password || '',
        );

        if (!isValidOldPassword) {
          throw new HttpException(
            {
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errors: { oldPassword: 'incorrectOldPassword' },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }

        await this.sessionService.softDelete({
          user: { id: currentUser.id },
          excludeId: userJwtPayload.sessionId,
        });
      } else {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: { oldPassword: 'missingOldPassword' },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { oldPassword, ...updateData } = userDto;
      console.log(
        new UserEntity(
          await this.usersService.update(userJwtPayload.id, updateData),
        ),
      );
    } catch (error) {
      console.error('Error in update method:', error);
      throw error;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { oldPassword, ...updateData } = userDto;
    return new UserEntity(
      await this.usersService.update(userJwtPayload.id, updateData),
    );
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId'>,
  ): Promise<Omit<LoginResponseType, 'user'>> {
    const session = await this.sessionService.findOneWithUser({
      id: data.sessionId,
    });

    if (!session || !session.user) {
      throw new UnauthorizedException();
    }

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: session.user.id,
      role: session.user.roleId,
      sessionId: session.id,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async softDelete(user: User): Promise<void> {
    await this.usersService.softDelete(user.id);
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return this.sessionService.softDelete({
      id: data.sessionId,
    });
  }
}
