/* eslint-disable */
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class SignUpDto {
    @ApiProperty({
        description: 'The email of the user',
        example: 'user@example.com'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'The password of the user',
        example: 'strongpassword123'
    })
    @IsString()
    @IsNotEmpty()
    hash: string;

    @ApiPropertyOptional({
        description: 'The first name of the user',
        example: 'John'
    })
    @IsOptional()
    @IsString()
    firstName: string;

    @ApiPropertyOptional({
        description: 'The last name of the user',
        example: 'Doe'
    })
    @IsOptional()
    @IsString()
    lastName: string;
}

