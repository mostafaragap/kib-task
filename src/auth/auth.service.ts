/* eslint-disable */

import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SignUpDto, SignInDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './repository/repository.interface';
import { JwtPayload } from './repository/interfaces/jwt-payload.interface';
import { USER_REPOSITORY_TOKEN } from './repository/user-repository.token';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signUp(dto: SignUpDto) {
    const existingUser = await this.userRepository.getByEmail(dto.email);
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const hash = await argon.hash(dto.hash);
    const user = await this.userRepository.createUser({
      ...dto,
      hash,
    });

    return this.signToken(user.id, user.email);
  }

  async signIn(dto: SignInDto) {
    const user = await this.userRepository.getByEmail(dto.email);
    if (!user) throw new HttpException('User not found', HttpStatus.BAD_REQUEST);

    const isPasswordMatch = await argon.verify(user.hash, dto.hash);
    if (!isPasswordMatch) {
      throw new HttpException('Invalid email or password', HttpStatus.BAD_REQUEST);
    }

    return this.signToken(user.id, user.email);
  }

  private async signToken(userId: number, email: string): Promise<{ accessToken: string }> {
    const payload: JwtPayload = { sub: userId, email };
    const token = await this.jwtService.sign(payload, {
      expiresIn: '60m',
      secret: this.config.get('JWT_SECRET'),
    });

    return { accessToken: token };
  }
}
