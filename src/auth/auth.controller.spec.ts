/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should call AuthService signUp with correct parameters', async () => {
      const dto: SignUpDto = { email: 'test@example.com', hash: 'password', firstName:"test", lastName:"ragap" };
      const result = { accessToken: 'mockedToken' };

      jest.spyOn(authService, 'signUp').mockResolvedValue(result);

      expect(await controller.signUp(dto)).toEqual(result);
      expect(authService.signUp).toHaveBeenCalledWith(dto);
    });

    it('should throw an exception if user already exists', async () => {
      const dto: SignUpDto = { email: 'test@example.com', hash: 'password',firstName:"test", lastName:"ragap" };

      jest.spyOn(authService, 'signUp').mockRejectedValue(
        new HttpException('User already exists', HttpStatus.CONFLICT),
      );

      await expect(controller.signUp(dto)).rejects.toThrow(
        new HttpException('User already exists', HttpStatus.CONFLICT),
      );
    });
  });

  describe('signIn', () => {
    it('should call AuthService signIn with correct parameters', async () => {
      const dto: SignInDto = { email: 'test@example.com', hash: 'password' };
      const result = { accessToken: 'mockedToken' };

      jest.spyOn(authService, 'signIn').mockResolvedValue(result);

      expect(await controller.signIn(dto)).toEqual(result);
      expect(authService.signIn).toHaveBeenCalledWith(dto);
    });

    it('should throw an exception if credentials are invalid', async () => {
      const dto: SignInDto = { email: 'test@example.com', hash: 'password' };

      jest.spyOn(authService, 'signIn').mockRejectedValue(
        new HttpException('Invalid email or password', HttpStatus.BAD_REQUEST),
      );

      await expect(controller.signIn(dto)).rejects.toThrow(
        new HttpException('Invalid email or password', HttpStatus.BAD_REQUEST),
      );
    });
  });
});
