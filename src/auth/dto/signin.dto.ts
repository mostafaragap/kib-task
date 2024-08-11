/* eslint-disable */

import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
  @ApiProperty({
      description: 'The email of the user',
      example: 'user@example.com'
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
      description: 'The password of the user',
      example: 'strongpassword123'
  })
  @IsString()
  @IsNotEmpty()
  hash: string;
}