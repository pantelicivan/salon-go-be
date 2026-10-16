import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  Matches,
} from 'class-validator';
import { Expose } from 'class-transformer';

// Static
import { MIN_PASSWORD_LENGTH, PASSWORD_REGEX } from '../../static/auth.static';

export class RegistrationRequestDTO {
  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Email' },
    },
  })
  @IsEmail(undefined, {
    context: { priority: 2, translationKey: 'emailNotValid' },
  })
  @ApiProperty({ example: 'example@gmail.com' })
  readonly email: string;

  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Password' },
    },
  })
  @MinLength(MIN_PASSWORD_LENGTH, {
    context: {
      priority: 2,
      translationKey: 'minLength',
      args: { property: 'Password', length: MIN_PASSWORD_LENGTH },
    },
  })
  @Matches(PASSWORD_REGEX, undefined, {
    context: {
      priority: 3,
      translationKey: 'isValidPassword',
      args: { property: 'Password' },
    },
  })
  @ApiProperty({ example: 'secretPassword' })
  readonly password: string;

  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'First name' },
    },
  })
  @IsString({
    context: {
      priority: 2,
      translationKey: 'isString',
      args: { property: 'First name' },
    },
  })
  @Expose({ name: 'first_name' })
  @ApiProperty({ name: 'first_name' })
  readonly firstName: string;

  @IsNotEmpty({
    context: {
      priority: 1,
      translationKey: 'isNotEmpty',
      args: { property: 'Last name' },
    },
  })
  @IsString({
    context: {
      priority: 2,
      translationKey: 'isString',
      args: { property: 'Last name' },
    },
  })
  @Expose({ name: 'last_name' })
  @ApiProperty({ name: 'last_name' })
  readonly lastName: string;
}
