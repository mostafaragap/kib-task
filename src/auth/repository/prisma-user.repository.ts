/* eslint-disable */

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { SignUpDto } from '../dto';
import { UserRepository } from './repository.interface';
import { UserResponse } from './interfaces/UserResponse.interface';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async getByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { email } });
  }

  async createUser(data: SignUpDto): Promise<UserResponse> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        hash: data.hash,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {  id: true, 
        email: true, 
        firstName: true, 
        lastName: true,
        createdAt: true,
        updatedAt: true,
         },
    });
  }
}
