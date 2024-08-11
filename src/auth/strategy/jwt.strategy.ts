/* eslint-disable */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../repository/repository.interface';
import { JwtPayload } from '../repository/interfaces/jwt-payload.interface';
import { USER_REPOSITORY_TOKEN } from '../repository/user-repository.token';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.getByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user; // This adds the user object to the request object
  }
}
